import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientStoreProvider } from "@/lib/clientStore";
import { QuestionnaireStoreProvider } from "@/lib/questionnaireStore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Questionnaire",
  description: "Guided client intake prototype",
  icons: {
    icon: "/assets/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <QuestionnaireStoreProvider>
          <ClientStoreProvider>{children}</ClientStoreProvider>
        </QuestionnaireStoreProvider>
      </body>
    </html>
  );
}
