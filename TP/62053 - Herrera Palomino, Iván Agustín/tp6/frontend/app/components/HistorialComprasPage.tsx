"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";

interface CompraItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  categoria?: string;
}

interface Compra {
  id: string;
  fecha: string;
  hora: string;
  productos: CompraItem[];
  direccion: string;
  tarjeta: string;
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
  estado?: string; // "completada" | "cancelada"
  origen?: string; // "backend" | "local"
}

export default function HistorialComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const router = useRouter();

  const BACKEND_URL = "http://127.0.0.1:8000";

  const cancelarCompra = async (compraId: string) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("tp_token");
      
      // Verificar si es una compra local o del backend
      const compra = compras.find(c => c.id === compraId);
      const esCompraLocal = !token || compra?.origen === "local" || !compraId.startsWith("#");
      
      if (esCompraLocal) {
        // Cancelar compra local
        // Actualizar el estado local
        const comprasActualizadas = compras.map(compra => 
          compra.id === compraId 
            ? { ...compra, estado: "cancelada" }
            : compra
        );
        
        setCompras(comprasActualizadas);
        
        // Actualizar la compra seleccionada si es la misma
        if (compraSeleccionada && compraSeleccionada.id === compraId) {
          setCompraSeleccionada({ ...compraSeleccionada, estado: "cancelada" });
        }
        
        // Actualizar localStorage
        localStorage.setItem("historial_compras", JSON.stringify(comprasActualizadas));
        
        // Disparar evento para actualizar el stock (aunque sea ficticio para compras locales)
        window.dispatchEvent(new Event("stockUpdated"));
        setLoading(false);
        return;
      }
      
      // Sin token válido para compra del backend, redirigir silenciosamente
      if (!token) {
        router.push("/ingresar");
        setLoading(false);
        return;
      }

      // Extraer el ID numérico del compraId (quitar el #)
      const numericId = compraId.replace("#", "");

      const response = await fetch(`${BACKEND_URL}/compras/${numericId}/cancelar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        // Actualizar el estado local
        const comprasActualizadas = compras.map(compra => 
          compra.id === compraId 
            ? { ...compra, estado: "cancelada" }
            : compra
        );
        
        setCompras(comprasActualizadas);
        
        // Actualizar la compra seleccionada si es la misma
        if (compraSeleccionada && compraSeleccionada.id === compraId) {
          setCompraSeleccionada({ ...compraSeleccionada, estado: "cancelada" });
        }
        
        // Actualizar localStorage para mantener sincronización
        localStorage.setItem("historial_compras", JSON.stringify(comprasActualizadas));
        
        // Disparar evento para actualizar el stock en la página principal
        window.dispatchEvent(new Event("stockUpdated"));
        
      } else {
        // Error al cancelar, pero no mostrar mensaje molesto
        const error = await response.json();
        // Silencioso - no mostrar alert
      }
    } catch (error) {
      // Error de conexión, manejar silenciosamente
      // No mostrar mensajes de error molestos
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cargarComprasDesdeBackend = async () => {
      const token = localStorage.getItem("tp_token");
      
      // Siempre cargar compras locales primero
      const comprasLocales = JSON.parse(localStorage.getItem("historial_compras") || "[]");
      
      if (!token) {
        // Si no hay token, mostrar solo compras locales
        if (comprasLocales.length > 0) {
          setCompras(comprasLocales);
          setCompraSeleccionada(comprasLocales[0]);
        } else {
          mostrarComprasDeEjemplo();
        }
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/compras`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const comprasBackend = await response.json();
          
          // Convertir formato del backend al formato del frontend
          const comprasFormateadas = comprasBackend.map((compra: any) => ({
            id: `#${compra.id}`,
            fecha: new Date(compra.fecha * 1000).toLocaleDateString('es-ES'),
            hora: new Date(compra.fecha * 1000).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            direccion: compra.direccion || "Dirección no especificada",
            tarjeta: compra.tarjeta || "****-****-**** 1234",
            estado: compra.estado || "completada",
            productos: [], // Los productos se cargarán después si es necesario
            subtotal: compra.total - compra.envio,
            iva: 0, // El backend no separa IVA, calculamos o usamos 0
            envio: compra.envio,
            total: compra.total,
            origen: "backend" // Marcar origen para identificar
          }));

          // Combinar compras del backend con compras locales
          const todasLasCompras = [...comprasFormateadas, ...comprasLocales.map((c: any) => ({...c, origen: "local"}))];
          setCompras(todasLasCompras);
          
          if (todasLasCompras.length > 0) {
            setCompraSeleccionada(todasLasCompras[0]);
          }
        } else {
          // Backend no disponible, usar compras locales
          if (comprasLocales.length > 0) {
            setCompras(comprasLocales.map((c: any) => ({...c, origen: "local"})));
            setCompraSeleccionada(comprasLocales[0]);
          } else {
            mostrarComprasDeEjemplo();
          }
        }
      } catch (error) {
        // Error de conexión, usar compras locales silenciosamente
        if (comprasLocales.length > 0) {
          setCompras(comprasLocales.map((c: any) => ({...c, origen: "local"})));
          setCompraSeleccionada(comprasLocales[0]);
        } else {
          mostrarComprasDeEjemplo();
        }
      }
    };

    const mostrarComprasDeEjemplo = () => {
      // Cargar historial de compras desde localStorage como fallback
      const historialGuardado = localStorage.getItem("historial_compras");
      if (historialGuardado) {
        const comprasData = JSON.parse(historialGuardado);
        
        // Asegurar que todas las compras tengan el campo estado
        const comprasConEstado = comprasData.map((compra: Compra) => ({
          ...compra,
          estado: compra.estado || "completada"
        }));
        
        setCompras(comprasConEstado);
        // Seleccionar automáticamente la primera compra (más reciente)
        if (comprasConEstado.length > 0) {
          setCompraSeleccionada(comprasConEstado[0]);
        }
      } else {
        // Datos de ejemplo para mostrar la funcionalidad
        const comprasEjemplo: Compra[] = [
          {
            id: "#11",
            fecha: "27/10/2025",
            hora: "5:30 a.m.",
            direccion: "Av Centro # 234",
            tarjeta: "****-****-**** 1234",
            estado: "completada",
            productos: [
              {
                id: 1,
                nombre: "Camiseta ajustada premium",
                precio: 32.30,
                cantidad: 1
              },
              {
                id: 2,
                nombre: "Chaqueta algodón hombre",
                precio: 55.60,
                cantidad: 1
              }
            ],
            subtotal: 76.25,
            iva: 9.81,
            envio: 20.00,
            total: 344.73
          },
          {
            id: "#10",
            fecha: "25/10/2025",
            hora: "3:45 p.m.",
            direccion: "Av Centro # 234",
            tarjeta: "****-****-**** 1234",
            estado: "completada",
            productos: [
              {
                id: 3,
                nombre: "Mochila Fjällräven Foldsack",
                precio: 655.20,
                cantidad: 2
              }
            ],
            subtotal: 1310.40,
            iva: 168.35,
            envio: 20.00,
            total: 572.18
          }
        ];
        setCompras(comprasEjemplo);
        setCompraSeleccionada(comprasEjemplo[0]); // Seleccionar la primera compra
        localStorage.setItem("historial_compras", JSON.stringify(comprasEjemplo));
      }
    };

    cargarComprasDesdeBackend();
    
    // Cargar nombre del usuario
    const nombre = localStorage.getItem("user_name") || "Usuario";
    setUserName(nombre);
  }, [BACKEND_URL]);

  const handleSeleccionarCompra = (compra: Compra) => {
    setCompraSeleccionada(compra);
  };

  return (
    <div className="historial-container">
      {/* Header con autenticación */}
      <Header />

      <h2 className="checkout-main-title">
        Mis compras
      </h2>

      <div className="historial-grid">
        {/* Lista de compras */}
        <div className="historial-lista">
          {compras.map((compra) => (
            <div 
              key={compra.id}
              className={`historial-item ${compraSeleccionada?.id === compra.id ? 'selected' : ''}`}
              onClick={() => handleSeleccionarCompra(compra)}
            >
              <div className="historial-item-header">
                <span className="historial-item-id">Compra {compra.id}</span>
                <span className="historial-item-fecha">{compra.fecha} - {compra.hora}</span>
              </div>
              <div className="historial-item-total">
                Total: ${compra.total.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Detalle de la compra */}
        <div className="historial-detalle">
          {compraSeleccionada ? (
            <>
              <h3 className="historial-detalle-title">Detalle de la compra</h3>
              
              <div className="historial-info">
                <div className="historial-info-row">
                  <span className="historial-label">Compra N°:</span>
                  <span>{compraSeleccionada.id}</span>
                </div>
                <div className="historial-info-row">
                  <span className="historial-label">Fecha:</span>
                  <span>{compraSeleccionada.fecha}, {compraSeleccionada.hora}</span>
                </div>
                <div className="historial-info-row">
                  <span className="historial-label">Dirección:</span>
                  <span>{compraSeleccionada.direccion}</span>
                </div>
              </div>

              <div className="historial-productos">
                <h4 className="historial-productos-title">Productos</h4>
                {compraSeleccionada.productos.map((producto, index) => (
                  <div key={index} className="historial-producto">
                    <div className="historial-producto-info">
                      <div className="historial-producto-nombre">{producto.nombre}</div>
                      <div className="historial-producto-cantidad">Cantidad: {producto.cantidad}</div>
                    </div>
                    <div className="historial-producto-precio">
                      <div className="historial-producto-total">${(producto.precio * producto.cantidad).toFixed(2)}</div>
                      <div className="historial-producto-unit">c/u ${producto.precio.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="historial-totales">
                <div className="historial-total-row">
                  <span>Subtotal:</span>
                  <span>${compraSeleccionada.subtotal.toFixed(2)}</span>
                </div>
                <div className="historial-total-row">
                  <span>IVA:</span>
                  <span>${compraSeleccionada.iva.toFixed(2)}</span>
                </div>
                <div className="historial-total-row">
                  <span>Envío:</span>
                  <span>${compraSeleccionada.envio.toFixed(2)}</span>
                </div>
                <div className="historial-total-final">
                  <span>Total pagado:</span>
                  <span>${compraSeleccionada.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Estado y botón de cancelar */}
              <div className="historial-acciones">
                <div className="historial-estado">
                  <span className="historial-label">Estado:</span>
                  <span className={`historial-estado-valor ${compraSeleccionada.estado === "cancelada" ? "cancelada" : "completada"}`}>
                    {compraSeleccionada.estado === "cancelada" ? "CANCELADA" : "COMPLETADA"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="historial-sin-seleccion">
              <p>Selecciona una compra para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}