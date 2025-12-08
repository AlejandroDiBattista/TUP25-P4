import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.ticker import FuncFormatter
import io


def format_miles(x, pos=None):
    return f"{int(x):,}"


def main():
    st.set_page_config(page_title="Reporte de productos", layout="wide")

    # Sidebar
    st.sidebar.title("Configuración")
    uploaded = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

    # Leer años disponibles si se cargó un archivo
    año_seleccionado = None
    if uploaded is not None:
        try:
            df = pd.read_csv(uploaded)
        except Exception:
            st.sidebar.error("No se pudo leer el CSV. Asegurate que esté bien formado.")
            st.stop()

        if 'año' in df.columns:
            años = sorted(df['año'].dropna().unique())
        else:
            años = []

        año_seleccionado = st.sidebar.selectbox("Seleccioná un año", options=años)
    else:
        # Si no hay archivo, mostrar selector vacío para cumplir interfaz (no desplegable)
        st.sidebar.selectbox("Seleccioná un año", options=[])  # placeholder

    # Validaciones
    if uploaded is None:
        st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
        st.stop()

    # Comprobar que año seleccionado tiene datos
    if año_seleccionado is None or año_seleccionado not in df['año'].unique():
        st.warning("El año seleccionado no tiene datos para mostrar.")
        st.stop()

    # Encabezado principal
    st.title("Informe de Productos 📈")
    st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

    # Preparar datos
    # Asegurar tipos
    df = df.copy()
    for col in ['año', 'mes', 'cantidad', 'ingreso', 'costo']:
        if col in df.columns:
            # intentar convertir
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Filtrar por año
    df = df[df['año'] == año_seleccionado]

    if df.empty:
        st.warning("El año seleccionado no tiene datos para mostrar.")
        st.stop()

    # Calcular precio promedio y costo promedio por fila
    # Evitar división por cero
    df['cantidad'] = df['cantidad'].fillna(0)
    df['precio_promedio'] = df.apply(lambda r: (r['ingreso'] / r['cantidad']) if r['cantidad'] else 0.0, axis=1)
    df['costo_promedio'] = df.apply(lambda r: (r['costo'] / r['cantidad']) if r['cantidad'] else 0.0, axis=1)

    # Lista de productos ordenada
    productos = sorted(df['producto'].dropna().unique())

    for producto in productos:
        cont = st.container()
        cont.markdown("<div style='border:1px solid #ddd;padding:12px;border-radius:6px'>", unsafe_allow_html=True)

        cont.markdown(f"## :red[{producto}]")

        prod_df = df[df['producto'] == producto]

        # Columnas 30% / 70%
        col1, col2 = cont.columns([0.3, 0.7])

        # Métricas
        total_cantidad = prod_df['cantidad'].sum()
        precio_promedio = (prod_df['ingreso'].sum() / total_cantidad) if total_cantidad else 0.0
        costo_promedio = (prod_df['costo'].sum() / total_cantidad) if total_cantidad else 0.0

        with col1:
            st.write("**Cantidad de ventas**")
            st.write(f"{int(total_cantidad):,}")

            st.write("**Precio promedio**")
            st.write(f"{precio_promedio:.2f}")

            st.write("**Costo promedio**")
            st.write(f"{costo_promedio:.2f}")

        # Gráfico
        with col2:
            # Agrupar por mes en orden
            grouped = prod_df.groupby('mes').agg({
                'precio_promedio': 'mean',
                'costo_promedio': 'mean'
            }).reindex(range(1,13), fill_value=0).reset_index()

            fig, ax = plt.subplots(figsize=(8, 3))

            ax.plot(grouped['mes'], grouped['precio_promedio'], marker='o', color='#1f77b4', label='Precio promedio')
            ax.plot(grouped['mes'], grouped['costo_promedio'], marker='o', color='#d62728', label='Costo promedio')

            ax.set_xlabel('Mes')
            ax.set_ylabel('Monto')
            ax.set_title('Evolución de precio y costo promedio')
            ax.legend(loc='best')
            ax.grid(True, linestyle='--', alpha=0.3)

            # X ticks como enteros 1..12
            ax.set_xticks(range(1, 13))

            st.pyplot(fig)

        cont.markdown("</div>", unsafe_allow_html=True)


if __name__ == '__main__':
    main()

    # Removed duplicate imports and messages