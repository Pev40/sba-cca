import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "SBA Camara de Comercio",
  description: "SBA Camara de Comercio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ 
        backgroundImage: 'url(fond.jpg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        minHeight: '100vh', 
        margin: 0,
        overflow: 'hidden',
        width: '100vw',
        height: '100vh'
      }}>
        {children}
      </body>
    </html>
  );
}
