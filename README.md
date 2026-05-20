# MedTrial - AI-Powered Clinical Trial Assistant

**MedTrial** is a full-stack clinical decision support platform built to help clinical researchers, CROs, and medical investigators ingest patient data, match patients to trial eligibility, evaluate safety risk, and query clinical context with AI-powered reasoning.

---

## 🌟 Functionality

- **Patient Intake & Document Ingestion**
  - Capture demographic details, medical history, medications, and clinical status.
  - Upload PDFs and extract report text using `pdfplumber` and `PyPDF2`.

- **Clinical Trial Eligibility Matching**
  - Automated rule-based eligibility engine evaluates inclusion/exclusion criteria.
  - Computes a clinical match score and categorizes candidates as **Eligible**, **Borderline**, or **Excluded**.
  - Detects contraindications and safety flags, including medication interactions and protocol risks.

- **Retrieval-Augmented Generation (RAG) Chat**
  - Builds a vector store from patient records and trial criteria using `ChromaDB`.
  - Supports semantic clinical queries with source citations and relevance scoring.

- **AI Reasoning Summaries**
  - Uses Google Gemini AI models through LangChain to generate medical reasoning and trial safety narratives.

- **User Authentication and Secure Access**
  - JWT-based auth with protected endpoints for patient intake, evaluation, and RAG queries.

- **Admin / Diagnostic Controls**
  - Configure Gemini API keys, inspect logs, and tune reasoning behavior via app settings.

---

## 🧱 Technology Stack

### Backend
- `FastAPI` — high-performance Python web API framework
- `Pydantic` / `pydantic-settings` — request validation and configuration management
- `PyMongo` — MongoDB access layer
- `MongoDB` / `MongoDB Atlas` — primary database
- `mongomock` — fallback in-memory MongoDB for local development or offline use
- `JWT` / `python-jose` — token-based authentication
- `bcrypt` — password hashing
- `PyPDF2` + `pdfplumber` — PDF extraction
- `LangChain` + `ChromaDB` — semantic retrieval and vector search
- `google-generativeai` — Gemini API access for text reasoning and embeddings

### Frontend
- `React` — client-side single-page application
- `Vite` — fast development and production build tooling
- `Tailwind CSS` — utility-first styling system
- `Axios` — HTTP client for API integration
- `react-router-dom` — declarative routing
- `Chart.js` + `react-chartjs-2` — visual analytics and dashboards
- `lucide-react` — iconography

---

## 📁 Project Structure

```text
MedTrial/
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI route controllers
│   │   │   ├── auth.py           # Auth, registration, login, JWT
│   │   │   ├── patients.py       # Patient ingestion and management
│   │   │   ├── evaluations.py    # Trial matching and scoring
│   │   │   └── rag.py            # RAG query endpoint
│   │   ├── core/                 # Configuration, database, security
│   │   ├── schemas/              # Pydantic models and validation
│   │   ├── services/             # Business logic for matching, PDF, RAG
│   │   └── main.py               # Application startup and middleware
│   ├── chroma_db/                # Local ChromaDB vector store files
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile                # Backend container definition
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI building blocks
│   │   ├── pages/                # Route-level pages and workflows
│   │   ├── services/             # API utility and request handling
│   │   ├── context/              # React global state providers
│   │   ├── App.jsx               # Routing and layout shell
│   │   └── main.jsx              # React entrypoint
│   ├── tailwind.config.cjs      # Tailwind configuration
│   └── vite.config.js            # Vite dev / build config
└── README.md                     # Project documentation
```

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB or MongoDB Atlas connection
- Gemini API key for AI reasoning

### Backend Setup

1. Open a terminal and go to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `backend/.env`:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - `GEMINI_API_KEY`
   - `JWT_SECRET_KEY`

5. Start the backend server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

### Frontend Setup

1. Open a new terminal and go to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development client:
   ```bash
   npm run dev
   ```

---

## 📌 Deployment Notes

- The backend Dockerfile is located at `backend/Dockerfile`.
- The frontend is a Vite app and should be built with `npm run build`.
- Production should use a secure `JWT_SECRET_KEY` and lock down CORS origins.
- `GEMINI_API_KEY` must be provided for semantic AI features.

---

## 🧪 Verification

If you want to run a test script for basic flow checks, use the verification script noted in the project documentation when available.

---

## 📬 Contact

For deployment questions or integration support, use the project owner’s configured contact details in your internal documentation.
