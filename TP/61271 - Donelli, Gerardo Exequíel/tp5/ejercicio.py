
# Importamos las librerías necesarias
import streamlit as st        # Librería principal para crear la interfaz web
import pandas as pd           # Librería para manejo y análisis de datos
import matplotlib.pyplot as plt  # Librería para gráficos

# Configuramos la página de Streamlit: título y layout
st.set_page_config(page_title="Reporte de Productos", layout="wide")

# ===============================
# Barra lateral: Configuración
# ===============================
st.sidebar.header("Configuración")  # Encabezado en la barra lateral

# Componente para subir archivo CSV
archivo_csv = st.sidebar.file_uploader(
    "Seleccioná un CSV",  # Texto que ve el usuario
    type=['csv']          # Solo permitimos archivos CSV
)

# Si el usuario no sube un archivo, mostramos un mensaje y detenemos la ejecución
if archivo_csv is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()  # Detiene la ejecución hasta que se suba un archivo

# Intentamos leer el CSV con pandas y controlamos posibles errores
try:
    datos = pd.read_csv(archivo_csv)
except Exception as e:
    st.error(f"Error al leer el archivo CSV: {e}")
    st.stop()

# ===============================
# Selección de año
# ===============================
# obtener todos los años disponibles en la columna 'año' y los ordenamos
available_years = sorted(datos['año'].unique())

# componente de selección de año en la barra lateral
selected_year = st.sidebar.selectbox(
    "Seleccioná un año",
    options=available_years
)

# filtrar los datos del CSV según el año seleccionado
df_filtrado = datos[datos['año'] == selected_year]

# si no hay datos para año seleccionado mostramos advertencia
if df_filtrado.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# ===============================
# Título y Descripción Principal
# ===============================
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

#Obtener la lista de productos unicos del año seleccionado y los ordenamos
products = sorted(df_filtrado['producto'].unique())

# ===============================
# Iteración por cada producto
# ===============================
for product in products:

    #crear un contenedor para cada producto
    #'border=True' no es oficial en Streamlit, pero se deja tal cual
    with st.container(border=True):

        #filtrar los datos correspondientes a este producto
        df_product = df_filtrado[df_filtrado['producto'] == product]

        #mostrar el nombre del producto en rojo
        st.markdown(f"## :red[{product}]")

        #dividir la visualización en dos columnas: métricas y gráfico
        col1, col2 = st.columns([0.3, 0.7])

        #Columna 1 métricas resumidas
        with col1:

            #calculas totales
            total_quantity = df_product['cantidad'].sum()
            total_revenue = df_product['ingreso'].sum()
            total_cost = df_product['costo'].sum()

            #calculas promedio de precio y costo evitando división por cero
            avg_price = total_revenue / total_quantity if total_quantity > 0 else 0
            avg_cost = total_cost / total_quantity if total_quantity > 0 else 0

            # Mostrar métricas en Streamlit
            st.metric("Cantidad de ventas", f"{total_quantity:,.0f}")
            st.metric("Precio promedio", f"${avg_price:,.2f}")
            st.metric("Costo promedio", f"${avg_cost:,.2f}")

        #columna 2 gráfico de evolución
        with col2:

    #Agrupar los datos por mes y sumamos ingreso, costo y cantidad
            monthly_data = df_product.groupby('mes').agg({
                'ingreso': 'sum',
                'costo': 'sum',
                'cantidad': 'sum'
            }).reset_index()

            #Calcular el precio promedio y costo promedio por mes
            monthly_data['precio_promedio'] = monthly_data['ingreso'] / monthly_data['cantidad']
            monthly_data['costo_promedio'] = monthly_data['costo'] / monthly_data['cantidad']

            #Crear la figura del gráfico
            fig, ax = plt.subplots(figsize=(8, 3))

    #Línea de precio promedio
            ax.plot(
                monthly_data['mes'], 
                monthly_data['precio_promedio'], 
                label='Precio promedio', 
                marker='o', 
                color='#1f77b4'  # Color azul
            )

        #Línea de costo promedio
            ax.plot(
                monthly_data['mes'], 
                monthly_data['costo_promedio'], 
                label='Costo promedio', 
                marker='o', 
                color='#d62728'  # Color rojo
            )

        #Configuración de títulos y leyenda
            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.legend(loc='best')
            ax.grid(True, linestyle='--', alpha=0.3)  # Cuadrícula ligera

     #Mostrar el gráfico en Streamlit
            st.pyplot(fig)
