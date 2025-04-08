import "@/app/global.css";
import Link from "next/link";
import React from "react";
import { headers } from "next/headers";
// import { Roboto } from 'next/font/google';
// import { JetBrains_Mono } from 'next/font/google';

interface RootLayoutProps {
  children: React.ReactNode;
}

// POTENTIAL FONTS
// const roboto = Roboto({
//   weight: ['400', '700'],
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-roboto', // Define a CSS variable for the font
// });

// const jetBrainsMono = JetBrains_Mono({
//   weight: ['400', '700'],
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-jetbrains-mono', // Define a CSS variable for the font
// });


export default async function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      {/*jetBrainsMono.variable, roboto.variable   ${jetBrainsMono.variable}*/}
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
        <main>{children}</main>
      </body>
    </html>
  );

}
