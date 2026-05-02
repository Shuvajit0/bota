export const planIds = ["free", "pro", "business"] as const;

export type PlanId = (typeof planIds)[number];

export const billingStatuses = [
  "inactive",
  "trialing",
  "active",
  "past_due",
  "canceled",
] as const;

export type BillingStatus = (typeof billingStatuses)[number];

export type PlanDefinition = {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  maxMessagesPerHour: number;
  defaultModelId: string;
  allowedModelIds: string[];
  features: string[];
};

const coreModelIds = [
  "deepseek/deepseek-v3.2",
  "mistral/codestral",
  "mistral/mistral-small",
  "openai/gpt-oss-20b",
];

const allModelIds = [
  ...coreModelIds,
  "moonshotai/kimi-k2.5",
  "openai/gpt-oss-120b",
  "xai/grok-4.1-fast-non-reasoning",
];

export const planDefinitions: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    description: "For trying the product and light personal use.",
    monthlyPrice: 0,
    maxMessagesPerHour: 10,
    defaultModelId: "mistral/mistral-small",
    allowedModelIds: coreModelIds,
    features: [
      "Core multi-model chat",
      "Chat history",
      "Document tools",
      "10 messages per hour",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For builders who need stronger models and higher limits.",
    monthlyPrice: 19,
    maxMessagesPerHour: 100,
    defaultModelId: "moonshotai/kimi-k2.5",
    allowedModelIds: allModelIds,
    features: [
      "All curated models",
      "Reasoning and code models",
      "Vision-capable models",
      "100 messages per hour",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    description: "For teams that need room to scale and admin controls.",
    monthlyPrice: 49,
    maxMessagesPerHour: 500,
    defaultModelId: "moonshotai/kimi-k2.5",
    allowedModelIds: allModelIds,
    features: [
      "Everything in Pro",
      "Team-ready limits",
      "Priority model access",
      "500 messages per hour",
    ],
  },
};

export function normalizePlanId(planId: string | null | undefined): PlanId {
  return planIds.includes(planId as PlanId) ? (planId as PlanId) : "free";
}

export function normalizeBillingStatus(
  status: string | null | undefined
): BillingStatus {
  return billingStatuses.includes(status as BillingStatus)
    ? (status as BillingStatus)
    : "inactive";
}

export function getPlan(planId: string | null | undefined) {
  return planDefinitions[normalizePlanId(planId)];
}

export function canUseModel({
  planId,
  modelId,
}: {
  planId: string | null | undefined;
  modelId: string;
}) {
  return getPlan(planId).allowedModelIds.includes(modelId);
}

export function getModelForPlan({
  planId,
  requestedModelId,
}: {
  planId: string | null | undefined;
  requestedModelId: string;
}) {
  const plan = getPlan(planId);
  return plan.allowedModelIds.includes(requestedModelId)
    ? requestedModelId
    : plan.defaultModelId;
}
