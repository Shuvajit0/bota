export const dynamic = "force-dynamic";
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  GaugeIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMessageCountByUserId, getUserById } from "@/lib/db/queries";
import { getPlan, normalizeBillingStatus } from "@/lib/saas/plans";

function formatDate(date: Date | null) {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [account, messageCount] = await Promise.all([
    getUserById(session.user.id),
    getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 1,
    }),
  ]);
  const plan = getPlan(account?.plan ?? session.user.plan);
  const billingStatus = normalizeBillingStatus(
    account?.billingStatus ?? session.user.billingStatus
  );

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
        <div className="flex items-center justify-between gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link href="/">
              <ArrowLeftIcon className="size-4" />
              Chat
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/pricing">Pricing</Link>
          </Button>
        </div>

        <section className="flex flex-col gap-3">
          <Badge className="w-fit" variant="outline">
            Account
          </Badge>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Account and billing
              </h1>
              <p className="max-w-2xl text-muted-foreground text-sm">
                {account?.email ?? session.user.email}
              </p>
            </div>
            <Badge className="w-fit capitalize" variant="secondary">
              {billingStatus.replace("_", " ")}
            </Badge>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <BadgeCheckIcon className="size-4" />
            </div>
            <p className="text-muted-foreground text-sm">Current plan</p>
            <h2 className="mt-1 text-2xl font-semibold">{plan.name}</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              {plan.description}
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <GaugeIcon className="size-4" />
            </div>
            <p className="text-muted-foreground text-sm">Hourly limit</p>
            <h2 className="mt-1 text-2xl font-semibold">
              {messageCount} / {plan.maxMessagesPerHour}
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Messages per hour across all chats.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <CreditCardIcon className="size-4" />
            </div>
            <p className="text-muted-foreground text-sm">Renewal</p>
            <h2 className="mt-1 text-2xl font-semibold">
              {formatDate(account?.billingPeriodEnd ?? null)}
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Billing provider integration connects here.
            </p>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="font-semibold">Included models</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {plan.allowedModelIds.map((modelId) => (
                <div
                  className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
                  key={modelId}
                >
                  {modelId}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="font-semibold">Plan features</h2>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {plan.features.map((feature) => (
                <li className="flex items-center gap-2" key={feature}>
                  <BadgeCheckIcon className="size-4 text-muted-foreground" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
