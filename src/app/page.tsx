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
  const [numQuestions, setNumQuestions] = useState('30')
  const [timePerQuestion, setTimePerQuestion] = useState('18')
  const router = useRouter()
  const { setUsername } = useTestStore()

  useEffect(() => {
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-white relative">
      <div className="absolute inset-0 dotted-background" aria-hidden="true" />
      <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4 gap-8 relative">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-6xl font-bold text-zinc-100">Grind CCAT</h1>
          <a 
            href="https://x.com/maybeParam" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block text-sm text-zinc-500 hover:text-zinc-300 transition-all duration-200 tracking-wide font-light hover:tracking-wider"
          >
            @maybeParam
        </a>
      </div>

        <Card className="w-full max-w-md bg-zinc-800 border-zinc-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center text-zinc-100">
              Start Test
            </CardTitle>
            <CardDescription className="text-zinc-400 text-center">
              Configure your practice session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">Username</label>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    name="username"
                    required
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                  />
                  <p className="text-xs text-zinc-400 mt-1">
                    This will be displayed on the leaderboard
                  </p>
                </div>
              </div>

              <div className="h-px bg-zinc-700" />

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">Number of Questions</label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    className="bg-zinc-700 border-zinc-600 text-white"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-400 block mb-2">Time per Question (seconds)</label>
                  <Input
                    type="number"
                    min="5"
                    max="60"
                    className="bg-zinc-700 border-zinc-600 text-white"
                    value={timePerQuestion}
                    onChange={(e) => setTimePerQuestion(e.target.value)}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-zinc-600 hover:bg-zinc-500">
                Start Practice Test
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <h3 className="font-semibold text-zinc-100">Verbal Reasoning</h3>
            <p className="text-sm text-zinc-400 mt-1">Test your vocabulary, language comprehension, and analytical thinking</p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <h3 className="font-semibold text-zinc-100">Math & Logic</h3>
            <p className="text-sm text-zinc-400 mt-1">Challenge your problem-solving abilities with numerical and logical puzzles</p>
          </div>
        </div>
      </main>
    </div>
  )
}