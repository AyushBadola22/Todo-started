'use client'

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

export default 
function AuthProvider({children} : {children : ReactNode}) {
  return (
    <div><SessionProvider >{children}</SessionProvider></div>
  )
}; ;
