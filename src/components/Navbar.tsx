'use client'

import Link from "next/link"
import { useSession,signOut } from "next-auth/react"
import { User } from "next-auth"
import { Button } from "./ui/button"


function Navbar() {
  const {data:session} = useSession()
  
  const user=session?.user

  return (
    <nav>
      <div>
        <a href="#"> Mystery Message</a>
        {
          session ?(
            <>
            <span>welcome {user?.username || user?.email }</span>
            <Button onClick={()=> signOut()}>Log out</Button>
            </>
          ):(
            <span>Please sign in</span>
          )
        }
      </div>
    </nav>
  )
}

export default Navbar