# file-transfer-system

This repository contains the backend (FastAPI) and frontend (React-JS) for the CIO File Transfer System.

Follow the steps below to setup the system for **local development**.

## 1. Clone the Repository

```bash
git clone https://github.com/smart-study-inc/file-transfer-system
cd file-transfer-system
```

## 2. Set Up Python Environment (Using uv)

This project uses uv as the Python dependency manager.

If you do not have uv installed yet:

```bash
# Install uv (python package manager)
brew install uv
# or
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Create a virtual environment and sync dependencies from pyproject.toml / uv.lock:

```bash
uv venv
source .venv/bin/activate
uv sync
```

## 3. Run the Backend (FastAPI)

```bash
uv run python run.py
```

## 4. Run the Frontend (React-JS)

```bash
cd frontend
npm install
npm run dev
```
