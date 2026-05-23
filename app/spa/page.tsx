import {
    AlertTriangle,
    ArrowRight,
    BarChart3,
    Check,
    CheckCircle2,
    Eye,
    Layers,
    RefreshCw,
    Shield,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { guestCheckoutAction } from '@/lib/payments/actions';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from '@/app/(dashboard)/pricing/submit-button';

// Prices stay fresh for one hour
export const revalidate = 3600;

const painPoints = [
    {
        icon: AlertTriangle,
        title: 'Deliveries disappear',
        description: 'Transient outages, slow handlers, or provider timeouts can drop events without warning.'
    },
    {
        icon: RefreshCw,
        title: 'No replay control',
        description: 'When operations fail, teams need a clear way to retry, inspect, and recover safely.'
    },
    {
        icon: Shield,
        title: 'Security exposure',
        description: 'Public inbound endpoints increase attack surface and infrastructure complexity.'
    },
    {
        icon: Eye,
        title: 'No observability',
        description: 'Without delivery traces and metrics, debugging turns into guesswork.'
    }
];

const flow = [
    { step: '01', icon: Zap, title: 'Capture', text: 'Receive events from WordPress, WooCommerce, and third-party services.' },
    { step: '02', icon: Layers, title: 'Queue', text: 'Persist every message for resilient processing and controlled retries.' },
    { step: '03', icon: ArrowRight, title: 'Route', text: 'Dispatch to webhooks, CRMs, automations, or custom workers.' },
    { step: '04', icon: CheckCircle2, title: 'Acknowledge', text: 'Ack successful jobs, retry failures with backoff, reject invalid events.' }
];

const features = [
    { icon: CheckCircle2, label: 'At-least-once delivery' },
    { icon: RefreshCw, label: 'Ack / Nack / Reject lifecycle' },
    { icon: Zap, label: 'Replay failed events' },
    { icon: Shield, label: 'OAuth2 or HMAC authentication' },
    { icon: Layers, label: 'Rate limiting and backoff retries' },
    { icon: BarChart3, label: 'Operational analytics and logs' },
    { icon: Zap, label: 'Managed cloud — peak performance guaranteed' },
    { icon: Shield, label: 'Self-hosted — deploy on your own infrastructure' }
];

// Static plan definitions — priceId is injected from Stripe at render time
const PLANS = [
    {
        key: 'starter',
        name: 'Starter',
        displayPrice: '$30',
        sub: 'per month',
        badge: null as string | null,
        highlighted: false,
        points: [
            '1 user',
            'Up to 5 webhooks',
            '1 queue per webhook',
            '5,000 messages / month',
            '3 retries',
            '3 days retention',
            '1 managed WordPress site',
            'Fan-out to multiple endpoints',
            '5 GB disk storage',
            '10 GB bandwidth / month'
        ],
        stripeMatch: 'starter' as null | string
    },
    {
        key: 'pro',
        name: 'Pro',
        displayPrice: '$75',
        sub: 'per month',
        badge: 'Most popular' as string | null,
        highlighted: true,
        points: [
            '1 user',
            'Unlimited webhooks',
            '1 queue per webhook',
            '30,000 messages / month',
            '3 retries',
            '3 days retention',
            '3 managed WordPress sites',
            'Fan-out to multiple endpoints',
            '20 GB disk storage',
            '50 GB bandwidth / month'
        ],
        stripeMatch: 'base|pro|plus'
    },
    {
        key: 'business',
        name: 'Business',
        displayPrice: '$149',
        sub: 'per month',
        badge: 'Best value' as string | null,
        highlighted: false,
        points: [
            'Up to 5 users',
            'Unlimited webhooks',
            '3 queues per webhook',
            '200,000 messages / month',
            'Unlimited retries',
            '30 days retention',
            '10 managed WordPress sites',
            'Fan-out to multiple endpoints',
            '50 GB disk storage',
            '200 GB bandwidth / month',
            'Priority support'
        ],
        stripeMatch: 'business' as null | string
    },
    {
        key: 'scale',
        name: 'Scale',
        displayPrice: 'Custom',
        sub: 'Talk to us',
        badge: null,
        highlighted: false,
        points: [
            'Custom WordPress hook development',
            'Unlimited custom hooks',
            'Dedicated WordPress hosting',
            'Your own server environment',
            'Multi-tenant architecture',
            'RBAC and SSO',
            'Dedicated support',
            'SLA and audit logs'
        ],
        stripeMatch: null
    }
];

export default async function SpaLandingPage() {
    // Resolve Stripe price IDs — degrade gracefully if Stripe is not configured
    const priceIds: Record<string, string | undefined> = {};
    try {
        const [prices, products] = await Promise.all([getStripePrices(), getStripeProducts()]);
        for (const plan of PLANS) {
            if (!plan.stripeMatch) continue;
            // Use word boundaries to avoid "myproduct" matching "pro"
            const re = new RegExp(`\\b(${plan.stripeMatch})\\b`, 'i');
            // Only pick a product that actually has a recurring price
            const product = products.find(
                (p) => re.test(p.name) && prices.some((pr) => pr.productId === p.id)
            );
            if (product) {
                priceIds[plan.key] = prices.find((p) => p.productId === product.id)?.id;
            }
        }
    } catch (err) {
        console.error('[spa] Failed to fetch Stripe prices:', err);
    }

    console.log('[spa] Resolved priceIds:', priceIds);

    return (
        <main className="min-h-screen bg-background text-foreground antialiased">
            {/* Ambient background */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" />
                <div className="absolute left-0 top-1/3 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
            </div>

            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
                    <a href="#top" className="text-lg font-bold tracking-tight">
                        <span className="text-cyan-400">RX</span>press
                    </a>
                    <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
                        {['Problem', 'How it works', 'Features', 'Pricing'].map((label) => (
                            <a
                                key={label}
                                href={`#${label.toLowerCase().replace(/\s+/g, '')}`}
                                className="transition-colors hover:text-foreground"
                            >
                                {label}
                            </a>
                        ))}
                    </nav>
                    <Button asChild size="sm" className="rounded-full">
                        <a href="#pricing">Start now</a>
                    </Button>
                </div>
            </header>

            {/* ── Hero ────────────────────────────────────────────────── */}
            <section id="top" className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-2 lg:pt-28">
                <div className="flex flex-col justify-center">
                    <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        Webhook reliability for WordPress
                    </span>
                    <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                        Never lose a{' '}
                        <span className="bg-gradient-to-r from-cyan-400 to-sky-500 bg-clip-text text-transparent">
                            business event
                        </span>{' '}
                        again.
                    </h1>
                    <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                        RXpress captures WordPress and WooCommerce hooks and fans them out securely to multiple
                        webhooks — with retries, replay, and full observability. Use our high-performance
                        managed cloud or deploy on your own infrastructure.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild size="lg" className="rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                            <a href="#pricing">
                                Create workspace
                                <ArrowRight className="ml-1 size-4" />
                            </a>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="rounded-full">
                            <a href="#howitworks">See architecture</a>
                        </Button>
                    </div>
                </div>

                {/* Hero visual */}
                <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/5">
                    <div className="mb-5 flex items-center justify-between">
                        <span className="text-sm font-medium">Pipeline status</span>
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                            Healthy
                        </span>
                    </div>
                    <div className="space-y-3 text-sm">
                        {[
                            { label: 'Event captured from WooCommerce', icon: Zap, color: 'text-cyan-400' },
                            { label: 'Queued for durable processing', icon: Layers, color: 'text-sky-400' },
                            { label: 'Routed to HubSpot and internal API', icon: ArrowRight, color: 'text-violet-400' },
                            { label: 'Ack completed in 47 ms', icon: CheckCircle2, color: 'text-emerald-400' }
                        ].map(({ label, icon: Icon, color }, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
                            >
                                <Icon className={`size-4 shrink-0 ${color}`} />
                                <span className="text-muted-foreground">{label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
                </div>
            </section>

            {/* ── Pain points ─────────────────────────────────────────── */}
            <section id="Problem" className="mx-auto w-full max-w-6xl px-6 py-20">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Webhooks are powerful,{' '}
                        <span className="font-normal text-muted-foreground">but fragile.</span>
                    </h2>
                    <p className="mt-3 max-w-2xl text-muted-foreground">
                        Most teams build retry and monitoring logic too late. Production incidents then expose missing controls.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {painPoints.map(({ icon: Icon, title, description }) => (
                        <Card key={title} className="gap-3 border-border/60 bg-card/60 py-5 transition-shadow hover:shadow-md">
                            <CardHeader className="px-5 pb-0">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                                        <Icon className="size-4 text-destructive" />
                                    </span>
                                    <CardTitle className="text-base">{title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 pt-0">
                                <CardDescription>{description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ── How it works ────────────────────────────────────────── */}
            <section id="howitworks" className="mx-auto w-full max-w-6xl px-6 py-20">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
                    <p className="mt-3 text-muted-foreground">
                        Four steps from event to acknowledgment — fully observable at each stage.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {flow.map(({ step, icon: Icon, title, text }) => (
                        <Card key={step} className="gap-0 border-border/60 bg-card/60 py-5 transition-shadow hover:shadow-md">
                            <CardHeader className="px-5 pb-3">
                                <p className="font-mono text-xs font-semibold tracking-[0.2em] text-cyan-400">{step}</p>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10">
                                    <Icon className="size-5 text-cyan-400" />
                                </div>
                                <CardTitle className="text-base">{title}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pt-0">
                                <CardDescription className="text-sm leading-relaxed">{text}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ── Features ────────────────────────────────────────────── */}
            <section id="Features" className="mx-auto w-full max-w-6xl px-6 py-20">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Built for{' '}
                            <span className="bg-gradient-to-r from-cyan-400 to-sky-500 bg-clip-text text-transparent">
                                operational confidence
                            </span>
                        </h2>
                        <p className="mt-4 leading-relaxed text-muted-foreground">
                            Reliability is not only delivery. It includes recoverability, security, and clear diagnostics
                            at every layer of your pipeline.
                        </p>
                        <Button asChild className="mt-8 rounded-full" size="lg">
                            <a href="#pricing">
                                Get started free
                                <ArrowRight className="ml-1 size-4" />
                            </a>
                        </Button>
                    </div>
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {features.map(({ icon: Icon, label }) => (
                            <li
                                key={label}
                                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3.5 text-sm"
                            >
                                <Icon className="size-4 shrink-0 text-cyan-400" />
                                {label}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ── Deployment options ──────────────────────────────────── */}
            <section className="mx-auto w-full max-w-6xl px-6 py-16">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-card to-card p-8">
                        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-cyan-500/15">
                            <Zap className="size-5 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold">Managed Cloud</h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            We host RXpress for you on infrastructure tuned for low-latency event delivery.
                            No DevOps required — get maximum performance and 99.9% uptime SLA out of the box.
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            {['Globally distributed edge nodes', 'Auto-scaling under load', 'Zero maintenance for you', '99.9% uptime SLA'].map((item) => (
                                <li key={item} className="flex items-center gap-2">
                                    <Check className="size-4 shrink-0 text-cyan-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-500/10 via-card to-card p-8 shadow-md shadow-violet-500/10">
                        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-violet-500/20">
                            <Shield className="size-5 text-violet-400" />
                        </div>
                        <h3 className="text-xl font-extrabold text-violet-400">Self-Hosted</h3>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-violet-400/70">Bring your own infrastructure</p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Deploy RXpress on your own servers or private cloud. Full control over data residency,
                            network topology, and compliance requirements.
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            {['Docker / Kubernetes ready', 'Your data, your servers', 'Custom network policies', 'Enterprise support available'].map((item) => (
                                <li key={item} className="flex items-center gap-2 font-medium">
                                    <Check className="size-4 shrink-0 text-violet-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── Pricing ─────────────────────────────────────────────── */}
            <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-20">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing</h2>
                    <p className="mt-3 text-muted-foreground">No surprises. Scale at your own pace.</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-4">
                    {PLANS.map((plan) => (
                        <Card
                            key={plan.key}
                            className={`relative flex flex-col gap-0 py-0 transition-shadow hover:shadow-lg ${plan.highlighted
                                ? 'border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-card shadow-md shadow-cyan-500/10'
                                : 'border-border/60 bg-card/60'
                                }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950">
                                        {plan.badge}
                                    </span>
                                </div>
                            )}
                            <CardHeader className="px-6 pb-4 pt-8">
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <div className="mt-2 flex items-end gap-1">
                                    <span className="text-3xl font-bold text-cyan-400">{plan.displayPrice}</span>
                                    {plan.sub === 'per month' && (
                                        <span className="mb-1 text-sm text-muted-foreground">/ month</span>
                                    )}
                                </div>
                                <CardDescription>{plan.sub !== 'per month' ? plan.sub : ''}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 px-6 pb-0">
                                <ul className="space-y-2.5">
                                    {plan.points.map((point) => (
                                        <li key={point} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                            <Check className="size-4 shrink-0 text-emerald-400" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="px-6 py-6">
                                <PlanCta plan={plan} priceId={priceIds[plan.key]} />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ── CTA ─────────────────────────────────────────────────── */}
            <section id="cta" className="mx-auto w-full max-w-6xl px-6 py-20">
                <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-card to-card p-10 text-center sm:p-16">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Ready to launch your{' '}
                        <span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
                            automation layer?
                        </span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                        Start with one queue, one workflow, and one endpoint. Scale to multi-tenant routing when your usage grows.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Button asChild size="lg" className="rounded-full bg-cyan-500 px-8 text-slate-950 hover:bg-cyan-400">
                            <a href="#pricing">
                                Get started free
                                <ArrowRight className="ml-1 size-4" />
                            </a>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                            <a href="#Features">Explore features</a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <footer className="border-t border-border/60 py-8">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
                    <span>
                        <span className="font-semibold text-foreground">
                            <span className="text-cyan-400">RX</span>press
                        </span>{' '}
                        — Webhook reliability for WordPress
                    </span>
                    <span>© {new Date().getFullYear()} RXpress. All rights reserved.</span>
                </div>
            </footer>
        </main>
    );
}

// ── Plan CTA — isolé pour clarté ─────────────────────────────────────────────

type PlanDef = (typeof PLANS)[number];

function PlanCta({ plan, priceId }: { plan: PlanDef; priceId?: string }) {
    // Scale → contact
    if (plan.key === 'scale') {
        return (
            <Button asChild variant="outline" className="w-full rounded-full">
                <a href="mailto:contact@rxpress.io">Contact us</a>
            </Button>
        );
    }

    // Pro — Stripe checkout via server action
    // Si priceId est disponible on soumet le formulaire, sinon redirect sign-up
    if (priceId) {
        return (
            <form action={guestCheckoutAction} className="w-full">
                <input type="hidden" name="priceId" value={priceId} />
                <SubmitButton variant="default" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400" />
            </form>
        );
    }

    // Stripe non configuré — fallback vers inscription
    return (
        <Button asChild className="w-full rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
            <a href="/sign-up">Get started</a>
        </Button>
    );
}
