# Research2Code

Research2Code is a full-stack application that automates the process of converting research papers into executable code. It extracts key information from uploaded PDF papers, generates PyTorch code to reproduce the described models, executes the code in a sandboxed environment, and verifies the authenticity of the paper based on training loss analysis.

## Features

- PDF text extraction from research papers
- AI-powered summarization of model architectures and training parameters
- Automatic PyTorch code generation
- Sandboxed code execution using Docker
- Authenticity verification through loss decrease analysis
- RESTful API backend with FastAPI
- React-based frontend for easy paper upload and result visualization

## Tech Stack

### Backend
- FastAPI (web framework)
- Groq API (AI models for text processing)
- PyMuPDF (PDF text extraction)
- Docker (sandboxed code execution)
- PyTorch (machine learning framework)

### Frontend
- React (user interface)
- Vite (build tool and development server)

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker
- Groq API key

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory and add your Groq API key:
   ```
   GROQ_API_KEY=your_api_key_here
   ```

4. Ensure Docker is running on your system.

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install Node.js dependencies:
   ```
   npm install
   ```

## Usage

### Running the Application
1. Start the backend server:
   ```
   cd backend
   python app.py
   ```
   The backend will run on http://localhost:8000

2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```
   The frontend will run on http://localhost:5173

3. Open your browser and navigate to the frontend URL to upload research papers.

### API Usage
The backend provides a single endpoint for processing papers:

- `POST /process-paper`: Upload a PDF file to process
  - Request: Multipart form data with a file field named "file"
  - Response: JSON containing processing results, including extracted summary, generated code, execution logs, and authenticity verdict

## Project Structure

```
Research2Code/
├── backend/
│   ├── app.py              # Main FastAPI application
│   ├── agent.py            # AI agents for research, coding, and verification
│   ├── sandbox.py          # Docker-based code execution
│   ├── requirements.txt    # Python dependencies
│   └── temp_code/          # Temporary directory for generated code
├── frontend/
│   ├── src/                # React source code
│   ├── package.json        # Node.js dependencies
│   └── vite.config.js      # Vite configuration
└── README.md               # This file
```

## How It Works

1. **Text Extraction**: Extracts text from specific pages of the uploaded PDF (typically pages 3, 4, and 7 for ResNet-style papers).

2. **Research Agent**: Uses AI to summarize the model architecture and training parameters from the extracted text.

3. **Coder Agent**: Generates PyTorch code based on the summary, following specific rules for reproducibility.

4. **Sandbox Execution**: Runs the generated code in a Docker container with PyTorch environment, capturing execution logs.

5. **Verification Agent**: Analyzes the logs to determine if the training loss decreases, providing an authenticity verdict.

6. **Hybrid Logic**: Combines AI verdict with loss analysis for final authenticity determination.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


