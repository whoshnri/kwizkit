import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export async function POST(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const session = await getUser();

    if (!session || !session.id) {
      redirect("/auth?status=error");
    }
    // check if user exists
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (user) {
      redirect("/dashboard");
    } else {
      // create user
      try {
        const user = await prisma.user.create({
          data: {
            id: session.id,
            firstName: session.given_name,
            lastName: session.family_name,
            email: session.email,
            image: session.picture,
            city: session.properties?.city,
            unique_id: session.id + "-" + Date.now(),
          },
        });
        redirect("/auth/onboarding");
      } catch (e) {
        console.error("Error creating user:", e);
        redirect("/auth?status=error");
      }
    }
  } catch (err) {
    console.error("Error creating user/account:", err);
    redirect("/auth?status=error");
  }
}
