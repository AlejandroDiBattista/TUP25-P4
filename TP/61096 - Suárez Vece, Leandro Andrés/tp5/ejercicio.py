import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st
import io
from typing import Optional

# st.set_page_config(page_title="Reporte de productos", layout="wide")

# st.write("Escribir aca la solucion del TP5")

st.set_page_config(
    page_title="Reporte de productos",
    layout="wide",
    menu_items={
        'About': "Aplicación Streamlit para análisis de productos."
    }
)

# Colores especificados
COLOR_PRECIO = '#1f77b4'  # Azul
COLOR_COSTO = '#d62728'  # Rojo

# --- Funciones de Cálculo y Procesamiento ---

def calcular_metricas_mensuales(df: pd.DataFrame) -> pd.DataFrame:
    """Calcula las métricas de precio promedio y costo promedio por mes."""
    df_agg = df.groupby('mes').agg(
        cantidad_total=('cantidad', 'sum'),
        ingreso_total=('ingreso', 'sum'),
        costo_total=('costo', 'sum')
    ).reset_index()
    
    # Cálculos requeridos:
    df_agg['precio_promedio'] = df_agg['ingreso_total'] / df_agg['cantidad_total']
    df_agg['costo_promedio'] = df_agg['costo_total'] / df_agg['cantidad_total']
    
    # Asegurar que el mes esté entre 1 y 12
    df_agg = df_agg[(df_agg['mes'] >= 1) & (df_agg['mes'] <= 12)]
    
    return df_agg.sort_values('mes')

def generar_grafico_evolucion(df_mensual: pd.DataFrame, producto: str) -> plt.Figure:
    """Genera el gráfico de evolución mensual de precio y costo promedio."""
    # Tamaño de figura: 8x3
    fig, ax = plt.subplots(figsize=(8, 3))
    
    # Evolución mensual del precio promedio (línea azul #1f77b4, con marcadores circulares)
    ax.plot(
        df_mensual['mes'], 
        df_mensual['precio_promedio'], 
        label='Precio promedio', 
        color=COLOR_PRECIO, 
        marker='o'
    )
    
    # Evolución mensual del costo promedio (línea roja #d62728, con marcadores circulares)
    ax.plot(
        df_mensual['mes'], 
        df_mensual['costo_promedio'], 
        label='Costo promedio', 
        color=COLOR_COSTO, 
        marker='o'
    )
    
    # Título del gráfico: "Evolución de precio y costo promedio"
    ax.set_title(f"Evolución de precio y costo promedio", fontsize=12)
    
    # Eje X: Mes
    ax.set_xlabel("Mes", fontsize=10)
    
    # Eje Y: Monto
    ax.set_ylabel("Monto", fontsize=10)
    
    # Leyenda posicionada en el mejor lugar
    ax.legend(loc='best', fontsize=8)
    
    # Grilla con líneas punteadas y transparencia del 30%
    ax.grid(True, linestyle='--', alpha=0.3)
    
    # Establecer ticks enteros en el eje X para los meses (1 a 12)
    ax.set_xticks(range(1, 13))
    ax.set_xticklabels(range(1, 13))
    
    # Ajuste de diseño para evitar que se corten etiquetas
    plt.tight_layout()
    
    return fig

def procesar_producto(producto: str, df_producto: pd.DataFrame):
    """Genera y muestra las métricas y el gráfico para un producto."""
    
    # 5. Visualización por Producto: Contenedor con borde
    with st.container(border=True):
        
        # 5a) Título del Producto
        # Formato: ## :red[{nombre_del_producto}]
        st.markdown(f"## :red[{producto}]")
        
        # Cálculos para métricas resumidas
        cantidad_total = df_producto['cantidad'].sum()
        ingreso_total = df_producto['ingreso'].sum()
        costo_total = df_producto['costo'].sum()
        
        # Cálculos Requeridos (promedio general para métrica resumen)
        precio_promedio_general = ingreso_total / cantidad_total
        costo_promedio_general = costo_total / cantidad_total
        
        # Cálculos para el gráfico (evolución mensual)
        df_mensual = calcular_metricas_mensuales(df_producto)
        
        # 5b) Columnas de Información (proporción 0.3 y 0.7)
        col_metricas, col_grafico = st.columns([0.3, 0.7])
        
        # Columna de Métricas (izquierda, 30%)
        with col_metricas:
            st.markdown(f"**Cantidad de ventas**")
            # Cantidad de ventas (suma total con formato de miles separados por comas)
            st.markdown(f"### {cantidad_total:,.0f}")
            
            st.markdown(f"**Precio promedio**")
            # Precio promedio (con 2 decimales, formato de moneda)
            st.markdown(f"### ${precio_promedio_general:,.2f}")
            
            st.markdown(f"**Costo promedio**")
            # Costo promedio (con 2 decimales, formato de moneda)
            st.markdown(f"### ${costo_promedio_general:,.2f}")

        # Columna de Gráfico (derecha, 70%)
        with col_grafico:
            if not df_mensual.empty:
                fig = generar_grafico_evolucion(df_mensual, producto)
                # Mostrar el gráfico de Matplotlib en Streamlit
                st.pyplot(fig, use_container_width=True)
            else:
                st.info("No hay datos mensuales para generar el gráfico.")


