"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignOutPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen min-w-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Keluar dari Akun</CardTitle>
          <CardDescription>
            Apakah Anda yakin ingin keluar dari akun Anda?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
