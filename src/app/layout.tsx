import "@/app/global.css";
import Link from "next/link";
import React from "react";
import { Roboto, Poppins, JetBrains_Mono, Metrophobic } from 'next/font/google';


interface RootLayoutProps {
  children: React.ReactNode;
}

// POTENTIAL FONTS
const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

const metrophobic = Metrophobic({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-metrophobic',
});


const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

const jetBrainsMono = JetBrains_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});



export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html 
      lang="en" 
      className={
        `${roboto.variable} 
        ${poppins.variable} 
        ${jetBrainsMono.variable}
        ${metrophobic.variable}`
      }
      >
      <body className={`bg-mainbg1 text-gray-900`}>
        <div className="flex justify-between items-center bg-header1 pt-8 pb-8 pl-10 pr-10">
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
