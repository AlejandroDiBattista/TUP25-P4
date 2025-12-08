import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "TP6 Shop",
  description: "E-commerce con Next.js, FastAPI y Tailwind CSS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
