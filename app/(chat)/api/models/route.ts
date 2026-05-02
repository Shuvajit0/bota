import { auth } from "@/app/(auth)/auth";
import { getEntitlements } from "@/lib/ai/entitlements";
import { getAllGatewayModels, getCapabilities, isDemo } from "@/lib/ai/models";
import { getUserById } from "@/lib/db/queries";
import { getPlan } from "@/lib/saas/plans";

export async function GET() {
  const headers = {
    "Cache-Control": "private, max-age=300",
  };

  const [session, curatedCapabilities] = await Promise.all([
    auth(),
    getCapabilities(),
  ]);
  const account = session?.user ? await getUserById(session.user.id) : null;
  const entitlements = session?.user
    ? getEntitlements({
        type: session.user.type,
        plan: account?.plan ?? session.user.plan,
      })
    : {
        allowedModelIds: getPlan("free").allowedModelIds,
        defaultModelId: getPlan("free").defaultModelId,
        maxMessagesPerHour: getPlan("free").maxMessagesPerHour,
      };
  const payloadEntitlements = {
    plan: account?.plan ?? session?.user?.plan ?? "free",
    allowedModelIds: entitlements.allowedModelIds,
    defaultModelId: entitlements.defaultModelId,
    maxMessagesPerHour: entitlements.maxMessagesPerHour,
  };

  if (isDemo) {
    const models = await getAllGatewayModels();
    const capabilities = Object.fromEntries(
      models.map((m) => [m.id, curatedCapabilities[m.id] ?? m.capabilities])
    );

    return Response.json(
      { capabilities, entitlements: payloadEntitlements, models },
      { headers }
    );
  }

  return Response.json(
    { capabilities: curatedCapabilities, entitlements: payloadEntitlements },
    { headers }
  );
}
