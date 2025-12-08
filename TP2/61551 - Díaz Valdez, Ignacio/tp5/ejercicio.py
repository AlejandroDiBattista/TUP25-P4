import csv
import io
from pathlib import Path
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

BASE = Path(__file__).parent
DEFAULT_FILES = [BASE / "gaseosas.csv", BASE / "vinos.csv"]

st.set_page_config(page_title="TP5 - Informe de Productos", layout="wide")
st.title("Informe de Productos 📈")

# Sidebar: uploader + año
uploaded = st.sidebar.file_uploader("Subir CSV (opcional)", type="csv", accept_multiple_files=True)
year_sel = st.sidebar.selectbox("Seleccionar año (opcional)", options=["(todos)"], index=0)

# Cargar datos (upload primero, sino archivos por defecto)
def cargar_tablas(uploaded_files):
    if uploaded_files:
        frames = []
        for f in uploaded_files:
            try:
                frames.append(pd.read_csv(f, dtype=str))
            except:
                st.sidebar.error(f"Error leyendo {getattr(f,'name',str(f))}")
        return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()
    else:
        frames = []
        for p in DEFAULT_FILES:
            if p.exists():
                frames.append(pd.read_csv(p, dtype=str))
        return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()

df = cargar_tablas(uploaded)

if df.empty:
    st.warning("No se cargaron datos. Subí CSV o coloca los archivos gaseosas.csv/vinos.csv en la carpeta tp5.")
    st.stop()

# Normalizar columnas numéricas
for col in ("ingreso", "costo", "cantidad"):
    if col in df.columns:
        df[col] = pd.to_numeric(df[col].astype(str).str.replace(",", "").str.strip(), errors="coerce").fillna(0)
    else:
        df[col] = 0

# columnas texto
df["sucursal"] = df.get("sucursal", "").astype(str).str.strip()
df["producto"] = df.get("producto", "").astype(str).str.strip()
df["año"] = df.get("año", "").astype(str).str.strip()
df["mes"] = df.get("mes", "").astype(str).str.zfill(2).astype(int, errors="ignore")

# completar selectbox de año
años = sorted([y for y in df["año"].unique() if y and y != "nan"])
if años:
    opts = ["(todos)"] + años
    i = opts.index(year_sel) if year_sel in opts else 0
    year_sel = st.sidebar.selectbox("Seleccionar año", options=opts, index=i)
    if year_sel != "(todos)":
        df = df[df["año"] == year_sel]

# Calcular métricas por producto
# precio promedio por unidad = ingreso / cantidad (evitar división por 0)
df["precio_unitario"] = df.apply(lambda r: (r["ingreso"] / r["cantidad"]) if r["cantidad"] else 0.0, axis=1)
df["costo_unitario"] = df.apply(lambda r: (r["costo"] / r["cantidad"]) if r["cantidad"] else 0.0, axis=1)

prod_list = df["producto"].dropna().unique()
prod_list = [p for p in prod_list if p]  # quitar vacíos

# Layout: mostrar productos en tarjetas (2 por fila)
cols_por_fila = 2
for i, prod in enumerate(sorted(prod_list)):
    sub = df[df["producto"] == prod]
    cantidad_total = int(sub["cantidad"].sum())
    precio_prom = sub["precio_unitario"].mean() if not sub.empty else 0.0
    costo_prom = sub["costo_unitario"].mean() if not sub.empty else 0.0

    # preparar datos mensuales para el gráfico
    mons = sub.groupby("mes").agg(
        precio_promedio=("precio_unitario", "mean"),
        costo_promedio=("costo_unitario", "mean"),
        ventas=("cantidad", "sum")
    ).reindex(range(1,13), fill_value=0)  # asegurar 1..12

    if i % cols_por_fila == 0:
        row_cols = st.columns(cols_por_fila)

    with row_cols[i % cols_por_fila]:
        st.markdown(f"### {prod}")
        st.metric("Cantidad de ventas", f"{cantidad_total:,}")
        st.metric("Precio promedio", f"${precio_prom:,.0f}")
        st.metric("Costo promedio", f"${costo_prom:,.0f}")

        # gráfico matplotlib simple: precio (azul) y costo (rojo)
        fig, ax = plt.subplots(figsize=(5,2.8))
        ax.plot(mons.index, mons["precio_promedio"], marker='o', color='tab:blue', label="Precio promedio")
        ax.plot(mons.index, mons["costo_promedio"], marker='o', color='tab:red', label="Costo promedio")
        ax.set_title("Evolución de precio y costo promedio")
        ax.set_xlabel("Mes")
        ax.set_ylabel("Monto")
        ax.set_xticks(range(1,13))
        ax.grid(True, linestyle=':', alpha=0.6)
        ax.legend(loc="upper right", fontsize=8)
        st.pyplot(fig)
        plt.close(fig)

# boton para descargar resumen por sucursal
res_sucursal = df.groupby("sucursal", dropna=False).agg(
    ingreso=("ingreso", "sum"),
    costo=("costo", "sum"),
    cantidad=("cantidad", "sum")
).reset_index()
res_sucursal["utilidad"] = res_sucursal["ingreso"] - res_sucursal["costo"]

csv_bytes = res_sucursal.to_csv(index=False).encode("utf-8")
st.download_button("Descargar resumen_sucursales.csv", data=csv_bytes, file_name="resumen_sucursales.csv", mime="text/csv")