// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTestStore } from '@/store/testStore'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function HomePage() {
  const [inputUsername, setInputUsername] = useState('')
  const router = useRouter()
  const { setUsername } = useTestStore()

  useEffect(() => {
    // Get username from URL if present
    const params = new URLSearchParams(window.location.search)
    const usernameParam = params.get('username')
    if (usernameParam) {
      setInputUsername(usernameParam)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputUsername.trim()) {
      setUsername(inputUsername.trim())
      router.push('/countdown')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Grind CCAT
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Practice for the Crossover Cognitive Aptitude Test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" action="/countdown" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter your username"
                  name="username"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  This will be displayed on the leaderboard
                </p>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Start Practice Test
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}