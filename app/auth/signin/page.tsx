"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GraduationCap } from "lucide-react";
import { Suspense } from "react";
import { signIn } from "next-auth/react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 text-center pb-0">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              English Discovery
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 pt-2">
              Silakan login menggunakan akun Google apapun
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 py-5"
              variant="outline"
            >
              <Image
                src="/google-logo.svg"
                alt="Google Logo"
                width={20}
                height={20}
                className="mr-2"
              />
              <span>Login dengan Google</span>
            </Button>
            <div className="mt-6 relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-xs text-gray-500">
                  PERHATIAN
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-gray-500 pt-0">
            &copy; {new Date().getFullYear()} SnakePeek
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-xs text-gray-500">
          PKWU
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
