'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, MessageSquareText } from 'lucide-react';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show a toast message for logout failure
    }
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href={user ? "/chat" : "/"} className="flex items-center gap-2 text-xl font-semibold text-primary hover:opacity-80 transition-opacity">
          <MessageSquareText className="h-7 w-7" />
          <span>PDF Chat Assistant</span>
        </Link>
        {!loading && user && (
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary hover:bg-primary/10">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
