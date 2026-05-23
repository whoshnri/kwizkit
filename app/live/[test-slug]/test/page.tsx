import { notFound } from "next/navigation";
import { getPublicLiveTest } from "@/app/actions/liveTestOps";
import LiveTestClient from "../_components/LiveTestClient";

export default async function LiveTakingPage({
  params,
}: {
  params: Promise<{ "test-slug": string }>;
}) {
  const { "test-slug": testSlug } = await params;
  const test = await getPublicLiveTest(testSlug);

  if (!test) {
    notFound();
  }

  return <LiveTestClient test={test} />;
}
