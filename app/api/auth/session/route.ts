import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncAccountFromBetterAuth } from "@/app/actions/checkAccount";

type BetterAuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

function needsOnboarding(account: {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  city: string | null;
}) {
  return !account.firstName || !account.lastName || !account.phone || !account.city;
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const authUser = session?.user as BetterAuthUser | undefined;

    if (!authUser?.id) {
      return NextResponse.json(
        {
          user: null,
          session: null,
          account: null,
          betterAuth: null,
          onboardingRequired: false,
        },
        { status: 200 }
      );
    }

    const account = await syncAccountFromBetterAuth(authUser);

    return NextResponse.json(
      {
        ...session,
        account,
        betterAuth: session,
        onboardingRequired: account ? needsOnboarding(account) : false,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("session route error:", err);
    return NextResponse.json(
      {
        user: null,
        session: null,
        account: null,
        betterAuth: null,
        onboardingRequired: false,
      },
      { status: 500 }
    );
  }
}
