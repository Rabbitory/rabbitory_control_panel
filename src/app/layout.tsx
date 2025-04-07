import "@/app/global.css";
import Link from "next/link";
import React from "react";
import { NotificationsProvider } from "./NotificationContext";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body className={`bg-gray-100 text-gray-900`}>
        <div className="flex justify-between items-center bg-orange-300 text-white pt-8 pb-8 pl-10 pr-10">
          <h1 className="text-4xl font-bold">
            <Link
              href="/"
              className="text-white transition-colors duration-200 hover:text-orange-100 hover:cursor-pointer"
            >
              Rabbitory
            </Link>
          </h1>
        </div>
        <main>
          <NotificationsProvider>{children}</NotificationsProvider>
        </main>
      </body>
    </html>
  );
}
