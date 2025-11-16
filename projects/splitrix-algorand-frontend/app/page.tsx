"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard on root page
    router.push('/dashboard')
  }, [router])

  return (
    <div className="flex h-screen bg-background items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
