import { notFound } from "next/navigation";
import { getPublicLiveTest } from "@/app/actions/liveTestOps";
import LiveAccessCard from "../_components/LiveAccessCard";

export default async function LiveAccessPage({
  params,
}: {
  params: Promise<{ "test-slug": string }>;
}) {
  const { "test-slug": testSlug } = await params;
  const test = await getPublicLiveTest(testSlug);

  if (!test) {
    notFound();
  }

  return (
    <LiveAccessCard
      testSlug={testSlug}
      test={{
        name: test.name,
        description: test.description,
        subject: test.subject,
        questionsCount: test.numberOfQuestions,
        duration: test.duration ?? 0,
        ownerName: test.ownerName,
      }}
    />
  );
}
