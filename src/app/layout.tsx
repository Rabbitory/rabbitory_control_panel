import "@/app/global.css";
import React from "react";
import { NotificationsProvider } from "./NotificationContext";
import NotificationsDropdown from "./components/NotificationsDropdown";
import { Metrophobic, Montserrat } from "next/font/google";
import RabbitoryLogoLink from "./components/RabbitoryLogoLink";


interface RootLayoutProps {
  children: React.ReactNode;
}

const montserrat = Montserrat({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "optional",
  variable: "--font-montserrat",
});

const metrophobic = Metrophobic({
  weight: ["400"],
  subsets: ["latin"],
  display: "optional",
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
        <body className="flex flex-col bg-mainbg1 text-gray-900`">
          <div className="sticky top-0 z-50 flex justify-between items-center bg-mainbg1 pt-6 pb-6 pl-10 pr-10 border-b-[0.5] border-border1">
            <RabbitoryLogoLink />
            <NotificationsDropdown />
          </div>
          <main className="flex-1 overflow-hidden">{children}</main>
        </body>
      </NotificationsProvider>

      {/* <body className="flex flex-col bg-mainbg1 text-gray-900">
      <div className="sticky top-0 z-50 flex justify-between items-center bg-mainbg1 pt-6 pb-6 pl-10 pr-10 border-b-[0.5] border-border1">
        <RabbitoryLogoLink />
      </div>
      <main className="flex-1 overflow-hidden">{children}</main>
      </body> */}
    </html>
  );
}
