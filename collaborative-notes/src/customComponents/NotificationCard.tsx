'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/firebase/client'
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BellIcon } from 'lucide-react'

interface Notification {
  id: string
  senderName: string
  candidateName: string
  candidateId: string
  noteId: string
  messagePreview: string
}

export default function NotificationCard() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!user) return

    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications: Notification[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Notification),
      )
      setNotifications(fetchedNotifications)
    })

    return () => unsubscribe()
  }, [user])

  const handleNotificationClick = (notification: Notification) => {
    router.push(
      `/candidates/${notification.candidateId}?note=${notification.noteId}`,
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="grid gap-2">
          <CardTitle>My Notifications</CardTitle>
          <CardDescription>
            Mentions and updates directed at you.
          </CardDescription>
        </div>
        <BellIcon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded-lg"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    <span className="font-bold">{notif.senderName}</span>{' '}
                    mentioned you in{' '}
                    <span className="font-bold">{notif.candidateName}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    &ldquo;{notif.messagePreview}...&rdquo;
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">
              You have no new notifications.
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
