"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  categoria?: string;
}

// Función para verificar autenticación
function checkUserAuthentication() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem("tp_token");
  const userName = localStorage.getItem("user_name");
  
  // Requiere AMBOS valores para estar autenticado
  return !!(token && userName);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    telefono: "",
    email: ""
  });

  // Verificación de autenticación y carrito
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkAuth = () => {
      // Verificar autenticación primero
      const token = localStorage.getItem("tp_token");
      const userName = localStorage.getItem("user_name");
      
      // Verificar si hay productos en el carrito
      const carritoLocal = JSON.parse(localStorage.getItem("temp_cart") || "[]");
      
      if (carritoLocal.length === 0) {
        router.push("/");
        return;
      }
      
      // Verificar que AMBOS existan (token Y nombre de usuario)
      if (!token || !userName) {
        router.push("/ingresar");
        return;
      }
      
      setUserName(userName || "Usuario");
      setCarrito(carritoLocal);
      setAuthChecked(true);
    };
    
    // Ejecutar verificación inmediatamente
    checkAuth();
  }, []);

  // No renderizar nada hasta que se verifique la autenticación
  if (!authChecked) {
    return (
      <div className="checkout-empty">
        <h2>Verificando acceso...</h2>
      </div>
    );
  }

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const calcularIVA = () => {
    return calcularSubtotal() * 0.21; // 21% de IVA
  };

  const calcularEnvio = () => {
    const subtotal = calcularSubtotal();
    // Envío gratuito para compras superiores a 1000, sino costo fijo de 50
    return subtotal > 1000 ? 0 : 50.00;
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA() + calcularEnvio();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmarCompra = async () => {
    if (!formData.direccion || !formData.ciudad || !formData.telefono) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    setError(null);
    
    // Verificar autenticación ANTES de empezar el proceso
    const token = localStorage.getItem("tp_token");
    const userName = localStorage.getItem("user_name");
    
    // Verificar que AMBOS existan (token Y nombre de usuario)
    if (!token || !userName) {
      setError("Sesión expirada. Por favor inicia sesión nuevamente.");
      setTimeout(() => router.push("/ingresar"), 2000);
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Primero sincronizar el carrito temporal con el backend
      const carritoLocal = JSON.parse(localStorage.getItem("temp_cart") || "[]");
      
      if (carritoLocal.length > 0) {
        for (const item of carritoLocal) {
          try {
            await fetch("http://127.0.0.1:8000/carrito/agregar", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                producto_id: item.id,
                cantidad: item.cantidad
              })
            });
          } catch (syncError) {
            // Ignorar errores de sincronización
          }
        }
        
        // Limpiar carrito temporal después de sincronizar
        localStorage.removeItem("temp_cart");
      }

      // 2. Ahora finalizar la compra usando el backend
      const response = await fetch("http://127.0.0.1:8000/carrito/finalizar", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          direccion: formData.direccion,
          tarjeta: "****-****-**** 1234" // Tarjeta simulada
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Actualizar el carrito en el sidebar
        window.dispatchEvent(new Event("cartUpdated"));
        
        // Redirigir al historial sin mostrar alert
        router.push("/historial");
      } else {
        // Si hay error de autenticación, procesar compra local
        if (response.status === 401) {
          // Crear compra en localStorage como fallback
          const compraLocal = {
            id: Date.now(),
            fecha: new Date().toISOString(),
            productos: carrito,
            total: calcularTotal(),
            direccion: formData.direccion,
            estado: "confirmado"
          };
          
          // Guardar en historial local
          const historialLocal = JSON.parse(localStorage.getItem("historial_compras") || "[]");
          historialLocal.push(compraLocal);
          localStorage.setItem("historial_compras", JSON.stringify(historialLocal));
          
          // Limpiar carrito
          localStorage.removeItem("temp_cart");
          window.dispatchEvent(new Event("cartUpdated"));
          
          // Redirigir al historial sin mostrar alert
          router.push("/historial");
        } else {
          const errorData = await response.json();
          alert(`Error al procesar la compra: ${errorData.detail || "Error desconocido"}`);
        }
      }
      
    } catch (error) {
      alert("Error de conexión. Asegúrate de que el backend esté funcionando en http://127.0.0.1:8000");
    } finally {
      setLoading(false);
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Tu carrito está vacío</h2>
        <button 
          onClick={() => router.push("/")}
          className="checkout-empty-btn"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Header con autenticación */}
      <Header />

      <h2 className="checkout-main-title">
        Finalizar compra
      </h2>

      <div className="checkout-grid">
        {/* Resumen del carrito */}
        <div className="checkout-section">
          <h3 className="checkout-section-title">
            Resumen del carrito
          </h3>
          
          {carrito.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">
                  {item.nombre}
                </div>
                <div className="cart-item-quantity">
                  Cantidad: {item.cantidad}
                </div>
              </div>
              <div className="cart-item-price">
                <div className="cart-item-total">
                  ${(item.precio * item.cantidad).toFixed(2)}
                </div>
                <div className="cart-item-unit">
                  c/u ${item.precio.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
          
          {/* Totales */}
          <div className="checkout-totals">
            <div className="checkout-total-row">
              <span>Sub productos:</span>
              <span>${calcularSubtotal().toFixed(2)}</span>
            </div>
            <div className="checkout-total-row">
              <span>IVA:</span>
              <span>${calcularIVA().toFixed(2)}</span>
            </div>
            <div className="checkout-total-row">
              <span>Envío:</span>
              <span>
                {calcularEnvio() === 0 ? (
                  <span style={{ color: '#10b981', fontWeight: '600' }}>GRATIS ✓</span>
                ) : (
                  `$${calcularEnvio().toFixed(2)}`
                )}
              </span>
            </div>
            <div className="checkout-total-final">
              <span>Total a pagar:</span>
              <span>${calcularTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Datos de envío */}
        <div className="checkout-section">
          <h3 className="checkout-section-title">
            Datos de envío
          </h3>
          
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <form className="checkout-form">
            <div className="form-group">
              <label className="form-label">
                Dirección *
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ingresa tu dirección"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Ciudad *
              </label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ingresa tu ciudad"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Código Postal
              </label>
              <input
                type="text"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Código postal"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Tu número de teléfono"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="tu@email.com"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmarCompra}
              disabled={loading}
              className="checkout-btn"
            >
              {loading ? "Procesando..." : "Confirmar compra"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}