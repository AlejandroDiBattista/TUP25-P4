import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt


def main():
    st.set_page_config(page_title="Reporte de productos", layout="wide")

    st.sidebar.title("Configuración")
    uploaded = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"]) 

    # Si hay archivo cargado, leerlo
    if uploaded is None:
        st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
        return

    try:
        df = pd.read_csv(uploaded)
    except Exception as e:
        st.error(f"Error al leer el CSV: {e}")
        return

    # Verificar columnas
    expected = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
    if not expected.issubset(set(df.columns)):
        st.error("El CSV no tiene las columnas requeridas: año, mes, producto, cantidad, ingreso, costo")
        return

    # Normalizar tipos
    df = df.copy()
    df['año'] = df['año'].astype(int)
    df['mes'] = df['mes'].astype(int)
    df['producto'] = df['producto'].astype(str)
    df['cantidad'] = pd.to_numeric(df['cantidad'], errors='coerce').fillna(0)
    df['ingreso'] = pd.to_numeric(df['ingreso'], errors='coerce').fillna(0)
    df['costo'] = pd.to_numeric(df['costo'], errors='coerce').fillna(0)

    años = sorted(df['año'].unique())
    año_sel = st.sidebar.selectbox("Seleccioná un año", options=años)

    # Filtrar por año
    df_año = df[df['año'] == int(año_sel)]
    if df_año.empty:
        st.warning("El año seleccionado no tiene datos para mostrar.")
        return

    # Encabezado principal
    st.title("Informe de Productos 📈")
    st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

    productos = sorted(df_año['producto'].unique())

    # Precalcular agregados mensuales por producto
    grouped = df_año.groupby(['producto', 'mes']).agg({
        'cantidad': 'sum',
        'ingreso': 'sum',
        'costo': 'sum'
    }).reset_index()

    for producto in productos:
        cont = st.container()
        with cont:
            st.markdown(f"## :red[{producto}]")
            cols = st.columns([0.3, 0.7])
            # Métricas
            prod_df = grouped[grouped['producto'] == producto].sort_values('mes')
            total_cantidad = prod_df['cantidad'].sum()
            total_ingreso = prod_df['ingreso'].sum()
            total_costo = prod_df['costo'].sum()
            precio_prom = total_ingreso / total_cantidad if total_cantidad != 0 else 0
            costo_prom = total_costo / total_cantidad if total_cantidad != 0 else 0

            with cols[0]:
                # Mostrar sin decimales: cantidad como entero, montos redondeados a entero
                st.metric("Cantidad de ventas", f"{int(total_cantidad):,}")
                st.write(f"Precio promedio: ${int(round(precio_prom)):,.0f}")
                st.write(f"Costo promedio: ${int(round(costo_prom)):,.0f}")

            with cols[1]:
                # Crear gráfico
                meses = prod_df['mes']
                # calcular precios y costos promedio por mes y redondear a entero para el plotting
                precio_mens = prod_df.apply(lambda r: (r['ingreso'] / r['cantidad']) if r['cantidad']!=0 else 0, axis=1).round(0)
                costo_mens = prod_df.apply(lambda r: (r['costo'] / r['cantidad']) if r['cantidad']!=0 else 0, axis=1).round(0)

                fig, ax = plt.subplots(figsize=(8, 3))
                ax.plot(meses, precio_mens.astype(int), marker='o', color='#1f77b4', label='Precio promedio')
                ax.plot(meses, costo_mens.astype(int), marker='o', color='#d62728', label='Costo promedio')
                ax.set_xlabel('Mes')
                ax.set_ylabel('Monto')
                ax.set_title('Evolución de precio y costo promedio')
                ax.grid(True, linestyle='--', alpha=0.3)
                ax.legend(loc='best')
                st.pyplot(fig)


if __name__ == '__main__':
    main()

st.write("---")

st.caption("Fin del informe")