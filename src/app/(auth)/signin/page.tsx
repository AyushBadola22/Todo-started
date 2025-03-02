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

  async function onSubmit(formdata: z.infer<typeof SignInSchema>) {
    signIn('credentials', formdata); 
  }

  return (
    <div className='bg-black h-screen w-screen flex items-center justify-center text-white'>
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