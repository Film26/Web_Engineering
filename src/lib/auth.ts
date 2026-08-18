import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { prisma } from '@/lib/prisma';

export const devLoginEnabled = process.env.ENABLE_DEV_LOGIN === 'true';
export const azureAdConfigured = Boolean(
  process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // A CredentialsProvider forces JWT sessions in NextAuth v4 (database
  // sessions aren't supported for it) — fine here, since RBAC only needs
  // the role on the token, and DAL re-checks it against the DB every
  // request anyway (see src/lib/dal.ts).
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    ...(azureAdConfigured
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID!,
            // KMUTT's Azure AD tenant is the sole authority over @kmutt.ac.th
            // addresses, so trusting it to link to an existing User row by
            // email (e.g. one seeded as SUPER_ADMIN) is safe here.
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    // Dev-only "sign in as any email" fallback so the app is testable before
    // real KMUTT SSO credentials are configured. Structurally absent (not
    // just hidden) unless ENABLE_DEV_LOGIN=true — never enable in production.
    ...(devLoginEnabled
      ? [
          CredentialsProvider({
            id: 'dev-login',
            name: 'Dev login (no SSO)',
            credentials: {
              email: { label: 'Email', type: 'email' },
            },
            async authorize(credentials) {
              const email = credentials?.email?.trim().toLowerCase();
              if (!email) return null;

              const user = await prisma.user.upsert({
                where: { email },
                update: {},
                create: { email, name: email.split('@')[0] },
              });

              return { id: user.id, email: user.email, name: user.name, role: user.role };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Re-read the role from the DB on every request rather than trusting
      // a value cached at sign-in time, so a role change (via the system
      // users admin page) takes effect immediately instead of waiting for
      // the user's session to expire and refresh.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
