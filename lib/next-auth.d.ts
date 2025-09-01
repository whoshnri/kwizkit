import { DefaultSession, DefaultUser } from "next-auth";

// Extend the built-in session and user types
declare module "next-auth" {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the database user object.
   */
  interface User extends DefaultUser {
    provider: string;
    firstName?: string | null;
  }

  /**
   * The shape of the session object returned by `useSession`, `getSession` and `getServerSession`.
   */
  interface Session extends DefaultSession {
    user: User;
  }
}
