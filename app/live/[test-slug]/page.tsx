import { redirect } from "next/navigation";

export default async function LiveTestIndex({
  params,
}: {
  params: Promise<{ "test-slug": string }>;
}) {
  const { "test-slug": testSlug } = await params;

  redirect(`/live/${testSlug}/access`);
}
