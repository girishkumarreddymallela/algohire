'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/firebase/client'
import { signInWithEmailAndPassword } from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      console.log('User logged in successfully!')

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error logging in:', error)

      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.')
      } else {
        setError('Failed to log in. Please try again later.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full h-10">
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
