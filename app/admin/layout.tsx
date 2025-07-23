import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin-sidebar'

export const metadata: Metadata = {
  title: 'Admin Dashboard - ZodWorks',
  description: 'Blog administration interface',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authentication is handled by Cloudflare Zero Trust middleware
  // User is guaranteed to be authenticated at this point
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
