# ejercicio.py
import pandas as pd
import matplotlib.pyplot as plt
import streamlit as st
import matplotlib as mpl
mpl.rcParams["figure.facecolor"] = "#ffffff"
mpl.rcParams["axes.facecolor"] = "#ffffff"

# 1) Configuración de la página
st.set_page_config(page_title="Reporte de productos", layout="wide")

# Diseño de colores
LIGHT_BG = "#ffffff"      
SIDEBAR_BG = "#f3f4f6"    
TEXT = "#1f2937"          

st.markdown(f"""
    <style>
    /* Fondo principal */
    .stApp {{
        background-color: {LIGHT_BG};
        color: {TEXT};
    }}
    /* Sidebar */
    div[data-testid="stSidebar"] {{
        background-color: {SIDEBAR_BG};
    }}
    /* Tipografías generales */
    .stApp p, .stApp span, .stApp li, .stApp label,
    .stApp h1, .stApp h2, .stApp h3, .stApp h4, .stApp h5, .stApp h6 {{
        color: {TEXT};
    }}
    /* Inputs de la sidebar para que no queden en oscuro */
    section[data-testid="stSidebar"] * {{
        color: {TEXT};
    }}
    </style>
""", unsafe_allow_html=True)

st.markdown("""
<style>
.card{
    border: 1px solid #e5e7eb;        /* gris suave del borde */
    border-radius: 12px;              /* esquinas redondeadas */
    background: #ffffff;              /* fondo blanco de la tarjeta */
    padding: 18px 20px;               /* respiración interna */
    margin: 18px 0;                   /* separación entre tarjetas */
    box-shadow: 0 1px 2px rgba(0,0,0,0.04); /* sombra muy sutil */
}
</style>
""", unsafe_allow_html=True)

# HELPERS
def miles(n: int) -> str:
    """Enteros con separador de miles por coma (36,196)."""
    return f"{int(n):,}"

def money(v: float) -> str:
    """Moneda con 2 decimales y separador de miles por coma ($1,485.00)."""
    return f"${v:,.2f}"

def calcular_promedios(df: pd.DataFrame) -> pd.DataFrame:
    """
    Devuelve un DF por mes con:
    - precio_promedio = sum(ingreso)/sum(cantidad)
    - costo_promedio  = sum(costo)/sum(cantidad)
    """
    g = df.groupby("mes", as_index=False).agg(
        ingreso_sum=("ingreso", "sum"),
        costo_sum=("costo", "sum"),
        cantidad_sum=("cantidad", "sum"),
    )
    # Evitar división por cero
    g["precio_promedio"] = g["ingreso_sum"] / g["cantidad_sum"].replace(0, pd.NA)
    g["costo_promedio"] = g["costo_sum"] / g["cantidad_sum"].replace(0, pd.NA)

    # Asegurar meses 1..12 presentes y ordenados
    todos = pd.DataFrame({"mes": list(range(1, 13))})
    g = todos.merge(g[["mes", "precio_promedio", "costo_promedio"]], on="mes", how="left").sort_values("mes")
    return g

def grafico_evolucion(df_mes: pd.DataFrame):
    """Figura 8x3 con estilos exactos solicitados."""
    fig, ax = plt.subplots(figsize=(8, 3))
    x = df_mes["mes"]
    ax.plot(x, df_mes["precio_promedio"], marker="o", color="#1f77b4", label="Precio promedio")
    ax.plot(x, df_mes["costo_promedio"],   marker="o", color="#d62728", label="Costo promedio")

    ax.set_title("Evolución de precio y costo promedio")
    ax.set_xlabel("Mes")
    ax.set_ylabel("Monto")
    ax.grid(True, linestyle="--", alpha=0.3)
    ax.legend(loc="best")
    ax.set_xticks(range(1, 13))
    fig.tight_layout()
    return fig

# SIDEBAR
with st.sidebar:
    st.title("Configuración")
    archivo = st.file_uploader("Seleccioná un CSV", type=["csv"])

# VALIDACIÓN: Sin Archivo
if not archivo:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# CARGA DE DATOS
try:
    df = pd.read_csv(archivo)
except Exception as e:
    st.error(f"No se pudo leer el CSV. Detalle: {e}")
    st.stop()

# Chequeo de columnas requeridas
columnas_requeridas = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
faltantes = columnas_requeridas.difference(df.columns.str.lower() if any(col.isupper() for col in df.columns) else df.columns)
# Normalizamos por si el CSV trae mayúsculas
df.columns = [c.lower() for c in df.columns]
if columnas_requeridas - set(df.columns):
    st.error("El CSV no tiene la estructura requerida. Columnas esperadas: año, mes, producto, cantidad, ingreso, costo.")
    st.stop()

# Tipos básicos
df["año"] = pd.to_numeric(df["año"], errors="coerce").astype("Int64")
df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce")
df["ingreso"] = pd.to_numeric(df["ingreso"], errors="coerce")
df["costo"] = pd.to_numeric(df["costo"], errors="coerce")
df = df.dropna(subset=["año", "mes", "producto", "cantidad", "ingreso", "costo"])

# Años disponibles (ordenados)
anios = sorted(df["año"].dropna().unique().tolist())

with st.sidebar:
    anio_sel = st.selectbox("Seleccioná un año", options=anios)

# VALIDACIÓN: Año sin Datos
df_anio = df[df["año"] == anio_sel]
if df_anio.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# ENCABEZADO
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# VALIDACIÓN POR PRODUCTO
for prod in sorted(df_anio["producto"].unique()):
    df_prod = df_anio[df_anio["producto"] == prod]

    # Métricas globales del producto en el año
    cant_total = df_prod["cantidad"].sum()
    ingreso_total = df_prod["ingreso"].sum()
    costo_total = df_prod["costo"].sum()

    precio_promedio_global = (ingreso_total / cant_total) if cant_total else 0.0
    costo_promedio_global  = (costo_total  / cant_total) if cant_total else 0.0

    # Serie mensual de promedios
    df_mes = calcular_promedios(df_prod)

    # Contenedor con borde
    with st.container():
        st.markdown('<div class="card">', unsafe_allow_html=True)

    # a) Título del producto (formato pedido)
        st.markdown(f"## :red[{prod}]")

    # b) Columnas 30/70
        col_izq, col_der = st.columns([0.3, 0.7], gap="large")

        with col_izq:
            st.markdown("**Cantidad de ventas**")
            st.markdown(f"{miles(cant_total)}")

            st.markdown("**Precio promedio**")
            st.markdown(f"{money(precio_promedio_global)}")

            st.markdown("**Costo promedio**")
            st.markdown(f"{money(costo_promedio_global)}")

        with col_der:
            fig = grafico_evolucion(df_mes)
            st.pyplot(fig, clear_figure=True)

        st.markdown("</div>", unsafe_allow_html=True)

