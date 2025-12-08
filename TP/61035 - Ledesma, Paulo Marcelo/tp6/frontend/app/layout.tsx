 'use client';
import Navbar from './components/Navbar';
import Script from 'next/script';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Ejecutar antesInteractive para suprimir alerta de Next.js en dev */}
        <Script id="suppress-next-alert" strategy="beforeInteractive">
          {`(function(){ try{ var _a=window.alert; window.alert=function(m){ try{ if(String(m||'').includes('Please refresh the page and try again')){ console.debug('suppress alert:', m); return; } }catch(e){} _a(m); }; }catch(e){} })();`}
        </Script>
      </head>
      <body className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 text-slate-900">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
