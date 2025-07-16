import { DefaultSession, DefaultUser } from "next-auth";

// Extend the built-in session and user types
declare module "next-auth" {
  /**
   * Extend the User object
   */
  interface User extends DefaultUser {
    firstName?: string | null;
    provider?: string; // ✅ Add this line
  }

  /**
   * Extend the Session object
   */
  interface Session extends DefaultSession {
    user: User;
  }
}
