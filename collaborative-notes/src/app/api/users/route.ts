import { db } from '@/firebase/client'
import { collection, getDocs } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export const revalidate = 60

export async function GET() {
  try {
    const usersCollection = collection(db, 'users')
    const userSnapshot = await getDocs(usersCollection)

    const users = userSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        name: data.name,
        username: data.username,
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    )
  }
}
