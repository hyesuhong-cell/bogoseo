import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 역량 진단 플랫폼 | 유디임팩트",
  description: "대학 해커톤 AI 역량 사전/사후 진단 및 성과 추적 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
