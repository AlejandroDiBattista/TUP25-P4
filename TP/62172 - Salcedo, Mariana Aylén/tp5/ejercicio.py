import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st
import os

# 1. Configuración inicial
st.set_page_config(page_title="Reporte de productos", layout="wide")

# 2. Sidebar (Barra lateral)
st.sidebar.title("Configuración")

# Opción para usar archivo local o cargado
usar_archivo_local = st.sidebar.checkbox("Usar archivos locales (gaseosas.csv o vinos.csv)", value=False)

if usar_archivo_local:
    # Listar archivos CSV disponibles en el directorio
    archivos_csv = [f for f in os.listdir('.') if f.endswith('.csv')]
    
    if archivos_csv:
        archivo_seleccionado = st.sidebar.selectbox("Seleccioná un archivo CSV local", archivos_csv)
        
        # Cargar el archivo seleccionado
        try:
            df = pd.read_csv(archivo_seleccionado, on_bad_lines='skip')
            file_cargado = True
        except Exception as e:
            st.error(f"Error al leer el archivo: {e}")
            st.stop()
    else:
        st.warning("No se encontraron archivos CSV en el directorio actual.")
        st.stop()
else:
    # b) Carga de CSV mediante uploader
    file = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])
    
    # 3. Validaciones obligatorias - Sin archivo cargado
    if file is None:
        st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
        st.stop()
    
    # Cargar el archivo CSV con manejo de errores
    try:
        # Resetear el puntero del archivo al inicio
        file.seek(0)
        
        # Leer las primeras líneas para debug
        first_line = file.readline().decode('utf-8').strip()
        
        # Si la primera línea es HTML, mostrar error
        if first_line.startswith('<!') or first_line.startswith('<html'):
            st.error("El archivo cargado parece ser HTML en lugar de CSV.")
            st.info("**Solución:** Activa la casilla 'Usar archivos locales' en la barra lateral para cargar directamente desde el disco.")
            st.stop()
        
        # Volver al inicio del archivo
        file.seek(0)
        
        # Leer el CSV
        df = pd.read_csv(file, on_bad_lines='skip')
        file_cargado = True
        
    except Exception as e:
        st.error(f"Error al leer el archivo CSV: {e}")
        st.stop()

# Limpiar nombres de columnas (eliminar espacios en blanco)
df.columns = df.columns.str.strip()

# Verificar si existe la columna 'año'
if "año" not in df.columns:
    st.error(f"El archivo CSV debe contener una columna llamada 'año'. Columnas encontradas: {list(df.columns)}")
    st.info("Por favor, asegurate de subir un archivo CSV válido con las columnas: año, mes, producto, cantidad, ingreso, costo")
    st.stop()

# Obtener años disponibles (ordenados de menor a mayor)
años_disponibles = sorted(df["año"].unique())

# c) Selector de año
anio = st.sidebar.selectbox("Seleccioná un año", años_disponibles)

# Filtrar datos por año seleccionado
df_filtrado = df[df["año"] == anio].copy()

# 3. Validaciones obligatorias - Año sin datos
if df_filtrado.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# 4. Encabezado principal
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# Agrupar por producto y mes
df_agrupado = df_filtrado.groupby(["producto", "mes"]).agg({
    "cantidad": "sum",
    "ingreso": "sum",
    "costo": "sum"
}).reset_index()

# Calcular promedios
df_agrupado["precio_promedio"] = df_agrupado["ingreso"] / df_agrupado["cantidad"]
df_agrupado["costo_promedio"] = df_agrupado["costo"] / df_agrupado["cantidad"]

# Obtener lista de productos ordenados alfabéticamente
productos = sorted(df_agrupado["producto"].unique())

# 5. Visualización por producto
for producto in productos:
   
    df_producto = df_agrupado[df_agrupado["producto"] == producto].copy()
    
    df_producto = df_producto.sort_values("mes")
    
    cantidad_total = df_producto["cantidad"].sum()
    ingreso_total = df_producto["ingreso"].sum()
    costo_total = df_producto["costo"].sum()
    precio_prom_total = ingreso_total / cantidad_total
    costo_prom_total = costo_total / cantidad_total
    
    # Contenedor con estilo de tarjeta
    with st.container():
        st.markdown(f"""
        <div style="border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin: 20px 0;">
        </div>
        """, unsafe_allow_html=True)
        
        # a) Título del producto
        st.markdown(f"## :red[{producto}]")
        
        # b) Dividir en dos columnas (30% / 70%)
        col1, col2 = st.columns([0.3, 0.7])
        
        # Columna izquierda - Métricas
        with col1:
            st.metric("Cantidad de ventas", f"{cantidad_total:,.0f}".replace(",", "."))
            st.metric("Precio promedio", f"${precio_prom_total:,.2f}".replace(",", "@").replace(".", ",").replace("@", "."))
            st.metric("Costo promedio", f"${costo_prom_total:,.2f}".replace(",", "@").replace(".", ",").replace("@", "."))
        
        # Columna derecha - Gráfico
        with col2:
            # Crear gráfico con matplotlib
            fig, ax = plt.subplots(figsize=(8, 3))
            
            # Línea azul para precio promedio
            ax.plot(df_producto["mes"], df_producto["precio_promedio"], 
                   color="#1f77b4", marker="o", label="Precio promedio")
            
            # Línea roja para costo promedio
            ax.plot(df_producto["mes"], df_producto["costo_promedio"], 
                   color="#d62728", marker="o", label="Costo promedio")
            
            # Configurar título y etiquetas
            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            
            ax.legend(loc="best")

            # Grilla con líneas punteadas y transparencia del 30%
            ax.grid(True, linestyle="--", alpha=0.3)
            
            # Mostrar gráfico
            st.pyplot(fig)
            plt.close(fig)