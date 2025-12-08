"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BACK = process.env.NEXT_PUBLIC_BACKEND || "http://127.0.0.1:8000";

interface CartSidebarProps {
  onCartUpdate?: () => void;
}

export default function CartSidebar({ onCartUpdate }: CartSidebarProps) {
  const [carrito, setCarrito] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const loadCarrito = async () => {
    const token = localStorage.getItem("tp_token");
    
    // Siempre cargar carrito local primero
    const tempCart = JSON.parse(localStorage.getItem("temp_cart") || "[]");
    
    if (!token) {
      setIsLoggedIn(false);
      setCarrito(tempCart);
      return;
    }

    setIsLoggedIn(true);
    setLoading(true);
    
    try {
      const res = await fetch(`${BACK}/carrito`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        // Si hay error del backend, simplemente usar el carrito local
        // NO eliminar el token, mantener la sesión del usuario
        setCarrito(tempCart);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const carritoItems = data?.items ?? [];
      
      // Combinar carrito del backend con carrito local si es necesario
      if (carritoItems.length === 0 && tempCart.length > 0) {
        setCarrito(tempCart);
      } else if (carritoItems.length > 0) {
        setCarrito(carritoItems);
      } else {
        setCarrito(tempCart);
      }
    } catch (err: any) {
      // Si hay error de autenticación, usar carrito local
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setIsLoggedIn(false);
      }
      
      // Siempre mostrar carrito local como fallback
      setCarrito(tempCart);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarrito();

    const handleCartUpdate = () => {
      // Actualización rápida desde localStorage
      const tempCart = JSON.parse(localStorage.getItem("temp_cart") || "[]");
      setCarrito(tempCart);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("authChanged", loadCarrito);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("authChanged", loadCarrito);
    };
  }, []);

  // Comentamos esto para mostrar carrito siempre
  // if (!isLoggedIn) {
  //   return null; // No mostrar carrito si no está logueado
  // }

  if (loading) {
    return (
      <div className="side-card">
        <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>Mi Carrito</h3>
        <div style={{ textAlign: "center", padding: "20px 0" }}>Cargando...</div>
      </div>
    );
  }

  if (carrito.length === 0) {
    return (
      <div className="side-card">
        <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>Mi Carrito</h3>
        <div style={{ textAlign: "center", padding: "20px 0", color: "#666", fontSize: "14px" }}>
          Tu carrito está vacío
        </div>
      </div>
    );
  }

  // Calcular totales
  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const iva = subtotal * 0.21;
  // Envío gratuito para compras superiores a 1000, sino costo fijo de 50
  const envio = subtotal > 1000 ? 0 : 50.00;
  const total = subtotal + iva + envio;

  const handleContinueCart = () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }
    
    // Verificar si el usuario está registrado/logueado
    const token = localStorage.getItem("tp_token");
    const userName = localStorage.getItem("user_name");
    
    // Verificar que AMBOS existan (token Y nombre de usuario)
    if (!token || !userName) {
      // Usuario no registrado - redirigir directamente al login
      router.push("/ingresar");
      return;
    }
    
    // Usuario registrado - continuar a checkout
    router.push("/checkout");
  };

  const aumentarCantidad = (index: number) => {
    const carritoActual = JSON.parse(localStorage.getItem("temp_cart") || "[]");
    
    if (carritoActual[index]) {
      const producto = carritoActual[index];
      
      // Obtener stock base del producto (sin consultar backend)
      const stockBase = 5; // Valor por defecto
      
      // Calcular cantidad total en carrito
      const cantidadTotal = carritoActual.reduce((total: number, item: any) => {
        return item.id === producto.id ? total + item.cantidad : total;
      }, 0);
      
      // Solo aumentar si no excede el stock
      if (cantidadTotal < stockBase) {
        carritoActual[index].cantidad += 1;
        localStorage.setItem("temp_cart", JSON.stringify(carritoActual));
        setCarrito([...carritoActual]);
        
        // Notificar
        window.dispatchEvent(new Event("cartUpdated"));
      }
    }
  };

  const disminuirCantidad = (index: number) => {
    const carritoActual = JSON.parse(localStorage.getItem("temp_cart") || "[]");
    
    if (carritoActual[index]) {
      if (carritoActual[index].cantidad > 1) {
        carritoActual[index].cantidad -= 1;
      } else {
        carritoActual.splice(index, 1);
      }
      
      localStorage.setItem("temp_cart", JSON.stringify(carritoActual));
      setCarrito([...carritoActual]);
      
      // Notificar
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const eliminarProducto = (index: number) => {
    const carritoActual = JSON.parse(localStorage.getItem("temp_cart") || "[]");
    
    // Eliminar el producto del carrito
    if (carritoActual[index]) {
      carritoActual.splice(index, 1);
      
      localStorage.setItem("temp_cart", JSON.stringify(carritoActual));
      setCarrito([...carritoActual]);
      
      // Notificar actualización
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("stockUpdated"));
    }
  };

  const handleCancelCart = async () => {
    const token = localStorage.getItem("tp_token");
    
    // Limpiar carrito local siempre
    localStorage.removeItem("temp_cart");
    setCarrito([]);
    
    // Si hay token, también limpiar en el backend
    if (token) {
      try {
        await fetch(`${BACK}/carrito/cancelar`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (err) {
        // Ignorar errores de cancelación
      }
    }
    
    // Disparar evento para actualizar otros componentes
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("stockUpdated"));
  };

  return (
    <div className="cart-sidebar-overlay">
      <div className="cart-sidebar">
        {/* Header del carrito */}
        <div className="cart-header">
          <h2>Mi Carrito</h2>
        </div>
        
        {/* Contenido del carrito */}
        <div className="cart-content">
          {carrito.length === 0 ? (
            <div className="cart-empty">
              Tu carrito está vacío
            </div>
          ) : (
            carrito.map((item, index) => (
              <div key={index} className="cart-item">
                <img 
                  src={`${BACK}/imagenes/${item.imagen || "placeholder.svg"}`}
                  alt={item.nombre}
                  className="cart-item-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/placeholder.svg";
                  }}
                />
                <div className="cart-item-details">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="cart-item-name">{item.nombre}</div>
                      <div className="cart-item-price">${item.precio}</div>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => eliminarProducto(index)}
                      aria-label="Eliminar producto"
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="cart-item-quantity">
                    <span>Cantidad: {item.cantidad}</span>
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn"
                        onClick={() => disminuirCantidad(index)}
                        aria-label="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="quantity-number">{item.cantidad}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => aumentarCantidad(index)}
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen y acciones del carrito */}
        {carrito.length > 0 && (
          <div className="cart-summary">
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">IVA</span>
              <span className="summary-value">${iva.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Envío</span>
              <span className="summary-value">
                {envio === 0 ? (
                  <span style={{ color: '#10b981' }}>GRATIS ✓</span>
                ) : (
                  `$${envio.toFixed(2)}`
                )}
              </span>
            </div>
            {subtotal > 0 && subtotal <= 1000 && (
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                marginTop: '8px',
                textAlign: 'center' 
              }}>
                {subtotal > 1000 ? '¡Envío gratis!' : `Te faltan $${(1000 - subtotal).toFixed(2)} para envío gratis`}
              </div>
            )}
            <div className="summary-row summary-total">
              <span className="summary-label">Total</span>
              <span className="summary-value">${total.toFixed(2)}</span>
            </div>
            
            <div className="cart-actions">
              <button 
                className="cart-btn cart-btn-secondary"
                onClick={handleCancelCart}
              >
                Cancelar
              </button>
              <button 
                className="cart-btn cart-btn-primary"
                onClick={handleContinueCart}
              >
                Continuar compra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}