import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

# Barra lateral
st.sidebar.title("Configuración")
archivo = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])
año_seleccionado = None

# Validación: si no se ha cargado ningún archivo
if archivo is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# Cargar el archivo CSV
df = pd.read_csv(archivo)

# Obtener años disponibles y crear selector
años_disponibles = sorted(df["año"].unique())
año_seleccionado = st.sidebar.selectbox("Seleccioná un año", años_disponibles)

# Filtrar datos por año seleccionado
df_año = df[df["año"] == año_seleccionado]

# Validación: si el año seleccionado no tiene datos
if df_año.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# Encabezado principal
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# Obtener lista de productos únicos ordenados alfabéticamente
productos = sorted(df_año["producto"].unique())

# Visualización por producto
for producto in productos:
    # Filtrar datos del producto
    df_producto = df_año[df_año["producto"] == producto]
    
    # Agrupar por mes y calcular totales
    df_agrupado = df_producto.groupby("mes").agg({
        "cantidad": "sum",
        "ingreso": "sum",
        "costo": "sum"
    }).reset_index()
    
    # Calcular precio promedio y costo promedio
    df_agrupado["precio_promedio"] = df_agrupado["ingreso"] / df_agrupado["cantidad"]
    df_agrupado["costo_promedio"] = df_agrupado["costo"] / df_agrupado["cantidad"]
    
    # Calcular métricas totales
    cantidad_total = df_agrupado["cantidad"].sum()
    ingreso_total = df_agrupado["ingreso"].sum()
    costo_total = df_agrupado["costo"].sum()
    precio_promedio_total = ingreso_total / cantidad_total
    costo_promedio_total = costo_total / cantidad_total
    
    # Crear contenedor con borde
    with st.container(border=True):
        # Título del producto
        st.markdown(f"## :red[{producto}]")
        
        # Dividir en dos columnas (30% y 70%)
        col1, col2 = st.columns([0.3, 0.7])
        
        # Columna de métricas (izquierda)
        with col1:
            st.metric("Cantidad de ventas", f"{cantidad_total:,.0f}")
            st.metric("Precio promedio", f"${precio_promedio_total:,.2f}")
            st.metric("Costo promedio", f"${costo_promedio_total:,.2f}")
        
        # Columna de gráfico (derecha)
        with col2:
            # Crear el gráfico
            fig, ax = plt.subplots(figsize=(8, 3))
            
            # Línea azul para precio promedio
            ax.plot(df_agrupado["mes"], df_agrupado["precio_promedio"], 
                   color="#1f77b4", marker="o", label="Precio promedio")
            
            # Línea roja para costo promedio
            ax.plot(df_agrupado["mes"], df_agrupado["costo_promedio"], 
                   color="#d62728", marker="o", label="Costo promedio")
            
            # Configurar el gráfico
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.set_title("Evolución de precio y costo promedio")
            ax.legend(loc="best")
            ax.grid(True, linestyle="--", alpha=0.3)
            
            # Mostrar el gráfico en Streamlit
            st.pyplot(fig)