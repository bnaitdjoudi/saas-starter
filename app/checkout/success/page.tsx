import Link from 'next/link';
import { CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-500/15">
          <CheckCircle2 className="size-8 text-emerald-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Payment confirmed!</h1>
        <p className="mt-3 text-muted-foreground">
          Your subscription is active. We just sent you an email with a link to
          set your password and access your dashboard.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <Mail className="size-4 shrink-0 text-cyan-400" />
          Check your inbox — the link expires in 24 hours.
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/sign-in">I already have a password</Link>
          </Button>
          <Button asChild className="rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
            <Link href="/spa">Back to home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
