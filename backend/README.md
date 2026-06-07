# Backend (FastAPI + SQLite)

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

API runs at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.
