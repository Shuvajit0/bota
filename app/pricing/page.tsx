import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { auth } from "@/app/(auth)/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { planDefinitions } from "@/lib/saas/plans";

const plans = Object.values(planDefinitions);

export default async function PricingPage() {
  const session = await auth();
  const currentPlanId = session?.user?.plan ?? "free";

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
        <div className="flex items-center justify-between gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link href="/">
              <ArrowLeftIcon className="size-4" />
              Chat
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/account">Account</Link>
          </Button>
        </div>

        <section className="flex flex-col gap-3">
          <Badge className="w-fit" variant="outline">
            Pricing
          </Badge>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Plans for a multi-model AI workspace
            </h1>
            <p className="mt-3 text-muted-foreground text-sm">
              Start with core chat, then unlock higher limits and premium model
              access as usage grows.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;

            return (
              <div
                className="flex rounded-lg border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
                key={plan.id}
              >
                <div className="flex w-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">{plan.name}</h2>
                      <p className="mt-1 min-h-12 text-muted-foreground text-sm">
                        {plan.description}
                      </p>
                    </div>
                    {isCurrent && <Badge variant="secondary">Current</Badge>}
                  </div>

                  <div>
                    <span className="text-3xl font-semibold">
                      ${plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /month
                    </span>
                  </div>

                  <Button
                    asChild={!isCurrent}
                    disabled={isCurrent}
                    variant={isCurrent ? "secondary" : "default"}
                  >
                    {isCurrent ? (
                      <span>Current plan</span>
                    ) : (
                      <Link href="/account">Choose {plan.name}</Link>
                    )}
                  </Button>

                  <ul className="flex flex-col gap-2 text-sm">
                    {plan.features.map((feature) => (
                      <li className="flex items-center gap-2" key={feature}>
                        <CheckIcon className="size-4 text-muted-foreground" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
