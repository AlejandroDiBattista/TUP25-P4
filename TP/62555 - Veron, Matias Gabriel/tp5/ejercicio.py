import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt


st.set_page_config(page_title="Reporte de productos", layout="wide")


st.sidebar.title("Configuración")
uploaded_file = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])


selected_year = None


if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()


@st.cache_data
def load_csv(file):
    df = pd.read_csv(file)
   
    df.columns = [c.strip().lower() for c in df.columns]
   
    required = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Faltan columnas requeridas en el CSV: {', '.join(sorted(missing))}")
    
    for col in ["año", "mes", "cantidad", "ingreso", "costo"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    
    df = df.dropna(subset=["año", "mes", "producto", "cantidad", "ingreso", "costo"])
    
    df["año"] = df["año"].astype(int)
    df["mes"] = df["mes"].astype(int)
    df["producto"] = df["producto"].astype(str).str.strip()
    return df

try:
    df = load_csv(uploaded_file)
except Exception as e:
    st.error(f"Ocurrió un error al leer el CSV: {e}")
    st.stop()


years = sorted(df["año"].unique().tolist())
selected_year = st.sidebar.selectbox("Seleccioná un año", years if years else [])


df_year = df[df["año"] == selected_year] if selected_year is not None else pd.DataFrame(columns=df.columns)
if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")


for prod in sorted(df_year["producto"].unique()):
    df_prod = df_year[df_year["producto"] == prod].copy()

    
    cant_total = df_prod["cantidad"].sum()
    ingreso_total = df_prod["ingreso"].sum()
    costo_total = df_prod["costo"].sum()

    precio_promedio = (ingreso_total / cant_total) if cant_total != 0 else 0.0
    costo_promedio = (costo_total / cant_total) if cant_total != 0 else 0.0

    
    with st.container(border=True):
        
        st.markdown(f"## :red[{prod}]")

        
        col_left, col_right = st.columns([0.3, 0.7])

        with col_left:
            st.markdown("*Cantidad de ventas:* " + f"{cant_total:,.0f}")
            st.markdown("*Precio promedio:* " + f"{precio_promedio:,.2f}")
            st.markdown("*Costo promedio:* " + f"{costo_promedio:,.2f}")

        with col_right:
           
            mensual = (
                df_prod.groupby("mes", as_index=True)
                .agg(cantidad=("cantidad", "sum"),
                     ingreso=("ingreso", "sum"),
                     costo=("costo", "sum"))
                .sort_index()
            )
            
            mensual["precio_promedio"] = mensual.apply(
                lambda r: (r["ingreso"] / r["cantidad"]) if r["cantidad"] != 0 else 0.0, axis=1
            )
            mensual["costo_promedio"] = mensual.apply(
                lambda r: (r["costo"] / r["cantidad"]) if r["cantidad"] != 0 else 0.0, axis=1
            )

           
            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(mensual.index, mensual["precio_promedio"], marker="o", label="Precio promedio", color="#1f77b4")
            ax.plot(mensual.index, mensual["costo_promedio"], marker="o", label="Costo promedio", color="#d62728")

            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.set_title("Evolución de precio y costo promedio")
            ax.legend(loc="best")
            ax.grid(True, linestyle=":", alpha=0.3)

            st.pyplot(fig)