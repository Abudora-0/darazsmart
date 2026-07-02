import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/cache";

const credentialsSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  name: z.string().max(60).optional(),
  action: z.enum(["login", "register"]).optional(),
});

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;

async function isRateLimited(email: string): Promise<boolean> {
  try {
    const n = (await redis.get<number>(`auth:fail:${email}`)) ?? 0;
    return n >= MAX_ATTEMPTS;
  } catch {
    return false; // fail open if Redis is unavailable
  }
}

async function recordFailure(email: string) {
  try {
    const key = `auth:fail:${email}`;
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, WINDOW_SECONDS);
  } catch {
    /* ignore */
  }
}

async function clearFailures(email: string) {
  try {
    await redis.del(`auth:fail:${email}`);
  } catch {
    /* ignore */
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/signin" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
        }
        const { password, name, action } = parsed.data;
        const email = parsed.data.email.toLowerCase();

        if (await isRateLimited(email)) {
          throw new Error("Too many attempts. Please wait a few minutes.");
        }

        if (action === "register") {
          if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
            throw new Error("Password must include at least one letter and one number.");
          }
          const existing = await prisma.user.findUnique({ where: { email } });
          if (existing) throw new Error("An account with this email already exists.");
          const hashed = await bcrypt.hash(password, 12);
          return prisma.user.create({
            data: { email, password: hashed, name: name?.trim() || email.split("@")[0] },
          });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password || !(await bcrypt.compare(password, user.password))) {
          await recordFailure(email);
          return null;
        }
        await clearFailures(email);
        return user;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
