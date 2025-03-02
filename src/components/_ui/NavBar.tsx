"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="text-black bg-white p-4 flex justify-between items-center w-full fixed top-0 
    z-10">
      <h1 className="text-lg font-bold">TODO APP</h1>
      <Link className="text-lg font-bold" href="/">
            HOME PAGE
      </Link>

      <Link className="text-lg font-bold" href="/todo">
            Todo Page
      </Link>
      <div>
        {session ? (
          <div className="flex items-center space-x-4">
            <div className="max-w-[200px]">
              <p className="font-medium truncate">{session.user?.name}</p>
              <p className="text-gray-400 text-sm truncate">{session.user?.email}</p>
            </div>
            <Button 
              className="text-white bg-black ml-4" 
              variant="outline" 
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Link href="/signin">
            Sign In
          </Link>        
        )}
      </div>
    </nav>
  );
}