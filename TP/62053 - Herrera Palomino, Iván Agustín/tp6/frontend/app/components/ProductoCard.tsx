"use client";

import React, { useState, useEffect } from "react";

const BACK = process.env.NEXT_PUBLIC_BACKEND || "http://127.0.0.1:8000";

export default function ProductoCard({ producto }: any) {
  const [imageSrc, setImageSrc] = useState("");
  const [currentStock, setCurrentStock] = useState(0);

  useEffect(() => {
    // Inicializar stock
    const initialStock = producto?.stock ?? producto?.cantidad ?? producto?.disponible ?? producto?.existencia ?? 5;
    setCurrentStock(initialStock);
    
    // Configurar imagen
    const imageField = producto?.imagen ?? producto?.image ?? producto?.img;
    if (!imageField) {
      setImageSrc("/images/placeholder.svg");
      return;
    }

    let imageUrl = "";
    if (imageField.startsWith('http')) {
      imageUrl = imageField;
    } else if (imageField.startsWith('imagenes/')) {
      imageUrl = BACK + "/" + imageField;
    } else {
      const imageName = imageField.includes('.') ? imageField : imageField + ".png";
      imageUrl = BACK + "/imagenes/" + imageName;
    }
    
    const img = new Image();
    img.onload = () => setImageSrc(imageUrl);
    img.onerror = () => setImageSrc("/images/placeholder.svg");
    img.src = imageUrl;
  }, [producto]);

  // Actualizar stock cuando cambie el carrito
  useEffect(() => {
    const updateStock = () => {
      const stockBase = producto?.existencia ?? producto?.stock ?? producto?.cantidad ?? producto?.disponible ?? 5;
      const carrito = JSON.parse(localStorage.getItem("temp_cart") || "[]");
      const cantidadEnCarrito = carrito.reduce((total: number, item: any) => {
        return item.id === producto.id ? total + item.cantidad : total;
      }, 0);
      
      const stockDisponible = stockBase - cantidadEnCarrito;
      setCurrentStock(Math.max(0, stockDisponible));
    };

    updateStock();

    window.addEventListener("cartUpdated", updateStock);
    return () => window.removeEventListener("cartUpdated", updateStock);
  }, [producto]);

  const handleAddToCart = () => {
    // Verificar stock disponible
    if (currentStock <= 0) return;
    
    // Crear item del carrito
    const item = {
      id: producto?.id || producto?._id,
      nombre: producto?.nombre || producto?.title || "Producto",
      precio: producto?.precio || producto?.price || 0,
      cantidad: 1,
      imagen: producto?.imagen || producto?.image || producto?.img || "placeholder.svg"
    };
    
    // Obtener carrito actual
    const carrito = JSON.parse(localStorage.getItem("temp_cart") || "[]");
    const existeIndex = carrito.findIndex((p: any) => p.id === item.id);
    
    if (existeIndex >= 0) {
      carrito[existeIndex].cantidad += 1;
    } else {
      carrito.push(item);
    }
    
    // Guardar
    localStorage.setItem("temp_cart", JSON.stringify(carrito));
    
    // Actualizar stock inmediatamente
    setCurrentStock(currentStock - 1);
    
    // Notificar cambios
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const stock = producto?.stock ?? producto?.cantidad ?? producto?.disponible ?? producto?.existencia ?? 5;
  const precio = producto?.precio ?? producto?.price ?? 0;
  const nombre = producto?.nombre ?? producto?.titulo ?? producto?.title ?? "Producto";
  const descripcion = producto?.descripcion ?? producto?.resume ?? "";
  const categoria = producto?.categoria ?? producto?.category ?? "Sin categoria";

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={imageSrc || "/images/placeholder.svg"}
          alt={nombre}
          className="product-image"
          onError={() => setImageSrc("/images/placeholder.svg")}
        />
      </div>
      
      <div className="product-content">
        <h3 className="product-title">{nombre}</h3>
        <p className="product-description">{descripcion}</p>
        
        <div className="product-info">
          <div className="product-details">
            <div className="product-price">${precio}</div>
            <div className="product-stock">
              Disponible: {currentStock}
            </div>
            <div className="product-category">Categoría: {categoria}</div>
          </div>
          
          <button 
            className="btn-add-cart"
            onClick={handleAddToCart}
            disabled={currentStock <= 0}
            style={{
              opacity: currentStock <= 0 ? 0.5 : 1,
              cursor: currentStock <= 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {currentStock <= 0 ? "Sin stock" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}
