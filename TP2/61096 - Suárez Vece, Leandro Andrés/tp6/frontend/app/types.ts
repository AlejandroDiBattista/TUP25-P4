import { strict } from "assert";

export interface Producto {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  categoria: string;
  valoracion: number;
  existencia: number;
  imagen: string;
}

export interface ProductoRead {
  id?: number;
  titulo: string;
  descripcion: string;
  precio: number;
  categoria: string;
  existencia: number;
  imagen: string;
  agotado?: boolean;
}

export interface UsuarioRegister {
  nombre: string;
  email: string;
  password: string;
}

export interface UsuarioLogin {
  email: string;
  password: string;
}
export interface UsuarioRegisterResponse {
  message: string;
  usuario_id: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}


export interface CompraFinalizar {
  direccion: string;
  tarjeta: string;
}

export interface CompraExito {
  message: string;
  compra_id: number;
  total_pagado: number;
}

export interface ItemCompraRead {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  iva: number
}

export interface CompraResumen {
  id: number;
  fecha: string; // usar string para fechas ISO
  total: number;
  direccion: string;
}

export interface CompraDetalle extends CompraResumen {
  envio: number;
  tarjeta: string;
  items: ItemCompraRead[];
}

export interface CarritoAdd {
  producto_id: number;
  cantidad: number;
}

export interface CarritoRead {
  cantidad: number;
  producto: ProductoRead;
}

export interface message {
  message: string
}