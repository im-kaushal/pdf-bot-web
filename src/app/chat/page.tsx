'use client';

import PdfChatView from '@/components/chat/PdfChatView';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { loading: authLoading, user } = useAuthRedirect({ redirectTo: '/', condition: 'authenticated' });

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  return <PdfChatView />;
}
