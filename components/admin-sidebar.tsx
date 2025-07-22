'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  FileText, 
  Tags, 
  Settings, 
  LogOut, 
  Home,
  Palette,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Blog Posts', href: '/admin/posts', icon: FileText },
  { name: 'Tags', href: '/admin/tags', icon: Tags },
  { name: 'Themes', href: '/admin/themes', icon: Palette },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
