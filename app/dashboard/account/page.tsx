'use client'

import { useSession } from '@/app/SessionContext'
import NotFound from "@/app/not-found"
import AccountPageClient from './components/AccountPageClient'


export default function AccountPage() {
  const { session } = useSession()

  if(!session) {
    return <NotFound/>
  }

  return (
    <AccountPageClient/>
  )
}
