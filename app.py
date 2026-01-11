from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
import re
import agent
import sandbox

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process-paper")
async def process_paper(file: UploadFile = File(...)):
    session_id = uuid.uuid4().hex[:8]
    temp_pdf = f"paper_{session_id}.pdf"
    
    with open(temp_pdf, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 1. Research
        print(f"[{session_id}] Stage 1: Researcher...")
        text = agent.extract_text(temp_pdf)
        summary = agent.researcher_agent(text)

        # 2. Code
        print(f"[{session_id}] Stage 2: Coder...")
        code = agent.coder_agent(summary)

        # 3. Execute
        print(f"[{session_id}] Stage 3: Sandbox...")
        logs = sandbox.run_code_in_docker(code)

        # 4. Verify
        print(f"[{session_id}] Stage 4: Verifier...")
        verdict_text = agent.verifier_agent(summary, logs)

        # 5. Hybrid Logic
        math_proof = False
        try:
            s_match = re.search(r"LOSS_START:\s*([\d\.]+)", logs)
            e_match = re.search(r"LOSS_END:\s*([\d\.]+)", logs)
            if s_match and e_match:
                if float(e_match.group(1)) < float(s_match.group(1)):
                    math_proof = True
        except:
            pass

        is_authentic = ("AUTHENTIC" in verdict_text.upper()) or math_proof

        return {
            "status": "success",
            "metadata": {
                "session_id": session_id,
                "is_authentic": is_authentic,
                "verdict_label": "AUTHENTIC" if is_authentic else "NOT_VERIFIED"
            },
            "steps": {
                "researcher": {"content": summary},
                "coder": {"content": code},
                "execution": {"content": logs},
                "verifier": {"content": verdict_text}
            }
        }

    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        return {"status": "error", "message": str(e)}

    finally:
        if os.path.exists(temp_pdf):
            os.remove(temp_pdf)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)