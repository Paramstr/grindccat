import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { username, score, timeTaken, attempts } = await request.json()
    
    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('test_attempts')
      .insert([{
        username,
        score,
        time_taken: timeTaken,
        question_attempts: attempts
      }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error saving test results:', error)
    return NextResponse.json(
      { error: 'Failed to save test results', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
} 