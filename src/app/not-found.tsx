import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-primary mb-4">
            404
          </h1>
          <h2 className="font-serif text-2xl md:text-3xl text-primary mb-4">
            Sidan hittas inte
          </h2>
          <p className="text-gray-600 text-lg">
            Den sida du letar efter finns inte längre eller har flyttats.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="default">
            <Link href="/dashboard">
              Gå till dashboard
            </Link>
          </Button>
          <Button asChild variant="secondary" size="default">
            <Link href="/">
              Till startsidan
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

