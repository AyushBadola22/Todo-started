import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"


export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? ""
    }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" } // you can define your own required field in credentials form. 
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }


        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          }
        });


        if (!user) return null;

        const isMatchedPassword = await bcrypt.compare(credentials.password, user.password ?? "");

        if (!isMatchedPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        }
      }
    })

  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.image = user.image ?? ""
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email ?? "";
        session.user.image = (token.image as string) ?? "";
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db), 
  debug: process.env.NODE_ENV === 'development', 
  pages: {
    signIn: '/signin',
  },
}

