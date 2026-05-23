export interface LaravelProvisionResult {
  token: string;
  user: { id: number; name: string; email: string; hestia_user: string | null };
}

export async function provisionLaravelAccount(params: {
  email: string;
  password: string;
  stripeProductId?: string | null;
  planName?: string | null;
}): Promise<LaravelProvisionResult | null> {
  const url = process.env.LARAVEL_URL;
  const secret = process.env.PROVISION_SECRET;

  if (!url || !secret) {
    console.warn('[laravel] LARAVEL_URL or PROVISION_SECRET not set — skipping provisioning');
    return null;
  }

  try {
    const res = await fetch(`${url}/api/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Provision-Secret': secret
      },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
        stripe_product_id: params.stripeProductId ?? null,
        plan_name: params.planName ?? null
      })
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[laravel] Provision failed (${res.status}):`, body);
      return null;
    }

    const data = await res.json();
    console.log(
      `[laravel] Provisioned — hestia_user: ${data.user?.hestia_user}, plan: ${data.plan?.nom ?? 'none'}`
    );
    return { token: data.token, user: data.user };
  } catch (err) {
    console.error('[laravel] Provision request error:', (err as Error).message);
    return null;
  }
}
