import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

st.set_page_config(
    page_title="Reporte de productos",
    layout="wide",
    initial_sidebar_state="expanded"
)
st.sidebar.title("Configuración")

uploaded_file = st.sidebar.file_uploader(
    "Seleccioná un CSV",
    type=['csv']
)

if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# Cargar datos
try:
    df = pd.read_csv(uploaded_file)
    if not {'año', 'mes', 'producto', 'cantidad', 'ingreso', 'costo'}.issubset(df.columns):
        st.error("El archivo CSV debe contener las columnas: año, mes, producto, cantidad, ingreso y costo")
        st.stop()
    
    df = df.dropna() 

    df['año'] = pd.to_numeric(df['año'], errors='coerce')
    df['mes'] = pd.to_numeric(df['mes'], errors='coerce')
    df['cantidad'] = pd.to_numeric(df['cantidad'], errors='coerce')
    df['ingreso'] = pd.to_numeric(df['ingreso'], errors='coerce')
    df['costo'] = pd.to_numeric(df['costo'], errors='coerce')
    
    df = df.dropna()
    
    años_disponibles = sorted(df['año'].unique().astype(int))
    
    año_seleccionado = st.sidebar.selectbox(
        "Seleccioná un año",
        años_disponibles
    )

    df_año = df[df['año'] == año_seleccionado]

except Exception as e:
    st.error(f"Error al procesar el archivo: {str(e)}")
    st.stop()

if df_año.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

for producto in sorted(df_año['producto'].unique()):
    df_producto = df_año[df_año['producto'] == producto]
    
    with st.container():
        st.markdown(f"## :red[{producto}]")
        
        col1, col2 = st.columns([0.3, 0.7])
        
        with col1:
            cantidad_total = df_producto['cantidad'].sum()
            precio_promedio = df_producto['ingreso'].sum() / df_producto['cantidad'].sum()
            costo_promedio = df_producto['costo'].sum() / df_producto['cantidad'].sum()
            
            st.write(f"**Cantidad de ventas:** {cantidad_total:,.0f}")
            st.write(f"**Precio promedio:** {precio_promedio:.2f}")
            st.write(f"**Costo promedio:** {costo_promedio:.2f}")
        
        with col2:
        
            df_mensual = df_producto.groupby('mes').agg({
                'ingreso': 'sum',
                'costo': 'sum',
                'cantidad': 'sum'
            }).reset_index()
            
            df_mensual['precio_promedio'] = df_mensual['ingreso'] / df_mensual['cantidad']
            df_mensual['costo_promedio'] = df_mensual['costo'] / df_mensual['cantidad']
            
            df_mensual = df_mensual.sort_values('mes')
            
            fig, ax = plt.subplots(figsize=(8, 3))
            
            ax.plot(df_mensual['mes'], df_mensual['precio_promedio'], 
                   color='#1f77b4', marker='o', label='Precio promedio')
            ax.plot(df_mensual['mes'], df_mensual['costo_promedio'], 
                   color='#d62728', marker='o', label='Costo promedio')
            
            ax.set_title("Evolución de precio y costo promedio")
            ax.grid(True, linestyle='--', alpha=0.3)
            ax.legend(loc='best')
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            
            st.pyplot(fig)
            plt.close()
            
        st.markdown("---")