'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2 } from 'lucide-react';
import { type VariantProps } from 'class-variance-authority';
import { useFormStatus } from 'react-dom';

type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];

export function SubmitButton({ className, variant = 'outline' }: { className?: string; variant?: ButtonVariant }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={variant}
      className={cn('w-full rounded-full', className)}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
