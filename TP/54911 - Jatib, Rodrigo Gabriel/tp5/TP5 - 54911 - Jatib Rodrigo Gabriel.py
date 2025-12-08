#TP5 - 54911 - Jatib Rodrigo Gabriel

import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st


st.set_page_config(page_title="Reporte de productos", layout="wide")


with st.sidebar:
    st.header("Configuración")
    uploaded = st.file_uploader("Seleccioná un CSV", type=["csv"])

    year_options = []
    selected_year = None

    if uploaded is not None:
        
        try:
            df = pd.read_csv(uploaded)
        except Exception as e:
            st.error(f"No se pudo leer el CSV: {e}")
            st.stop()

        
        df.columns = [c.strip().lower() for c in df.columns]

        
        required = ["año", "mes", "producto", "cantidad", "ingreso", "costo"]
        missing = [c for c in required if c not in df.columns]
        if missing:
            st.error("El CSV no contiene las columnas requeridas: " + ", ".join(missing))
            st.stop()

        
        df["año"] = pd.to_numeric(df["año"], errors="coerce").astype("Int64")
        df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
        for c in ["cantidad", "ingreso", "costo"]:
            df[c] = pd.to_numeric(df[c], errors="coerce")

        df = df.dropna(subset=["año", "mes", "producto"])

        
        year_options = sorted([int(y) for y in df["año"].dropna().unique().tolist()])
        selected_year = st.selectbox(
            "Seleccioná un año",
            year_options if year_options else [],
            index=0 if year_options else None,
            placeholder="(Sin años disponibles)"
        )
    else:
        
        st.selectbox("Seleccioná un año", [], index=None, placeholder="(Cargá un CSV primero)")


if uploaded is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

if selected_year is None or len(year_options) == 0:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

df_year = df[df["año"] == selected_year].copy()
if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")


def fmt_int(n) -> str:
    try:
        return f"{int(round(n)):,}"
    except Exception:
        return "0"

def fmt_money_2d(n) -> str:
    try:
        return f"{n:,.2f}"
    except Exception:
        return "0.00"


productos = sorted(df_year["producto"].dropna().astype(str).unique().tolist())

for prod in productos:
    d = df_year[df_year["producto"] == prod].copy()

    
    total_cantidad = d["cantidad"].sum(skipna=True)
    total_ingreso = d["ingreso"].sum(skipna=True)
    total_costo   = d["costo"].sum(skipna=True)

    precio_prom = (total_ingreso / total_cantidad) if total_cantidad and total_cantidad != 0 else 0.0
    costo_prom  = (total_costo   / total_cantidad) if total_cantidad and total_cantidad != 0 else 0.0

    
    with st.container(border=True):
        
        st.markdown(f"## :red[{prod}]")

        
        col_left, col_right = st.columns([0.3, 0.7])

        
        with col_left:
            st.write(f"**Cantidad de ventas**\n\n{fmt_int(total_cantidad)}")
            st.write(f"**Precio promedio**\n\n${fmt_money_2d(precio_prom)}")
            st.write(f"**Costo promedio**\n\n${fmt_money_2d(costo_prom)}")

        
        with col_right:
            
            monthly = (
                d.groupby("mes", dropna=True)[["ingreso", "costo", "cantidad"]]
                .sum(min_count=1)
                .sort_index()
            )
            monthly = monthly[monthly["cantidad"] > 0]

            if monthly.empty:
                st.info("Sin datos mensuales suficientes para graficar.")
            else:
                monthly["precio_prom"] = monthly["ingreso"] / monthly["cantidad"]
                monthly["costo_prom"]  = monthly["costo"]  / monthly["cantidad"]

                x = monthly.index.tolist()
                y_price = monthly["precio_prom"].tolist()
                y_cost  = monthly["costo_prom"].tolist()

                
                fig, ax = plt.subplots(figsize=(8, 3))
                ax.plot(x, y_price, marker="o", label="Precio promedio", color="#1f77b4")
                ax.plot(x, y_cost,  marker="o", label="Costo promedio",  color="#d62728")

                ax.set_xlabel("Mes")
                ax.set_ylabel("Monto")
                ax.set_title("Evolución de precio y costo promedio")
                ax.grid(True, linestyle="--", alpha=0.3)  
                ax.legend(loc="best")
                ax.set_xticks(range(1, 12 + 1))

                st.pyplot(fig)