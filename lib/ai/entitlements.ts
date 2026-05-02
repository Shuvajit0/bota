import type { UserType } from "@/app/(auth)/auth";
import { getPlan, type PlanId } from "@/lib/saas/plans";

type Entitlements = {
  maxMessagesPerHour: number;
  allowedModelIds: string[];
  defaultModelId: string;
};

const guestEntitlements: Entitlements = {
  maxMessagesPerHour: 10,
  allowedModelIds: getPlan("free").allowedModelIds,
  defaultModelId: getPlan("free").defaultModelId,
};

export function getEntitlements({
  type,
  plan,
}: {
  type: UserType;
  plan?: PlanId | null;
}): Entitlements {
  if (type === "guest") {
    return guestEntitlements;
  }

  const planDefinition = getPlan(plan);

  return {
    maxMessagesPerHour: planDefinition.maxMessagesPerHour,
    allowedModelIds: planDefinition.allowedModelIds,
    defaultModelId: planDefinition.defaultModelId,
  };
}
