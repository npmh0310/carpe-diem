"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_UPLOAD_KEY;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [adminKeyError, setAdminKeyError] = useState<string | null>(null);

  const handleCheckAdminKey = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminKeyError(null);

    if (!ADMIN_KEY) {
      setAdminKeyError(
        "Chưa cấu hình key. Thêm biến môi trường NEXT_PUBLIC_ADMIN_UPLOAD_KEY trong file .env.local."
      );
      return;
    }

    if (adminKeyInput.trim() === ADMIN_KEY) {
      setHasAccess(true);
      setAdminKeyInput("");
      return;
    }

    setAdminKeyError("Key không đúng.");
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen p-8 max-w-md mx-auto flex items-center justify-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <CardDescription>
              Nhập key bí mật để truy cập khu vực admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCheckAdminKey} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin key</label>
                <Input
                  type="password"
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  placeholder="Nhập key..."
                  required
                />
              </div>
              {adminKeyError && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {adminKeyError}
                </p>
              )}
              <Button type="submit" className="w-full">
                Xác nhận
              </Button>
            </form>
            <Button variant="ghost" asChild size="sm">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="size-4" />
                Về trang chủ
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Về trang chủ
            </Link>
          </Button>
          <nav className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "px-3",
                (pathname === "/admin" || pathname === "/admin/manage-list") &&
                  "bg-muted font-medium"
              )}
            >
              <Link href="/admin">Danh sách album</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "px-3",
                pathname === "/admin/upload" && "bg-muted font-medium"
              )}
            >
              <Link href="/admin/upload">Upload project</Link>
            </Button>
          </nav>
          <div className="w-[96px]" />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

