# RXpress — SaaS Starter

Landing page, pricing, and authentication portal for **RXpress** — webhook reliability for WordPress.

Built on Next.js App Router. After signup or sign-in, users are provisioned and redirected to the Laravel dashboard.

## Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL on Aiven](https://aiven.io/) via [Drizzle ORM](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/) (Checkout + Webhooks)
- **Auth**: JWT sessions (cookies)
- **Dashboard**: Laravel (external — users are redirected after auth)

## Routes

| Route | Description |
|---|---|
| `/` | SPA landing page |
| `/pricing` | Pricing page with Stripe Checkout |
| `/sign-in` | Sign in |
| `/sign-up` | Sign up |
| `/setup-password` | Set password after guest checkout |

> There is no Next.js dashboard. After any auth action, users are redirected to `LARAVEL_URL`.

## Getting Started

```bash
pnpm install
```

Copy the env file and fill in the values:

```bash
cp .env.example .env
```

Run migrations on Aiven PostgreSQL:

```bash
pnpm db:migrate
pnpm db:seed
```

Start the dev server:

```bash
pnpm dev
```

## Environment Variables

```env
POSTGRES_URL=           # Aiven PostgreSQL connection URL
AUTH_SECRET=            # Random string for JWT signing (openssl rand -base64 32)
BASE_URL=               # Public URL of this app (e.g. https://rxpress.io)
LARAVEL_URL=            # Laravel dashboard URL (users are redirected here after auth)
PROVISION_SECRET=       # Shared secret with Laravel for account provisioning
STRIPE_SECRET_KEY=      # Stripe secret key
STRIPE_WEBHOOK_SECRET=  # Stripe webhook signing secret
```

## Stripe Webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Test card: `4242 4242 4242 4242` — any future date — any CVC.

## Deployment

1. Push to GitHub
2. Deploy on Vercel (or any Node.js host)
3. Set all environment variables in your hosting dashboard
4. Set `BASE_URL` to your production domain
