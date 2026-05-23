'use server';

import { redirect } from 'next/navigation';
import {
  createCheckoutSession,
  createCustomerPortalSession,
  createGuestCheckoutSession
} from './stripe';
import { withTeam } from '@/lib/auth/middleware';

export const checkoutAction = withTeam(async (formData, team) => {
  const priceId = formData.get('priceId') as string;
  await createCheckoutSession({ team: team, priceId });
});

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});

// No auth required — account is provisioned after Stripe webhook fires
export async function guestCheckoutAction(formData: FormData) {
  const priceId = formData.get('priceId') as string;
  console.log('[guestCheckoutAction] priceId received:', priceId);
  if (!priceId) {
    console.error('[guestCheckoutAction] priceId is missing from form data');
    throw new Error('priceId is required');
  }
  // Note: redirect() inside createGuestCheckoutSession throws NEXT_REDIRECT — this is expected
  await createGuestCheckoutSession({ priceId });
}
