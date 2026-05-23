import { notFound } from "next/navigation";
import { getPublicLiveTest } from "@/app/actions/liveTestOps";
import LiveSetupClient from "../_components/LiveSetupClient";

export default async function LiveSetupPage({
  params,
}: {
  params: Promise<{ "test-slug": string }>;
}) {
  const { "test-slug": testSlug } = await params;
  const test = await getPublicLiveTest(testSlug);

  if (!test) {
    notFound();
  }

  return <LiveSetupClient test={test} />;
}
