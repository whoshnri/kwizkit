import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";
import { sentinelClient } from "@better-auth/infra/client";


export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
    plugins: [usernameClient(), sentinelClient()],
});

export const { signIn, signUp, useSession, signOut } = authClient;