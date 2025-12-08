# 1. Importamos las librerías necesarias
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

st.set_page_config(page_title="Reporte de Productos", layout="wide")


st.sidebar.header("Configuración")

uploaded_file = st.sidebar.file_uploader(
    "Seleccioná un CSV", 
    type=['csv']
)


if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop() 

try:
    df = pd.read_csv(uploaded_file)
except Exception as e:
    st.error(f"Error al leer el archivo CSV: {e}")
    st.stop()


available_years = sorted(df['año'].unique())
selected_year = st.sidebar.selectbox(
    "Seleccioná un año",
    options=available_years
)


df_filtered = df[df['año'] == selected_year]


if df_filtered.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")


products = sorted(df_filtered['producto'].unique())


for product in products:
    
    
    with st.container(border=True):
        
       
        df_product = df_filtered[df_filtered['producto'] == product]
        
       
        st.markdown(f"## :red[{product}]")
        
      
        col1, col2 = st.columns([0.3, 0.7])
        
        
        with col1:
            
            total_quantity = df_product['cantidad'].sum()
            total_revenue = df_product['ingreso'].sum()
            total_cost = df_product['costo'].sum()

           
            avg_price = total_revenue / total_quantity if total_quantity > 0 else 0
            avg_cost = total_cost / total_quantity if total_quantity > 0 else 0

            
            st.metric("Cantidad de ventas", f"{total_quantity:,.0f}")
            st.metric("Precio promedio", f"${avg_price:,.2f}")
            st.metric("Costo promedio", f"${avg_cost:,.2f}")

        
        with col2:
           
            monthly_data = df_product.groupby('mes').agg({
                'ingreso': 'sum',
                'costo': 'sum',
                'cantidad': 'sum'
            }).reset_index()

           
            monthly_data['precio_promedio'] = monthly_data['ingreso'] / monthly_data['cantidad']
            monthly_data['costo_promedio'] = monthly_data['costo'] / monthly_data['cantidad']
            
          
            fig, ax = plt.subplots(figsize=(8, 3))

       
            ax.plot(
                monthly_data['mes'], 
                monthly_data['precio_promedio'], 
                label='Precio promedio', 
                marker='o', 
                color='#1f77b4' # Azul
            )
           
            ax.plot(
                monthly_data['mes'], 
                monthly_data['costo_promedio'], 
                label='Costo promedio', 
                marker='o', 
                color='#d62728' # Rojo
            )

           
            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.legend(loc='best')
            ax.grid(True, linestyle='--', alpha=0.3)
            
          
            st.pyplot(fig)