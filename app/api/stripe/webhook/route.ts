export const runtime = 'nodejs';

import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, activityLogs, ActivityType } from '@/lib/db/schema';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { hashPassword, createSetupToken } from '@/lib/auth/session';
import { sendSetupEmail } from '@/lib/mail';
import { NextRequest, NextResponse } from 'next/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  console.log(`[webhook] --> ${event.type} [${event.id}]`);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleGuestCheckout(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;
    default:
      // not handled
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleGuestCheckout(session: Stripe.Checkout.Session) {
  console.log('[webhook] checkout.session.completed — metadata:', session.metadata);
  console.log('[webhook] customer_details:', session.customer_details);

  // Only handle sessions created by the guest checkout flow
  if (session.metadata?.source !== 'guest') {
    console.log('[webhook] Skipping — source is not "guest" (got:', session.metadata?.source ?? 'undefined', ')');
    return;
  }

  const email = session.customer_details?.email;
  if (!email) {
    console.error('[webhook] No email found in customer_details');
    return;
  }

  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  if (!customerId || !subscriptionId) {
    console.error('[webhook] Missing customerId or subscriptionId', { customerId, subscriptionId });
    return;
  }

  console.log('[webhook] Processing guest checkout for:', email);

  try {
    // Fetch full subscription to get product details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product']
    });

    const plan = subscription.items.data[0]?.price;
    const product = plan?.product as Stripe.Product | undefined;
    const productId = product?.id ?? null;
    const planName = product?.name ?? null;

    // ── If user already exists, just update their subscription ────────────────
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      console.log('[webhook] User already exists — updating subscription and resending setup link for:', email);
      const [member] = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, existingUser.id))
        .limit(1);

      if (member?.teamId) {
        await db
          .update(teams)
          .set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripeProductId: productId,
            planName,
            subscriptionStatus: subscription.status,
            updatedAt: new Date()
          })
          .where(eq(teams.id, member.teamId));
      }

      // Resend setup link so user can always access their account
      const token = await createSetupToken(existingUser.id);
      const setupUrl = `${process.env.BASE_URL}/setup-password?token=${encodeURIComponent(token)}`;
      console.log('[webhook] Sending setup email to existing user:', email);
      await sendSetupEmail(email, setupUrl);
      console.log('[webhook] Setup email sent to:', email);
      return;
    }

    // ── New user — create account, team, and send setup link ──────────────────
    console.log('[webhook] Creating new user for:', email);

    const tempHash = await hashPassword(crypto.randomUUID() + crypto.randomUUID());

    const [createdUser] = await db
      .insert(users)
      .values({ email, passwordHash: tempHash, role: 'owner' })
      .returning();

    if (!createdUser) {
      console.error('[webhook] Failed to insert user for:', email);
      return;
    }

    const [createdTeam] = await db
      .insert(teams)
      .values({
        name: `${email}'s Team`,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripeProductId: productId,
        planName,
        subscriptionStatus: subscription.status
      })
      .returning();

    if (!createdTeam) {
      console.error('[webhook] Failed to insert team for:', email);
      return;
    }

    await db.insert(teamMembers).values({
      userId: createdUser.id,
      teamId: createdTeam.id,
      role: 'owner'
    });

    await db.insert(activityLogs).values({
      teamId: createdTeam.id,
      userId: createdUser.id,
      action: ActivityType.SIGN_UP
    });

    const token = await createSetupToken(createdUser.id);
    const setupUrl = `${process.env.BASE_URL}/setup-password?token=${encodeURIComponent(token)}`;

    console.log('[webhook] Sending setup email to:', email);
    await sendSetupEmail(email, setupUrl);
    console.log('[webhook] Setup email sent successfully to:', email);

  } catch (err) {
    console.error('[webhook] Error in handleGuestCheckout:', err);
  }
}
