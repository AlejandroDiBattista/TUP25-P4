import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import io
import base64


st.set_page_config(page_title="Reporte de productos", layout="wide")
st.sidebar.title("Configuración")
uploaded_file = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])


if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()


try:
    df = pd.read_csv(uploaded_file)
except Exception as e:
    st.error(f"No se pudo leer el CSV: {e}")
    st.stop()

# Validar que existan las columnas requeridas
required_cols = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
if not required_cols.issubset(set(df.columns)):
    st.error(f"El CSV debe contener las columnas: {', '.join(required_cols)}")
    st.stop()


df = df.rename(columns={c: c.strip() for c in df.columns})

# Asegurar tipos numéricos
for col in ["año", "mes", "cantidad", "ingreso", "costo"]:
  
    try:
        if col in ["año", "mes"]:
            df[col] = pd.to_numeric(df[col], errors="coerce").astype("Int64")
        else:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    except Exception:
        pass


available_years = sorted([int(y) for y in df["año"].dropna().unique()])
if len(available_years) == 0:
    st.warning("El archivo CSV no contiene años válidos.")
    st.stop()

year_selected = st.sidebar.selectbox("Seleccioná un año", available_years)


df_year = df[df["año"] == int(year_selected)].copy()


if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")


df_year = df_year.dropna(subset=["mes", "producto"])
df_year["mes"] = pd.to_numeric(df_year["mes"], errors="coerce").astype("Int64")
df_year = df_year.dropna(subset=["mes"])


grouped = (
    df_year.groupby(["producto", "mes"], as_index=False)
    .agg({"cantidad": "sum", "ingreso": "sum", "costo": "sum"})
)

# Lista de productos ordenada alfabéticamente
productos = sorted(grouped["producto"].dropna().unique())


for producto in productos:
    # Título del producto (según formato requerido)
    st.markdown(f"## :red[{producto}]")

    # Datos del producto en el año seleccionado
    df_prod = grouped[grouped["producto"] == producto].copy()

  
    df_prod["precio_promedio"] = df_prod.apply(
        lambda r: (r["ingreso"] / r["cantidad"]) if r["cantidad"] != 0 else 0, axis=1
    )
    df_prod["costo_promedio"] = df_prod.apply(
        lambda r: (r["costo"] / r["cantidad"]) if r["cantidad"] != 0 else 0, axis=1
    )

    
    total_cantidad = int(df_prod["cantidad"].sum()) if not df_prod.empty else 0
    # Precio promedio global: total ingreso / total cantidad (evitar división por cero)
    suma_ingreso = df_prod["ingreso"].sum()
    suma_costo = df_prod["costo"].sum()
    precio_promedio_global = (suma_ingreso / total_cantidad) if total_cantidad != 0 else 0
    costo_promedio_global = (suma_costo / total_cantidad) if total_cantidad != 0 else 0

    
    df_prod = df_prod.sort_values("mes")
    meses = df_prod["mes"].tolist()
    precios_mes = df_prod["precio_promedio"].tolist()
    costos_mes = df_prod["costo_promedio"].tolist()

    
    fig, ax = plt.subplots(figsize=(8, 3))
    ax.plot(meses, precios_mes, marker="o", linestyle="-", linewidth=2, label="Precio promedio", color="#1f77b4")
    ax.plot(meses, costos_mes, marker="o", linestyle="-", linewidth=2, label="Costo promedio", color="#d62728")
    ax.set_xlabel("Mes")
    ax.set_ylabel("Monto")
    ax.set_title("Evolución de precio y costo promedio")
    ax.legend(loc="best")
    ax.grid(True, linestyle=":", alpha=0.3)
    ax.set_xticks(meses)
    
    fig.tight_layout()

    
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode("utf-8")
    img_html = f'<img src="data:image/png;base64,{img_b64}" style="max-width:100%; height:auto;" />'

    # Construir HTML del contenedor con borde y dos columnas 30% / 70%
    html = f"""
    <div style="
        border:1px solid #dddddd;
        padding:12px;
        border-radius:8px;
        margin-bottom:16px;
        ">
      <div style="display:flex; gap:16px; align-items:flex-start;">
        <div style="flex: 0 0 30%; max-width:30%;">
          <p style="margin:4px 0;"><strong>Cantidad de ventas:</strong><br>{total_cantidad:,}</p>
          <p style="margin:4px 0;"><strong>Precio promedio:</strong><br>{precio_promedio_global:,.2f}</p>
          <p style="margin:4px 0;"><strong>Costo promedio:</strong><br>{costo_promedio_global:,.2f}</p>
        </div>
        <div style="flex: 1 1 70%; max-width:70%;">
          {img_html}
        </div>
      </div>
    </div>
    """

    # Mostrar el HTML
    st.markdown(html, unsafe_allow_html=True)