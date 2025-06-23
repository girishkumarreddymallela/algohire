'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '@/firebase/client'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface Note {
  id: string
  text: string
  authorName: string
  authorId: string
  createdAt: any
}

interface UserForTagging {
  name: string
  username: string
}

export default function NoteStream({
  candidateId,
  highlightedNoteId,
}: {
  candidateId: string
  highlightedNoteId: string | null
}) {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserForTagging[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  const noteRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    const notesCollectionRef = collection(
      db,
      'candidates',
      candidateId,
      'notes',
    )
    const q = query(notesCollectionRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes: Note[] = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Note),
      )
      setNotes(fetchedNotes)
    })

    return () => unsubscribe()
  }, [candidateId])

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [notes])

  useEffect(() => {
    if (highlightedNoteId && notes.length > 0) {
      const ref = noteRefs.current.get(highlightedNoteId)
      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [highlightedNoteId, notes])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setNewNote(text)

    const cursorPos = e.target.selectionStart
    const textUpToCursor = text.substring(0, cursorPos)
    const match = textUpToCursor.match(/@(\w*)$/)

    if (match) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleUserSelect = (username: string) => {
    const text = newNote
    const cursorPos = textareaRef.current?.selectionStart || 0
    const textUpToCursor = text.substring(0, cursorPos)
    const newText =
      textUpToCursor.replace(/@(\w*)$/, `@${username} `) +
      text.substring(cursorPos)

    setNewNote(newText)
    setShowSuggestions(false)

    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim() || !user) return

    setLoading(true)
    try {
      const notesCollectionRef = collection(
        db,
        'candidates',
        candidateId,
        'notes',
      )
      await addDoc(notesCollectionRef, {
        text: newNote,
        authorId: user.uid,
        authorName: user.name,
        createdAt: serverTimestamp(),
      })
      setNewNote('')
    } catch (error) {
      console.error('Error sending note:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex-1 overflow-y-auto pr-4 mb-4">
        {notes.map((note) => {
          const isHighlighted = note.id === highlightedNoteId
          return (
            <div
              key={note.id}
              ref={(el) => {
                if (el) noteRefs.current.set(note.id, el)
              }}
              className={`flex items-start gap-4 mb-4 p-2 rounded-lg transition-colors duration-500 ${
                isHighlighted ? 'bg-sky-500/20' : ''
              }`}
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {note.authorName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="font-semibold">{note.authorName}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.text}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={endOfMessagesRef} />
      </div>

      <form
        onSubmit={handleSendNote}
        className="flex w-full items-start space-x-4"
      >
        <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
          <PopoverTrigger asChild>
            <Textarea
              ref={textareaRef}
              placeholder="Type your note here... Use @ to mention users."
              value={newNote}
              onChange={handleInputChange}
              className="min-h-[60px] flex-1 resize-none"
              required
            />
          </PopoverTrigger>

          {showSuggestions && (
            <PopoverContent className="w-[250px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Tag user..." />
                <CommandList>
                  <CommandEmpty>No user found.</CommandEmpty>
                  <CommandGroup>
                    {users.map((u) => (
                      <CommandItem
                        key={u.username}
                        value={u.username}
                        onSelect={() => handleUserSelect(u.username)}
                      >
                        {u.name}{' '}
                        <span className="text-muted-foreground ml-2">
                          @{u.username}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>

        <Button type="submit" disabled={loading || !newNote.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  )
}
