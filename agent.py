import os
import fitz
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_text(pdf_path):
    doc = fitz.open(pdf_path)
    content = ""
    # Extract pages 3, 4, and 7 (Standard for ResNet-style papers)
    for i in [2, 3, 6]:
        if i < len(doc):
            content += doc[i].get_text()
    return content

def clean_code(raw_response):
    """Removes markdown backticks so the code can run in Docker."""
    if "```python" in raw_response:
        raw_response = raw_response.split("```python")[1].split("```")[0]
    elif "```" in raw_response:
        raw_response = raw_response.split("```")[1].split("```")[0]
    return raw_response.strip()

def researcher_agent(paper_text):
    prompt = f"Extract the model architecture and training parameters from this text:\n\n{paper_text[:4000]}"
    # Ensure 'response' is defined here
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a research assistant. Summarize architecture and loss functions."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

def coder_agent(summary):
    prompt = (
        f"Based on this summary: {summary}, write a PyTorch script. "
        "Rules: Use lr=0.1, fixed random tensors outside the loop, and move model to CUDA/CPU. "
        "Print ONLY 'LOSS_START: <v>' and 'LOSS_END: <v>'. Output ONLY raw code."
    )
    # Ensure 'response' is defined here
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an elite ML engineer. Output raw Python only."},
            {"role": "user", "content": prompt}
        ]
    )
    return clean_code(response.choices[0].message.content)

def verifier_agent(summary, logs):
    prompt = (
        f"Summary: {summary}\nLogs: {logs}\n\n"
        "Does the loss decrease? Provide a verdict: AUTHENTIC or NOT_VERIFIED."
    )
    # Ensure 'response' is defined here
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a scientific verification agent."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content