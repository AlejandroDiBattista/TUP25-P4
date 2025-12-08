import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

st.header("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

with st.sidebar:
    st.title("Configuración")
    uploaded_file = st.file_uploader("Seleccioná un CSV", type=["csv"], key="file_uploader")

df = None
selected_year = None

if uploaded_file is not None:
    try:
        df = pd.read_csv(uploaded_file)

        if 'año' in df.columns:
            years = sorted(df['año'].dropna().unique())
            years_options = ["Todos"] + list(years)
            selected_year = st.sidebar.selectbox("Seleccioná un año", options=years_options, key="year_selector")
            if selected_year != "Todos":
                df = df[df['año'] == selected_year]
                if df.empty:
                    st.sidebar.warning("El año seleccionado no tiene datos para mostrar.")
                    st.stop()
    except pd.errors.EmptyDataError:
        st.sidebar.error("El archivo subido no tiene columnas o está vacío.")
    except Exception as e:
        st.sidebar.error(f"Ocurrió un error al leer el archivo: {e}")
else:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

if df is not None and 'producto' in df.columns:
    productos = sorted(df['producto'].dropna().unique())
    if df['mes'].dtype != 'int64':
        df['mes'] = pd.to_numeric(df['mes'], errors='coerce')


    for producto in productos:
        df_productos = df[df['producto'] == producto]

        with st.container(border=True):
            st.markdown(f"## :red[{producto}]")  

            cantidad_total = df_productos['cantidad'].sum()
            df_productos['precio_promedio'] = df_productos['ingreso'] / df_productos['cantidad']
            df_productos['costo_promedio'] = df_productos['costo'] / df_productos['cantidad']

            precio_promedio_total = df_productos['precio_promedio'].mean()
            costo_promedio_total = df_productos['costo_promedio'].mean()

            col1, col2 = st.columns([0.3, 0.7])

            with col1:
                st.metric("Cantidad de ventas: ", f"{cantidad_total:,}")
                st.metric("Precio promedio: ", f"${precio_promedio_total:.2f}")
                st.metric("Costo promedio: ", f"${costo_promedio_total:.2f}")

            with col2:
                df_mensual = df_productos.groupby(['mes']).agg({
                    'precio_promedio': 'mean',
                    'costo_promedio': 'mean'
                }).reset_index()
                meses = pd.DataFrame({'mes': range(1, 13)})
                df_mensual = meses.merge(df_mensual, on='mes', how='left')

                fig, ax = plt.subplots(figsize=(8,3))
                ax.plot(df_mensual['mes'], df_mensual['precio_promedio'], marker='o', color='#1f77b4', label='Precio Promedio')
                ax.plot(df_mensual['mes'], df_mensual['costo_promedio'], marker='o', color='#d62728', label='Costo Promedio')
                ax.set_xlabel("Mes")
                ax.set_ylabel("Monto")
                ax.set_title("Evolución de precio y costo promedio")
                ax.grid(True, linestyle='--', alpha=0.3)
                ax.legend(loc='best')

                st.pyplot(fig)