import streamlit as st
import os

st.set_page_config(page_title="WealthPulse Advisor Copilot", layout="wide", initial_sidebar_state="collapsed")

# Inject custom CSS to hide Streamlit's default headers and padding so the React app takes full screen
st.markdown("""
    <style>
        .block-container { padding: 0 !important; max-width: 100% !important; }
        header { display: none !important; }
        footer { display: none !important; }
        #MainMenu { display: none !important; }
    </style>
""", unsafe_allow_html=True)

# Function to load React SPA
def render_react_app():
    html_path = os.path.join(os.path.dirname(__file__), "dist", "index.html")
    
    if not os.path.exists(html_path):
        st.error(f"React build not found at `{html_path}`")
        st.info("Make sure to build your React app first using `npm run build` and ensure the output is in the `dist` folder.")
        return

    # In single-file builds or if components are inline, we can output directly.
    # But usually React on Streamlit requires an iframe. 
    # NOTE: Native Streamlit does not easily path routes. If you deploy to Streamlit Community Cloud, 
    # it is highly recommended to build your Vite app using a single file plugin or Vercel. 
    
    with open(html_path, "r", encoding="utf-8") as f:
        html_data = f.read()

    st.components.v1.html(html_data, height=1000, scrolling=True)

render_react_app()
