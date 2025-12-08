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

if len(df_año) == 0:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

for producto in sorted(df_año['producto'].unique()):
    with st.container():
        st.markdown("""
        <style>
        .producto-container {
            border: 1px solid #ccc;
            padding: 20px;
            margin-bottom: 20px;
        }
        </style>
        """, unsafe_allow_html=True)
        
        with st.markdown('<div class="producto-container">', unsafe_allow_html=True):
            st.markdown(f"## :red[{producto}]")
            
            
            col1, col2 = st.columns([0.3, 0.7])
            datos_producto = df_año[df_año['producto'] == producto]
            
            with col1:

                total_ventas = datos_producto['cantidad'].sum()
                precio_promedio = (datos_producto['ingreso'] / datos_producto['cantidad']).mean()
                costo_promedio = (datos_producto['costo'] / datos_producto['cantidad']).mean()
                
                st.write(f"Cantidad de ventas: {total_ventas:,.0f}")
                st.write(f"Precio promedio: {precio_promedio:.2f}")
                st.write(f"Costo promedio: {costo_promedio:.2f}")
            
            with col2:
                fig, ax = plt.subplots(figsize=(8, 3))
                
                datos_mensuales = datos_producto.groupby('mes').agg({
                    'ingreso': 'sum',
                    'cantidad': 'sum',
                    'costo': 'sum'
                }).reset_index()
                
                datos_mensuales['precio_promedio'] = datos_mensuales['ingreso'] / datos_mensuales['cantidad']
                datos_mensuales['costo_promedio'] = datos_mensuales['costo'] / datos_mensuales['cantidad']
                
                ax.plot(datos_mensuales['mes'], datos_mensuales['precio_promedio'], 
                       color='#1f77b4', marker='o', label='Precio promedio')
                ax.plot(datos_mensuales['mes'], datos_mensuales['costo_promedio'], 
                       color='#d62728', marker='o', label='Costo promedio')
                
                ax.set_xlabel('Mes')
                ax.set_ylabel('Monto')
                ax.set_title('Evolución de precio y costo promedio')
                ax.grid(True, linestyle='--', alpha=0.3)
                ax.legend(loc='best')
                
                st.pyplot(fig)
                plt.close()
        
        st.markdown('</div>', unsafe_allow_html=True)