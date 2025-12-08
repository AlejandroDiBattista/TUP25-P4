import streamlit as st
from openai import OpenAI

client = OpenAI(api_key=st.secrets["OPENAI_API_KEY"])

modelo      = "gpt-4.1"
instruccion = """
Eres un asistente útil y creativo. Da respuestas claras y concisas. 

Usa la herramienta de búsqueda web cuando necesites datos recientes o verificados.

Cuando se te solicite una pregunta matemática, escribe y ejecuta código usando la herramienta de python para responder la pregunta.
Cuando uses python mostrame el codigo que generaste usando bloque de codigo ```python...
"""

s = st.session_state

with st.sidebar:
    st.title("Configuración")
    modelo      = st.selectbox("Selecciona el modelo:", ["gpt-4.1","gpt-5", "gpt-5-mini", "gpt-5-nano"], index=1)
    instruccion = st.text_area("Instrucciones del asistente:", instruccion.strip(), height="content")
    if st.button("Reiniciar chat"):
        s.messages = []
        

st.title(f"Charla con :rainbow[{modelo.upper()}]")
    
# Inicializar el historial de chat en session_state
if "messages" not in s:
    s.messages = []

# Mostrar mensajes del historial
for message in s.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Input del usuario usando chat_input
if prompt := st.chat_input("Escribe tu mensaje..."):
    
    # Agregar mensaje del usuario al historial
    s.messages.append({"role": "user", "content": prompt})
    st.chat_message("user").markdown(prompt)
    
    # Obtener respuesta del asistente con spinner
    with st.spinner("Pensando..."):
        response = client.responses.create(
            model=modelo,
            instructions=instruccion,
            input=s.messages,
            text={ "format": { "type": "text" }, "verbosity": "medium" },
            tools=[
                {
                    "type": "web_search",
                    "user_location": {
                        "type": "approximate"
                    },
                    "search_context_size": "medium"
                },
                {
                    "type": "code_interpreter",
                    "container": {
                     "type": "auto",
                        "file_ids": []
                    }
                }
            ],            
        )
        respuesta = response.output_text
        s.messages.append({"role": "assistant", "content": respuesta})
    
    # Forzar re-ejecución para mostrar los mensajes actualizados
    st.rerun()

