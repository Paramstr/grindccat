// src/app/countdown/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function CountdownPage() {
  const searchParams = useSearchParams()
  const username = searchParams.get('username')
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    if (!username) {
      router.push('/')
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/test')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [username, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardContent className="text-center p-8">
            <h2 className="text-2xl text-white mb-6">Get Ready {username}!</h2>
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0">
                <Progress 
                  value={(countdown / 5) * 100} 
                  className="h-32 w-32 rounded-full"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-white">{countdown}</span>
              </div>
            </div>
            <p className="text-gray-400">
              Your test will begin shortly...
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}