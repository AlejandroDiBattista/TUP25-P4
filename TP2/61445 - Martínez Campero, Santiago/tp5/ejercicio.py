import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

# Barra lateral
st.sidebar.title("Configuración")
uploaded_file = st.sidebar.file_uploader("Seleccioná un CSV", type="csv")

# Leer el CSV y obtener años disponibles
if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)
    años_disponibles = sorted(df['año'].unique())
else:
    años_disponibles = []

selected_year = st.sidebar.selectbox("Seleccioná un año", años_disponibles)

# Validaciones
if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# Filtrar datos por año seleccionado
df_filtrado = df[df['año'] == selected_year]

if df_filtrado.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# Encabezado principal
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# Calcular métricas por producto
metricas = df_filtrado.groupby('producto').agg(
    cantidad_ventas=('cantidad', 'sum'),
    precio_promedio=('ingreso', lambda x: x.sum() / df_filtrado.loc[x.index, 'cantidad'].sum()),
    costo_promedio=('costo', lambda x: x.sum() / df_filtrado.loc[x.index, 'cantidad'].sum())
).reset_index()

# Ordenar alfabéticamente por producto
metricas = metricas.sort_values('producto')

# Mostrar productos
for _, row in metricas.iterrows():
    producto = row['producto']
    cantidad = row['cantidad_ventas']
    precio_prom = row['precio_promedio']
    costo_prom = row['costo_promedio']
    
    with st.container(border=True):
        st.markdown(f"## :red[{producto}]")
        
        col1, col2 = st.columns([0.3, 0.7])
        
        with col1:
            st.metric("Cantidad de ventas", f"{cantidad:,}")
            st.metric("Precio promedio", f"{precio_prom:.2f}")
            st.metric("Costo promedio", f"{costo_prom:.2f}")
        
        with col2:
            # Datos para el gráfico
            df_prod = df_filtrado[df_filtrado['producto'] == producto]
            mensual = df_prod.groupby('mes').agg(
                precio_prom=('ingreso', lambda x: x.sum() / df_prod.loc[x.index, 'cantidad'].sum()),
                costo_prom=('costo', lambda x: x.sum() / df_prod.loc[x.index, 'cantidad'].sum())
            ).reset_index()
            
            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(mensual['mes'], mensual['precio_prom'], color='#1f77b4', marker='o', label='Precio promedio')
            ax.plot(mensual['mes'], mensual['costo_prom'], color='#d62728', marker='o', label='Costo promedio')
            ax.set_xlabel('Mes')
            ax.set_ylabel('Monto')
            ax.set_title('Evolución de precio y costo promedio')
            ax.legend(loc='best')
            ax.grid(True, linestyle='--', alpha=0.3)
            st.pyplot(fig)
            plt.close(fig)