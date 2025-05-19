'use client';

import { useState, useRef, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { pdfQuery } from '@/ai/flows/pdf-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Paperclip, Send, FileText, User, Bot } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function PdfChatView() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a PDF file.' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ variant: 'destructive', title: 'File Too Large', description: 'Please upload a PDF smaller than 10MB.' });
        return;
      }
      setIsUploading(true);
      setError(null);
      setMessages([]); // Clear previous chat on new PDF
      try {
        const dataUri = await fileToDataUri(file);
        setPdfFile(file);
        setPdfDataUri(dataUri);
        toast({ title: 'PDF Uploaded', description: `${file.name} is ready for questions.` });
      } catch (e) {
        console.error('Error converting file to data URI:', e);
        toast({ variant: 'destructive', title: 'Upload Error', description: 'Could not process the PDF file.' });
        setError('Could not process the PDF file.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentQuestion.trim() || !pdfDataUri || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: currentQuestion.trim(),
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setCurrentQuestion('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await pdfQuery({ pdfDataUri, question: newUserMessage.content });
      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: result.answer,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (err: any) {
      console.error('Error querying PDF:', err);
      const errorMessage = err.message || 'Failed to get an answer. Please try again.';
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Query Error', description: errorMessage });
       const assistantErrorMessage: Message = {
        id: Date.now().toString() + '-assistant-error',
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, assistantErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto bg-card shadow-2xl rounded-lg overflow-hidden">
      <CardHeader className="bg-primary/10 p-4 border-b">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary flex items-center">
              <FileText className="mr-2 h-6 w-6" />
              Chat with your PDF
            </h2>
            <Button onClick={triggerFileInput} variant="outline" size="sm" disabled={isUploading}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paperclip className="mr-2 h-4 w-4" />}
              {pdfFile ? 'Change PDF' : 'Upload PDF'}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
              disabled={isUploading}
            />
        </div>
        {pdfFile && (
          <p className="text-sm text-muted-foreground mt-2">
            Active PDF: <span className="font-medium text-primary">{pdfFile.name}</span>
          </p>
        )}
      </CardHeader>

      <ScrollArea className="flex-grow p-4 space-y-4 bg-background/30">
        {messages.length === 0 && !pdfFile && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText size={48} className="text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">Upload a PDF to get started</p>
            <p className="text-sm text-muted-foreground">Ask questions and get answers from your document.</p>
          </div>
        )}
        {messages.length === 0 && pdfFile && (
           <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquareText size={48} className="text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">Your PDF is ready!</p>
            <p className="text-sm text-muted-foreground">Ask any question about "{pdfFile.name}".</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 my-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && <Bot className="h-8 w-8 text-primary flex-shrink-0 p-1 bg-primary/10 rounded-full" />}
            <div
              className={`max-w-[70%] p-3 rounded-xl shadow-md ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-secondary text-secondary-foreground rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
             {msg.role === 'user' && <User className="h-8 w-8 text-accent flex-shrink-0 p-1 bg-accent/10 rounded-full" />}
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
          <div className="flex items-end gap-2 my-3 justify-start">
            <Bot className="h-8 w-8 text-primary flex-shrink-0 p-1 bg-primary/10 rounded-full" />
            <div className="max-w-[70%] p-3 rounded-xl shadow-md bg-secondary text-secondary-foreground rounded-bl-none">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
      </ScrollArea>

      {error && (
        <div className="p-4 border-t">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <form onSubmit={handleQuestionSubmit} className="p-4 border-t bg-card">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={pdfFile ? "Ask something about the PDF..." : "Upload a PDF first"}
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            disabled={!pdfDataUri || isLoading || isUploading}
            className="flex-grow"
          />
          <Button type="submit" disabled={!pdfDataUri || isLoading || isUploading || !currentQuestion.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

// Helper component for individual message, can be extracted if needed.
// Consider moving to ChatMessage.tsx and ChatMessagesList.tsx if complexity grows.
// For now, keeping it inline for simplicity.

interface MessageSquareText extends React.FC<React.SVGProps<SVGSVGElement>> {}
const MessageSquareText: MessageSquareText = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M13 8H7" />
    <path d="M17 12H7" />
  </svg>
);
