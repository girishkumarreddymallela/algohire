'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth, db } from '@/firebase/client'
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { toast } from 'sonner'

interface AppUser {
  uid: string
  email: string | null
  name: string | null
  username: string | null
}

interface AuthContextType {
  user: AppUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: User | null) => {
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userDoc.data().name,
              username: userDoc.data().username,
            })
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      },
    )
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('recipientId', '==', user.uid),

      where('createdAt', '>', new Timestamp(Date.now() / 1000, 0)),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notificationData = change.doc.data()
          toast.info(`New mention from ${notificationData.senderName}`, {
            description: `In candidate: ${notificationData.candidateName}`,
            duration: 5000,
          })
        }
      })
    })

    return () => unsubscribe()
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
