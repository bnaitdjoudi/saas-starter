'use client';

import { useActionState, useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setupPassword } from '@/app/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';

export default function SetupPasswordPage() {
  return (
    <Suspense>
      <SetupPasswordForm />
    </Suspense>
  );
}

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    setupPassword,
    { error: '' }
  );

  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!token) setExpired(true);
  }, [token]);

  if (expired || !token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold">Link invalid or expired</h1>
          <p className="mt-3 text-muted-foreground">
            This setup link is missing or has expired. Please contact support.
          </p>
          <Button asChild className="mt-6 rounded-full" variant="outline">
            <Link href="/sign-in">Go to sign in</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-cyan-500/15">
            <KeyRound className="size-6 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Set your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a password to secure your RXpress account.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="token" value={token} />

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={100}
              required
              placeholder="At least 8 characters"
              className="rounded-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={100}
              required
              placeholder="Repeat your password"
              className="rounded-full"
            />
          </div>

          {state.error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Setting up…
              </>
            ) : (
              'Set password & enter dashboard'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have a password?{' '}
          <Link href="/sign-in" className="text-cyan-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

