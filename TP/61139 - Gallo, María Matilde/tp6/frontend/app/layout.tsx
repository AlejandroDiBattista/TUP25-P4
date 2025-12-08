import "./globals.css";
import Nav from "./components/Nav";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const user = typeof window !== "undefined" ? localStorage.getItem("user") ?? undefined : undefined;
  return (
    <html lang="es">
      <body>
        <Nav user={user} />
        {children}
      </body>
    </html>
  );
}
