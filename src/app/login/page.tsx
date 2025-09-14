"use client";

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Droplets className="w-12 h-12 text-primary" />
            </div>
          <CardTitle className="text-2xl">Welcome to AquaCalc</CardTitle>
          <CardDescription>Sign in to manage your water bills</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={signInWithGoogle}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 256S109.8 0 244 0c73.2 0 136.3 29.3 181.8 74.3l-64.8 63.8C330.3 102.5 290.6 84 244 84c-81.9 0-149.3 67.4-149.3 150.3S162.1 406.6 244 406.6c55.9 0 94.2-24.2 110.8-39.7 14.3-13.6 24.3-33.3 28.5-58.2H244v-79.8h236.4c4.6 24.4 7.6 51.7 7.6 81.2z"></path>
            </svg>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
