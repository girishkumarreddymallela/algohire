'use client'

import ProtectedRoute from '@/customComponents/ProtectedRoute'
import { db } from '@/firebase/client'
import { doc, getDoc } from 'firebase/firestore'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import NoteStream from '@/customComponents/NoteStream'

interface Candidate {
  id: string
  name: string
  email: string
}

function CandidateNotesPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const candidateId = params.candidateId as string
  const highlightedNoteId = searchParams.get('note')

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!candidateId) return

    const fetchCandidate = async () => {
      const docRef = doc(db, 'candidates', candidateId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setCandidate({ id: docSnap.id, ...docSnap.data() } as Candidate)
      } else {
        setError('Candidate not found.')
      }
      setLoading(false)
    }

    fetchCandidate()
  }, [candidateId])

  if (loading) {
    return <div className="p-8">Loading candidate details...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 z-10">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">
            {candidate?.name}
          </h1>
          <p className="text-sm text-muted-foreground">{candidate?.email}</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </header>

      <main className="flex-1 overflow-hidden">
        <NoteStream
          candidateId={candidateId}
          highlightedNoteId={highlightedNoteId}
        />
      </main>
    </div>
  )
}

export default function ProtectedCandidatePage() {
  return (
    <ProtectedRoute>
      <CandidateNotesPage />
    </ProtectedRoute>
  )
}
