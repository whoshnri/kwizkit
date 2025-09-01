
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// server action
export async function checkAccount(
  accountId: string
) {
  const account = await prisma.account.findFirst({
    where: {
      accountId: accountId
    }
  });

  return !!account;
  
}

export default async function page() {
  const { getAccessToken } = getKindeServerSession();
  const user = await getAccessToken();
  const exists = await checkAccount(user?.sub as string);
  if (exists) {

    redirect("/dashboard");
  }else{
    redirect("/auth/onboarding");
  }

  return (
    <>
      <p>redirecting ......</p>
    </>
  );
}
