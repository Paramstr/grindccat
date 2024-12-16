import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { username, numQuestions } = await request.json()
    
    if (!username || !numQuestions) {
      return NextResponse.json(
        { error: 'Missing parameters', details: 'Username and number of questions are required' }, 
        { status: 400 }
      )
    }

    const verbalCount = Math.ceil(numQuestions / 2)
    const mathCount = numQuestions - verbalCount

    const [verbalQuestions, mathQuestions] = await Promise.all([
      supabase
        .from('random_verbal_questions')
        .select('*')
        .limit(verbalCount),
      supabase
        .from('random_math_questions')
        .select('*')
        .limit(mathCount)
    ])

    if (verbalQuestions.error || mathQuestions.error) {
      const error = verbalQuestions.error || mathQuestions.error
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error?.message }, 
        { status: 500 }
      )
    }

    if (!verbalQuestions.data?.length || !mathQuestions.data?.length) {
      return NextResponse.json(
        { error: 'No questions available', details: 'Could not fetch required number of questions' }, 
        { status: 404 }
      )
    }

    const shuffledQuestions = [
      ...verbalQuestions.data,
      ...mathQuestions.data
    ].sort(() => Math.random() - 0.5)

    return NextResponse.json({ questions: shuffledQuestions })
  } catch (error) {
    console.error('Error in questions API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
} 