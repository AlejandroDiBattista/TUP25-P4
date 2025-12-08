import { useRouter } from "next/router";
import { useEffect } from "react";
import { isAuthenticated } from "../services/auth";
import Navbar from "../components/Navbar";
import "../globals.css";

const PROTECTED_ROUTES = ["/carrito", "/compras"];

function MyApp({ Component, pageProps }: any) {
  const router = useRouter();

  useEffect(() => {
    if (PROTECTED_ROUTES.some((route) => router.pathname.startsWith(route)) && !isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
