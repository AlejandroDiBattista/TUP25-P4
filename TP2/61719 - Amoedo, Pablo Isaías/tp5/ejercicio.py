import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

# ==================== SIDEBAR ====================
st.sidebar.title("Configuración")


archivo = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])


if archivo is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()


df = pd.read_csv(archivo)


df['fecha'] = pd.to_datetime(df['fecha'])
años_disponibles = sorted(df['fecha'].dt.year.unique())


año_seleccionado = st.sidebar.selectbox("Seleccioná un año", años_disponibles)


df_año = df[df['fecha'].dt.year == año_seleccionado]


if df_año.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")


productos = sorted(df_año['producto'].unique())

for producto in productos:
 
    df_producto = df_año[df_año['producto'] == producto]
    
 
    with st.container(border=True):
      
        st.markdown(f"## :red[{producto}]")
        
      
        col1, col2 = st.columns([0.3, 0.7])
        
      
        with col1:
          
            cantidad_ventas = df_producto['cantidad'].sum()
            st.metric("Cantidad de ventas", f"{cantidad_ventas:,.0f}")
            
           
            precio_promedio = df_producto['precio'].mean()
            st.metric("Precio promedio", f"${precio_promedio:.2f}")
            
          
            costo_promedio = df_producto['costo'].mean()
            st.metric("Costo promedio", f"${costo_promedio:.2f}")
        
        
        with col2:
            
            df_producto['mes'] = df_producto['fecha'].dt.to_period('M')
            df_mes = df_producto.groupby('mes').agg({
                'precio': 'mean',
                'costo': 'mean'
            }).reset_index()
            df_mes['mes'] = df_mes['mes'].astype(str)
            
            
            fig, ax = plt.subplots(figsize=(10, 4))
            ax.plot(df_mes['mes'], df_mes['precio'], marker='o', label='Precio', linewidth=2)
            ax.plot(df_mes['mes'], df_mes['costo'], marker='s', label='Costo', linewidth=2)
            
            ax.set_xlabel("Mes")
            ax.set_ylabel("Valor ($)")
            ax.set_title(f"Evolución de Precios y Costos - {producto}")
            ax.legend()
            ax.grid(True, alpha=0.3)
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            
            st.pyplot(fig)
            plt.close()
