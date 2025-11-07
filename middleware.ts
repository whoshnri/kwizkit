import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest, NextResponse } from "next/server";

// export default withAuth(
//   async function middleware(req: NextRequest) {
//   },
//   {
//     publicPaths: ["/","/pricing", "/auth","/auth/onboarding", "/privacy-policy", "/terms", "/support", "/prelaunch", "/account", "", ""],
//   }
// );

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const allowedPaths = [
    '/prelaunch', "/privacy-policy", "/support", "/terms-and-conditions" , "/pricing"
  ]

  if (!allowedPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/prelaunch", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}