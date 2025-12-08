import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

st.set_page_config(page_title="Reporte de productos", layout="wide")

with st.sidebar:
    st.title("Configuración")
    
    uploaded_file = st.file_uploader("Seleccioná un CSV", type=['csv'])
    
    if uploaded_file is not None:

        df = pd.read_csv(uploaded_file)
        años = sorted(df['año'].unique())
        

        año_seleccionado = st.selectbox("Seleccioná un año", años)
    

if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

df_año = df[df['año'] == año_seleccionado]

if df_año.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

for producto in sorted(df_año['producto'].unique()):
    df_producto = df_año[df_año['producto'] == producto]
    
    df_mensual = df_producto.groupby('mes').agg({
        'cantidad': 'sum',
        'ingreso': 'sum',
        'costo': 'sum'
    }).reset_index()
    
    df_mensual['precio_promedio'] = df_mensual['ingreso'] / df_mensual['cantidad']
    df_mensual['costo_promedio'] = df_mensual['costo'] / df_mensual['cantidad']
    
    with st.container():
        st.markdown(f"## :red[{producto}]")
        
        col1, col2 = st.columns([0.3, 0.7])
        
        with col1:
            st.write(f"Cantidad de ventas: {df_producto['cantidad'].sum():,.0f}")
            st.write(f"Precio promedio: {(df_producto['ingreso'].sum() / df_producto['cantidad'].sum()):.2f}")
            st.write(f"Costo promedio: {(df_producto['costo'].sum() / df_producto['cantidad'].sum()):.2f}")
        
        with col2:
            fig, ax = plt.subplots(figsize=(8, 3))
            
            ax.plot(df_mensual['mes'], df_mensual['precio_promedio'], 
                color='#1f77b4', marker='o', label='Precio promedio')
            
            ax.plot(df_mensual['mes'], df_mensual['costo_promedio'], 
                color='#d62728', marker='o', label='Costo promedio')
            
            ax.set_title('Evolución de precio y costo promedio')
            ax.grid(True, linestyle='--', alpha=0.3)
            ax.legend(loc='best')
            ax.set_xlabel('Mes')
            ax.set_ylabel('Monto')
            
            st.pyplot(fig)
            plt.close()
        
        st.markdown("---")