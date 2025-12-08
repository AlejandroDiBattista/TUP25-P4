import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

# -------------------------------
# 1. Configuración de la página
# -------------------------------
st.set_page_config(
    page_title="Reporte de productos",
    layout="wide"
)

# -------------------------------
# 2. Barra lateral
# -------------------------------
st.sidebar.title("Configuración")

# Selector de archivo CSV
uploaded_file = st.sidebar.file_uploader(
    "Seleccioná un CSV",
    type=["csv"]
)

# Inicializar DataFrame
df = None

# Si se cargó archivo, leerlo
if uploaded_file:
    df = pd.read_csv(uploaded_file)

# Selector de año
if df is not None:
    available_years = sorted(df['año'].unique())
    selected_year = st.sidebar.selectbox("Seleccioná un año", available_years)
else:
    selected_year = None

# -------------------------------
# 3. Validaciones
# -------------------------------
if df is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# Filtrar por año seleccionado
df_year = df[df['año'] == selected_year]

if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# -------------------------------
# 4. Encabezado principal
# -------------------------------
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# -------------------------------
# 5. Visualización por Producto
# -------------------------------
# Ordenar productos alfabéticamente
products = sorted(df_year['producto'].unique())

for product in products:
    product_data = df_year[df_year['producto'] == product].copy()
    
    # -------------------------------
    # Calcular métricas totales
    # -------------------------------
    total_quantity = product_data['cantidad'].sum()
    total_ingreso = product_data['ingreso'].sum()
    total_costo = product_data['costo'].sum()

    avg_price = total_ingreso / total_quantity if total_quantity != 0 else 0
    avg_cost = total_costo / total_quantity if total_quantity != 0 else 0

    # -------------------------------
    # Contenedor con borde
    # -------------------------------
    with st.container():
        st.markdown(
            f"""
            <div style="border:1px solid #ddd; padding:15px; border-radius:10px; margin-bottom:15px;">
            <h2 style="color:red">{product}</h2>
            </div>
            """, unsafe_allow_html=True
        )
        col1, col2 = st.columns([0.3, 0.7])

        # -------------------------------
        # Columna izquierda - métricas
        # -------------------------------
        with col1:
            st.markdown(f"**Cantidad de ventas:** {total_quantity:,}")
            st.markdown(f"**Precio promedio:** {avg_price:.2f}")
            st.markdown(f"**Costo promedio:** {avg_cost:.2f}")

        # -------------------------------
        # Columna derecha - gráfico
        # -------------------------------
        with col2:
            # Agrupar por mes y calcular promedio correctamente
            monthly = product_data.groupby('mes').agg({
                'ingreso': 'sum',
                'costo': 'sum',
                'cantidad': 'sum'
            }).reset_index()

            monthly['precio_promedio'] = monthly.apply(
                lambda row: row['ingreso'] / row['cantidad'] if row['cantidad'] != 0 else 0, axis=1
            )
            monthly['costo_promedio'] = monthly.apply(
                lambda row: row['costo'] / row['cantidad'] if row['cantidad'] != 0 else 0, axis=1
            )

            monthly = monthly.sort_values('mes')

            # Gráfico de líneas
            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(
                monthly['mes'], monthly['precio_promedio'],
                marker='o', color='#1f77b4', label='Precio promedio'
            )
            ax.plot(
                monthly['mes'], monthly['costo_promedio'],
                marker='o', color='#d62728', label='Costo promedio'
            )
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.set_title("Evolución de precio y costo promedio")
            ax.legend(loc='best')
            ax.grid(True, linestyle='--', alpha=0.3)

            st.pyplot(fig)
