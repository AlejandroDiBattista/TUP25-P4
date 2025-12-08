"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCarritoStore } from "@/store/useCarritoStore";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";

export default function CarritoPage() {
  const usuario = useUserStore((s) => s.usuario);
  const cargarCarrito = useCarritoStore((s) => s.cargarCarrito);
  const quitarItem = useCarritoStore((s) => s.quitarItem);
  const items = useCarritoStore((s) => s.items);
  const total = useCarritoStore((s) => s.total);

  const router = useRouter();

  useEffect(() => {
    if (!usuario) {
      router.push("/auth/login");
      return;
    }
    cargarCarrito(usuario.id);
  }, [usuario]);

  if (!usuario) return null;

  if (items.length === 0)
    return (
      <div style={{ padding: 20 }}>
        <h2>Carrito vacío</h2>
        <Link href="/">Volver a la tienda</Link>
      </div>
    );

  const actualizarCantidad = async (item_id: number, nuevaCantidad: number) => {
    try {
      await fetch(
        `http://localhost:8000/carrito/cantidad?item_id=${item_id}&cantidad=${nuevaCantidad}`,
        {
          method: "PUT",
        }
      );

      await cargarCarrito(usuario!.id);
    } catch (err) {
      console.error("Error actualizando cantidad:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 22, marginBottom: 18 }}>Carrito de compras</h2>

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: 15,
            marginBottom: 18,
            alignItems: "center",
          }}
        >
          <img
            src={`http://localhost:8000/${item.producto?.imagen.replace(
              "imagenes/",
              "imagenes/"
            )}`}
            alt={item.producto?.titulo}
            width={100}
            height={100}
            style={{ borderRadius: 10, objectFit: "cover" }}
          />

          <div style={{ flexGrow: 1 }}>
            <h3 style={{ margin: 0 }}>{item.producto?.titulo}</h3>
            <p style={{ margin: "6px 0" }}>Precio: ${item.producto?.precio}</p>
            <p style={{ margin: "6px 0" }}>Cantidad: {item.cantidad}</p>

            <div style={{ display: "flex", gap: 8 }}>
              {/* 🔽 DISMINUIR */}
              <button
                onClick={async () => {
                  const nueva = item.cantidad - 1;
                  if (nueva <= 0) {
                    await quitarItem(item.id!, usuario.id);
                  } else {
                    await actualizarCantidad(item.id!, nueva);
                  }
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff",
                }}
              >
                -
              </button>

              {/* 🔼 AUMENTAR */}
              <button
                onClick={() => actualizarCantidad(item.id!, item.cantidad + 1)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff",
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}

      <h3 style={{ marginTop: 8, fontSize: 18 }}>Total: ${total}</h3>

      <Link
        href="/checkout"
        style={{
          padding: "10px 16px",
          border: "1px solid rgba(0,0,0,0.08)",
          display: "inline-block",
          marginTop: 16,
          borderRadius: 10,
          background: "#007aff",
          color: "#fff",
        }}
      >
        Finalizar compra
      </Link>
    </div>
  );
}
//
