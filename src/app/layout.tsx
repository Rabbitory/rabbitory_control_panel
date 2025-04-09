import "@/app/global.css";
import Link from "next/link";
import React from "react";
import { NotificationsProvider } from "./NotificationContext";
import NotificationsDropdown from "./components/NotificationsDropdown";
import { Metrophobic, Montserrat } from "next/font/google";

interface RootLayoutProps {
  children: React.ReactNode;
}

const montserrat = Montserrat({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const metrophobic = Metrophobic({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-metrophobic",
});

export default async function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="en"
      className={`${metrophobic.variable} ${montserrat.variable}`}
    >
      <NotificationsProvider>
        <body className={`bg-mainbg1 text-gray-900 mb-15`}>
          <div className="sticky top-0 z-50 flex justify-between items-center bg-mainbg1 pt-6 pb-6 pl-10 pr-10 border-b-[0.5] border-border1">
            <Link
              href="/"
              className="font-heading1 text-headertext1 text-3xl transition-colors duration-200 hover:text-headertext2 hover:cursor-pointer"
            >
              Rabbitory
            </Link>
            <NotificationsDropdown />
          </div>
          <main>{children}</main>
        </body>
      </NotificationsProvider>
    </html>
  );
}
