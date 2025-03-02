# NextAuth.js Setup Guide

This guide provides a structured approach to setting up NextAuth.js in a Next.js application with TypeScript. It covers:

- Installation and configuration
- TypeScript setup
- Database models
- Authentication API routes
- Sign-in and sign-out methods
- Session handling (client & server)

---

## 1. Installation

Install the necessary dependencies:

```bash
npm install next-auth
npm install @prisma/client @next-auth/prisma-adapter
```

---

## 2. TypeScript Configuration

### Custom Types

Define authentication-related types in `src/types/auth.d.ts` so that you can extend what default session.user can store :

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email : string; 
      image? : string; 
    } & DefaultSession["user"];
  }
}
```

---

## 3. Database Models

If using Prisma, update `schema.prisma` to include authentication models:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

enum Role {
  USER 
  ADMIN
}

model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String?
  password      String?
  email         String?  @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  role          Role  @default(USER)
  todos         Todo[]
} 

model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String @db.ObjectId
  type              String
  provider          String
  providerAccountId String  
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}
```

After updating the schema, apply the changes:

```bash
npx prisma generate
npx prisma db push
```

---

## 4. Authentication API Route

Create the API route in the appropriate location , `src/app/api/auth/[...nextauth]/route.ts`

Define auth options and use in route.ts. 

```typescript
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


```
```typescript
import { authOptions } from "@/lib/options";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

---

## 5. Environment Variables

Configure authentication and database environment variables in `.env`:

```env
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=

NEXTAUTH_SECRET=

DATABASE_URL=
```

---

## 6. Provider Setup

Each provider requires specific configurations. Example: **GitHub Provider**

1. Go to GitHub Developer Settings: `https://github.com/settings/developers`
2. Create a new OAuth App
3. Set the callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to the `.env` file

---

## 7. Authentication Methods

### Sign In Page
Focus on the lines with '**' which are actually important.  

```typescript
"use client";

import { SignInSchema } from '@/zod-schemas/sign-in-schema';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from 'next/image';
import Link from "next/link";

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/protected-page')
    }
  }, [status, router]);


  const form = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  /**
  |--------------------------------------------------
  | Next auth sign in with credentials 
  |--------------------------------------------------
  */
  async function onSubmit(formdata: z.infer<typeof SignInSchema>) {
    signIn('credentials', formdata); 
  }

  return (
    <div className='bg-black h-screen w-screen flex items-center justify-center text-white'>

    {/**
    |---------------------------------------------------------------------
    | Form in shadcn ui , which uses useForm hooks and manage states themselves.
    |---------------------------------------------------------------------
    */
    }

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-black text-white border border-white p-8 rounded-xl w-96 space-y-6">
          <h1 className='font-bold text-2xl text-center'>Sign in</h1>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input className="bg-black border-white text-white" type='email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input className="bg-black border-white text-white" type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className='w-full'> Submit</Button>

          <div className="flex items-center justify-center space-x-2">
            <div className="w-full h-px bg-white"></div>
            <p className="text-white text-sm">OR</p>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className='flex flex-col space-y-3'>
          
            {
              /**
              |--------------------------------------------------
              | On click sign in with google and github
              |--------------------------------------------------
              */
            }
            <Button type='button' onClick={()=> signIn('google')}>
              <Image src="/google-icon.png" alt="Google" width={20} height={20} />
              Sign in with Google 
            </Button>
            <Button type='button' onClick={()=>signIn('github')} >
              <Image src="/github-icon.png" alt="GitHub" width={20} height={20} />
              Sign in with GitHub
            </Button>
          </div>

          <p className='text-center'>New here , <Link href='/signup' className='text-blue-200'>Sign up</Link></p>
        </form>
      </Form>
    </div>
  );
}
```

### Sign Out

```html
    <button onClick={() => signOut()}> Sign Out </button>
```

---

## 8. Session Handling

### Client Components
Wrap the root layout with Session Provider to be able to use `useSession` hook. In our case we created a seperate file AuthProvider which internally used the Session Provider and wraps the Children of the root layout.


`AuthProvider.tsx`

```typescript
'use client'

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

export default 
function AuthProvider({children} : {children : ReactNode}) {
  return (
    <div><SessionProvider >{children}</SessionProvider></div>
  )
}; ;

```

`layout.tsx`

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/_ui/AuthProvider";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"  >
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

```


After wrapping with session provider , you can access session anywhere in the client side with `useSession` hook.
```typescript
'use client'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react';

export default function ProtectedPage() {
  cblock
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin');
    }
  }, [status, session, router]);


  if (status === 'loading') {
    return (
      <div className='bg-background h-screen w-screen flex items-center justify-center backdrop-blur-2xl'>
        <div className="flex flex-col items-center gap-2">
          <Loader className='animate-spin h-8 w-8' />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <h1>Your App</h1>
  )
}
```

### Server Components
For server side we have `getServerSession` hook.  


#### Example  

```typescript
import { authOptions } from "@/lib/options";
import type { Context, Next } from "hono";
import { getServerSession } from "next-auth";

export const authMiddleware = async function (c : Context , next : Next) {
    try {
        /**
        |--------------------------------------------------
        | Pass auth options to getServerSession hook.
        | It gives you session of the user if he signed in. 
        |--------------------------------------------------
        */

        const session = await getServerSession(authOptions); 

        if(!session || !session.user){
            return c.json({message : "Unauthorized access , try login first"}, {status : 401});
        }
        c.set('user', session.user); 
        await next(); 
    } catch (error) {
        console.error("error in auth middlware", error); 
        return c.json({error : "Internal server error"}, {status : 500})
    }
}
```

---