# --- Lógica Principal de la Aplicación ---

def main():
    
    # 2. Barra Lateral (Sidebar)
    with st.sidebar:
        st.title("Configuración") # Título "Configuración"
        
        # Selector de archivos (file_uploader)
        uploaded_file = st.file_uploader(
            "Seleccioná un CSV", # Texto "Seleccioná un CSV"
            type=["csv"],        # Acepte únicamente archivos con extensión .csv
            accept_multiple_files=False
        )
        
        # Inicializar variables
        df: Optional[pd.DataFrame] = None
        data_filtered: Optional[pd.DataFrame] = None
        available_years = []
        selected_year: Optional[int] = None
        
        # 3. Validaciones - Archivo
        if uploaded_file is None:
            # Mostrar mensaje informativo y detener la ejecución
            st.warning("Subí un archivo CSV desde la barra lateral para comenzar.")
            st.stop()
            
        try:
            # Cargar el archivo
            file_bytes = io.BytesIO(uploaded_file.getvalue())
            df = pd.read_csv(file_bytes)
            
            # Convertir año a entero y manejar posibles errores de formato
            df['año'] = pd.to_numeric(df['año'], errors='coerce').astype('Int64')
            df.dropna(subset=['año'], inplace=True)
            
            # Obtener años disponibles ordenados
            available_years = sorted(df['año'].unique().tolist(), reverse=True)
            
            # Selector desplegable (selectbox) para elegir el año
            if available_years:
                selected_year = st.selectbox(
                    "Seleccioná un año", # Texto "Seleccioná un año"
                    options=available_years,
                    index=available_years.index(max(available_years)) if available_years else 0
                )
            
        except Exception as e:
            st.error(f"Error al procesar el archivo CSV: {e}")
            st.stop()


    # 4. Encabezado Principal
    st.title("Informe de Productos 📈") # Título: "Informe de Productos 📈"
    st.caption("Métricas resumidas y evolución de precios/costos por año y mes.") # Subtítulo (caption)

    if selected_year is None:
        st.info("Carga un archivo CSV que contenga datos de un año válido.")
        st.stop()

    # Filtrar datos por el año seleccionado
    data_filtered = df[df['año'] == selected_year].copy()

    # 3. Validaciones - Año
    if data_filtered.empty:
        # Mostrar mensaje de advertencia y detener la ejecución
        st.warning(f"El año {selected_year} seleccionado no tiene datos para mostrar.")
        st.stop()
        
    # Asegurar que las columnas 'mes', 'cantidad', 'ingreso', 'costo' sean numéricas
    for col in ['mes', 'cantidad', 'ingreso', 'costo']:
        data_filtered[col] = pd.to_numeric(data_filtered[col], errors='coerce').fillna(0)
    
    # 5. Visualización por Producto
    
    # Obtener la lista de productos únicos y ordenarlos alfabéticamente
    productos = sorted(data_filtered['producto'].unique().tolist())
    
    for producto in productos:
        # Filtrar datos para el producto actual
        df_producto = data_filtered[data_filtered['producto'] == producto]
        
        # Procesar y mostrar la información del producto
        if not df_producto.empty and df_producto['cantidad'].sum() > 0:
            procesar_producto(producto, df_producto)

if __name__ == "__main__":
    main()