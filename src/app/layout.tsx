import "@/app/global.css";
import Link from "next/link";
import React from "react";
import { Metrophobic, Montserrat } from 'next/font/google';


interface RootLayoutProps {
  children: React.ReactNode;
}


const montserrat = Montserrat({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

const metrophobic = Metrophobic({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-metrophobic',
}); 


export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html 
      lang="en" 
      className={`${metrophobic.variable} ${montserrat.variable}`}
      >
      <body className={`bg-mainbg1 text-gray-900`}>
        <div className="flex justify-between items-center bg-header1 pt-6 pb-6 pl-10 pr-10 border-b border-gray-200">
          <Link
            href="/"
            className="font-heading1 font-semibold text-headertext1 text-4xl transition-colors duration-200 hover:text-orange-100 hover:cursor-pointer"
          >
            Rabbitory
          </Link>
        </div>
        <main>{children}</main>
      </body>
    </html>
  );
  
}
