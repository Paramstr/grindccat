import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const attempt = await request.json()
    
    if (!attempt.username || !attempt.test_attempt_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('attempts')
      .insert([{
        username: attempt.username,
        question_id: attempt.questionId,
        question_text: attempt.questionText,
        options: attempt.options,
        user_answer: Number(attempt.userAnswer),
        correct_answer: Number(attempt.correctAnswer),
        time_spent: attempt.timeSpent,
        is_correct: attempt.isCorrect,
        category: attempt.category,
        explanation: attempt.explanation,
        test_attempt_id: attempt.test_attempt_id
      }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error saving attempt:', error)
    return NextResponse.json(
      { error: 'Failed to save attempt', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
} 