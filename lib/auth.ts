import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const customAdapter = {
  ...PrismaAdapter(prisma),
  createUser: async (data) => {
    const randomPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    return prisma.user.create({
      data: {
        firstName: data.name?.split(" ")[0],
        lastName: data.name?.split(" ")[1] || "",
        email: data.email,
        image: data.image,
        password: hashedPassword,
      },
    });
  },
};




export const authOptions = {
  adapter: customAdapter,
  debug: true,
  providers: [
  CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return user;
      },
    }),

  GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: { accounts: true },
      });
      if (existingUser && !existingUser.accounts.some(a => a.provider === account.provider)) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            type: account.type,
            access_token: account.access_token,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
          },
        });

        return true;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        console.log("JWT callback:", { token, user })
        token.id = user.id
        token.provider = account.provider
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      console.log("Session callback:", { session, token });
      session.user.id = token.id
      session.user.firstName = token.firstName
      session.user.lastName = token.lastName
      session.user.provider = token.provider;
      session.user.email = token.email
      session.user.name = token.firstName
      session.user.image = token.picture
      return session
    },
  },
  pages: {
      signIn: '/auth/authorize',
      signOut: '/auth/logout',
      error: '/auth/error',
      verifyRequest: '/auth/verify-request',
      newUser: '/dashboard'
    },
  secret: process.env.NEXTAUTH_SECRET,
}
