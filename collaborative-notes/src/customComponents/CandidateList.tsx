'use client'

import { useState, useEffect } from 'react'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface Candidate {
  id: string
  name: string
  email: string
}

export default function CandidateList() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const q = query(collection(db, 'candidates'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const candidatesData: Candidate[] = []
      querySnapshot.forEach((doc) => {
        candidatesData.push({ id: doc.id, ...doc.data() } as Candidate)
      })
      setCandidates(candidatesData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleRowClick = (candidateId: string) => {
    router.push(`/candidates/${candidateId}`)
  }

  if (loading) {
    return <p>Loading candidates...</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidates</CardTitle>
        <CardDescription>
          A list of all candidates in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.length > 0 ? (
              candidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  onClick={() => handleRowClick(candidate.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">
                    {candidate.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {candidate.email}
                  </TableCell>
                  <TableCell className="text-right">View Notes</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No candidates found. Add one to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
