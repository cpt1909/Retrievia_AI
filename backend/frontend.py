import streamlit as st
import requests
import os
from dotenv import load_dotenv
import time
load_dotenv()

# === PAGE CONFIG ===
st.set_page_config(
    page_title = "Retrievia AI",
    page_icon="",
    layout="centered",
    menu_items={},
)

st.title(body = "Retrievia AI - RAG-based QA System")
st.divider()

API_URL = os.environ.get("BACKEND_URL")
# API_URL = "http://localhost:8000"

# === SESSION STATE ===
if "chat_history" not in st.session_state:
    st.session_state["chat_history"] = []
if "uid" not in st.session_state:
    st.session_state["uid"] = None
if "conn_established" not in st.session_state:
    st.session_state["conn_established"] = False


conn_status = st.empty()
if not st.session_state["conn_established"]:
    with conn_status.container():
        with st.spinner("Connecting..."):
            try:
                res = requests.get(API_URL)
                if res.status_code == 200:
                    st.session_state["conn_established"] = True
                    st.success("Connection established !")
                    time.sleep(1)
            except requests.exceptions.RequestException as e:
                st.warning(f"Connection error: {e}")

    if st.session_state["conn_established"]:
        conn_status.empty()


file = st.file_uploader(
    label="Upload document",
    type=["pdf", "docx", "txt"],
    accept_multiple_files=False,
)

submit = st.button("Upload")
if submit:
    res = requests.put(API_URL, files=file)
    if res.status_code == 200:
        print("hehe")
        print(res.json())
        st.write("Uploaded!")

for chat in st.session_state["chat_history"]:
    role = chat.get("role")
    with st.chat_message(name=role, avatar=role):
        st.write(chat.get("message", ""))

user_input = st.chat_input("Ask a question: ")
if user_input:
    st.session_state["chat_history"].append({"role": "user", "message": user_input})
    st.rerun()