import "./globals.css";
import type { Metadata } from "next";
import ThemeInitializer from "@/components/theme-initializer";

export const metadata: Metadata = {
  title: "Hệ thống quản lý Cá Nhân",
  description: "Hệ thống quản lý cá nhân có xác thực YubiKey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}