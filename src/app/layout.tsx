import '@/app/global.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="top-header">
          <h1>Rabbitory</h1>
          {/* <p>Current Instance</p> */}
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
