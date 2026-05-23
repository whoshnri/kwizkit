import TestMakerClient from "./TestMakerClient";

export default async function TestMakerPage({
  params,
}: {
  params: Promise<{ "test-name": string }>;
}) {
  const resolvedParams = await params;

  return <TestMakerClient testSlug={resolvedParams["test-name"]} />;
}
