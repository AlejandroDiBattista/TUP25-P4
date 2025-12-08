# ejercicio.py
import io
import pandas as pd
import matplotlib.pyplot as plt
import streamlit as st

# -----------------------------
# 1) Configuración de la página
# -----------------------------
st.set_page_config(page_title="Reporte de productos", layout="wide")

# -----------------------------
# 2) Barra lateral (sidebar)
# -----------------------------
st.sidebar.title("Configuración")

archivo = st.sidebar.file_uploader(
    label="Seleccioná un CSV",
    type=["csv"]
)

# --------------------------------
# 3) Validación: sin archivo aún
# --------------------------------
if archivo is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# Cargamos el CSV
# (soporta archivos con encoding UTF-8 y separador por coma)
try:
    # Si el archivo viene como bytes, lo pasamos a buffer
    if isinstance(archivo, io.BytesIO):
        df = pd.read_csv(archivo)
    else:
        df = pd.read_csv(archivo)
except Exception as e:
    st.error(f"No se pudo leer el CSV. Detalle: {e}")
    st.stop()

# Chequeo de columnas requeridas
columnas_requeridas = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
if not columnas_requeridas.issubset(df.columns):
    st.error("El CSV no tiene la estructura requerida. Debe incluir columnas: "
             "`año`, `mes`, `producto`, `cantidad`, `ingreso`, `costo`.")
    st.stop()

# Normalizamos tipos por las dudas
df["año"] = pd.to_numeric(df["año"], errors="coerce").astype("Int64")
df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
for col in ["cantidad", "ingreso", "costo"]:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# Años disponibles (ordenados)
anios_disponibles = sorted([int(a) for a in df["año"].dropna().unique()])

# Selector de año en la barra lateral
anio_seleccionado = st.sidebar.selectbox(
    "Seleccioná un año",
    options=anios_disponibles if len(anios_disponibles) > 0 else [],
    index=0 if len(anios_disponibles) > 0 else None
)

# Filtrado por año
df_anio = df[df["año"] == anio_seleccionado]

# ------------------------------------------
# 3) Validación: año sin datos para mostrar
# ------------------------------------------
if df_anio.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# --------------------------------
# 4) Encabezado principal
# --------------------------------
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# --------------------------------
# 5) Visualización por producto
# --------------------------------
# Orden alfabético de productos
productos = sorted(df_anio["producto"].dropna().unique())

for prod in productos:
    datos_prod = df_anio[df_anio["producto"] == prod].copy()

    # 6) Cálculos requeridos
    # Precio promedio = ingreso / cantidad (a nivel global del producto/año)
    total_cant = datos_prod["cantidad"].sum()
    total_ing = datos_prod["ingreso"].sum()
    total_cos = datos_prod["costo"].sum()

    precio_promedio_global = (total_ing / total_cant) if total_cant else 0.0
    costo_promedio_global = (total_cos / total_cant) if total_cant else 0.0

    # Evolución mensual (usar suma y luego dividir para promedio ponderado)
    mensual = (
        datos_prod.groupby("mes", as_index=False)[["cantidad", "ingreso", "costo"]]
        .sum()
        .sort_values("mes")
    )

    # Asegurar meses 1..12 presentes (aunque falten en el CSV)
    todos_meses = pd.DataFrame({"mes": range(1, 13)})
    mensual = todos_meses.merge(mensual, on="mes", how="left").fillna(0)

    mensual["precio_promedio"] = mensual.apply(
        lambda r: (r["ingreso"] / r["cantidad"]) if r["cantidad"] > 0 else 0.0, axis=1
    )
    mensual["costo_promedio"] = mensual.apply(
        lambda r: (r["costo"] / r["cantidad"]) if r["cantidad"] > 0 else 0.0, axis=1
    )

    # Contenedor con borde
    with st.container(border=True):
        # a) Título del producto
        st.markdown(f"## :red[{prod}]")

        # b) Columnas (30% / 70%)
        col_izq, col_der = st.columns([0.3, 0.7], gap="large")

        # ---- Columna de métricas ----
        with col_izq:
            st.write("Cantidad de ventas")
            st.markdown(f"### {total_cant:,.0f}")

            st.write("Precio promedio")
            st.markdown(f"### ${precio_promedio_global:,.2f}")

            st.write("Costo promedio")
            st.markdown(f"### ${costo_promedio_global:,.2f}")

        # ---- Columna de gráfico ----
        with col_der:
            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(
                mensual["mes"],
                mensual["precio_promedio"],
                marker="o",
                linewidth=2,
                color="#1f77b4",
                label="Precio promedio",
            )
            ax.plot(
                mensual["mes"],
                mensual["costo_promedio"],
                marker="o",
                linewidth=2,
                color="#d62728",
                label="Costo promedio",
            )

            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.legend(loc="best")
            ax.grid(True, linestyle="--", alpha=0.3)

            st.pyplot(fig)
