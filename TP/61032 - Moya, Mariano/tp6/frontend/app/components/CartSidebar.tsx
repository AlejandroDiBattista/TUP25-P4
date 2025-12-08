"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Producto } from "../types";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function CartSidebar() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<{ id: number; cantidad: number }[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("carrito") || "[]");
    }
    return [];
  });
  const [productos, setProductos] = useState<Producto[]>([]);
  const [token, setToken] = useState<string | null>(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null));
  // Cola de sincronización por producto: product_id -> cantidad deseada final
  const pendingRef = useRef<Map<number, number>>(new Map());
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [syncing, setSyncing] = useState(false);
  // Pequeño retraso por producto para suavizar clicks
  const cooldownRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const [cooldownIds, setCooldownIds] = useState<Set<number>>(new Set());

  const startCooldown = (id: number, ms: number = 80) => {
    const m = new Map(cooldownRef.current);
    if (m.get(id)) clearTimeout(m.get(id)!);
    m.set(id, setTimeout(() => {
      const next = new Set(cooldownIds);
      next.delete(id);
      setCooldownIds(next);
      m.delete(id);
      cooldownRef.current = m;
    }, ms));
    cooldownRef.current = m;
    setCooldownIds(new Set(cooldownIds).add(id));
  };
  interface ApiCartItem { id: number; cantidad: number; nombre?: string; precio?: number }

  const updateLocal = (list: { id: number; cantidad: number }[], emit: boolean = true) => {
    localStorage.setItem("carrito", JSON.stringify(list));
    setItems(list);
    if (emit) window.dispatchEvent(new Event("carrito:changed"));
  };

  const fetchCart = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/carrito`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      const fromApi: { id: number; cantidad: number }[] = (data.productos || []).map((p: ApiCartItem) => ({ id: p.id, cantidad: p.cantidad }));
      // Sólo cargar inicial si no hay cambios pendientes
      if (pendingRef.current.size === 0 && !syncing) {
        updateLocal(fromApi, false);
      }
    } catch {}
  }, [token, syncing]);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("token");
    fetch(`${API_URL}/productos`).then(r=>r.json()).then(setProductos);
    // Si hay token al cargar, sincronizo desde servidor una vez
    (async () => {
      if (t) {
        try {
          const res = await fetch(`${API_URL}/carrito`, { headers: { Authorization: `Bearer ${t}` } });
          if (res.ok) {
            const data = await res.json();
            const fromApi: { id: number; cantidad: number }[] = (data.productos || []).map((p: ApiCartItem) => ({ id: p.id, cantidad: p.cantidad }));
            updateLocal(fromApi, false);
          }
        } catch {}
      }
    })();
    const handler = async () => {
      const ls = JSON.parse(localStorage.getItem("carrito") || "[]");
      setItems(ls);
      const tok = localStorage.getItem("token");
      setToken(tok);
      await fetchCart();
    };
    window.addEventListener("storage", handler);
    window.addEventListener("carrito:changed", handler as EventListener);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("carrito:changed", handler as EventListener);
    };
  }, [fetchCart]);

  // Merge potential duplicated ids to avoid duplicate keys and inconsistent totals
  const mergedMap = items.reduce<Map<number, { id: number; cantidad: number }>>((acc, it) => {
    const prev = acc.get(it.id);
    acc.set(it.id, { id: it.id, cantidad: (prev?.cantidad || 0) + it.cantidad });
    return acc;
  }, new Map());
  const mergedItems = Array.from(mergedMap.values());
  const enriched = mergedItems
    .map((it) => {
      const p = productos.find((pr) => pr.id === it.id);
      return p ? { ...p, cantidad: it.cantidad } : null;
    })
    .filter(Boolean) as (Producto & { cantidad: number })[];

  const subtotal = enriched.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const iva = +(enriched.reduce((acc, p) => {
    const esElectronico = (p.categoria || "").toLowerCase().includes("electr");
    const rate = esElectronico ? 0.10 : 0.21;
    return acc + p.precio * p.cantidad * rate;
  }, 0)).toFixed(2);
  // Envío: gratis si subtotal > 1000; $50 si hay productos y subtotal <= 1000; 0 si vacío
  const envio = subtotal === 0 ? 0 : (subtotal > 1000 ? 0 : 50);
  const total = +(subtotal + iva + envio).toFixed(2);

  

  const scheduleSync = () => {
    if (!token) return; // sin token no sincronizo servidor
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      const snapshot = new Map(pendingRef.current); // copia estable de lo que procesaremos ahora
      if (snapshot.size === 0) { syncTimerRef.current = null; return; }
      setSyncing(true);
      try {
        for (const [id, qty] of snapshot.entries()) {
          // DELETE para limpiar estado previo de ese producto
          await fetch(`${API_URL}/carrito/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
          if (qty > 0) {
            // Un único POST con la cantidad final deseada (backend lo soporta)
            await fetch(`${API_URL}/carrito`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ producto_id: id, cantidad: qty }),
            });
          }
        }
        // Limpiar sólo entradas que no cambiaron durante el sync
        for (const [id, qty] of snapshot.entries()) {
          const current = pendingRef.current.get(id);
          if (current !== undefined && current === qty) {
            pendingRef.current.delete(id);
          }
        }
        await fetchCart();
      } catch (e) {
        console.error("Error sincronizando carrito:", e);
      } finally {
        setSyncing(false);
        syncTimerRef.current = null;
        // Si quedaron pendientes nuevos, programar otro ciclo rápidamente
        if (pendingRef.current.size > 0) scheduleSync();
      }
    }, 150); // debounce más corto
  };

  const inc = (id: number) => {
    if (cooldownIds.has(id)) return;
    const next = items.map(i => ({ ...i }));
    const it = next.find(i => i.id === id);
    const p = productos.find(pr => pr.id === id);
    if (!it || !p) return;
    if (it.cantidad < p.existencia) {
      it.cantidad += 1;
      updateLocal(next);
      if (token) {
        pendingRef.current.set(id, it.cantidad);
        scheduleSync();
      }
      startCooldown(id);
    }
  };
  const dec = (id: number) => {
    if (cooldownIds.has(id)) return;
    let next = items.map(i => ({ ...i }));
    const it = next.find(i => i.id === id);
    if (!it) return;
    if (it.cantidad > 1) {
      it.cantidad -= 1;
      updateLocal(next);
    } else {
      next = next.filter(i => i.id !== id);
      updateLocal(next);
    }
    if (token) {
      const nuevo = next.find(i => i.id === id)?.cantidad || 0;
      pendingRef.current.set(id, nuevo);
      scheduleSync();
    }
    startCooldown(id);
  };
  const clear = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/carrito/cancelar`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      } catch (e) {
        console.error("Error al cancelar carrito:", e);
      }
      await fetchCart();
    } else {
      updateLocal([]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carrito</CardTitle>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <div className="text-sm text-gray-600">Cargando carrito...</div>
        ) : !token ? (
          <div className="rounded-lg border border-gray-200 bg-white text-gray-600 px-3 py-2 text-sm">Inicia sesión para ver y editar tu carrito.</div>
        ) : (
          <>
            <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
              {enriched.length === 0 ? (
                <div className="text-sm text-gray-900">Tu carrito está vacío.</div>
              ) : (
                enriched.map(p => {
                  const disabled = cooldownIds.has(p.id); // sólo cooldown por producto; no bloquear por sync global
                  return (
                    <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 text-sm text-gray-900 border rounded-md p-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {p.imagen ? (
                            <Image
                              src={`${API_URL}/${p.imagen}`}
                              alt={p.titulo}
                              width={40}
                              height={40}
                              className="object-contain w-full h-full"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">IMG</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[160px]" title={p.titulo}>{p.titulo}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap justify-self-end">
                        <Button variant="outline" size="sm" onClick={() => dec(p.id)} disabled={disabled} aria-label="Disminuir">-</Button>
                        <span className="text-xs w-7 text-center select-none">{p.cantidad}</span>
                        <Button variant="outline" size="sm" onClick={() => inc(p.id)} disabled={disabled} aria-label="Aumentar">+</Button>
                      </div>
                      <div className="w-16 text-right justify-self-end">${(p.precio * p.cantidad).toFixed(2)}</div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 text-sm text-gray-900 space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>IVA</span><span>${iva.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Envío</span><span>${envio.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clear}>Cancelar</Button>
              <Button className="flex-1" onClick={() => router.push(token ? "/compra" : "/login")}>Continuar compra</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
