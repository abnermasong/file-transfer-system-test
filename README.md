# file-transfer-system

This repository contains the backend (FastAPI) and frontend (React-JS) for the CIO File Transfer System.

Follow the steps below to setup the system for **local development**.

## 1. Clone the Repository

```bash
git clone https://github.com/smart-study-inc/file-transfer-system
cd file-transfer-system
```

## 2. Install uv as python dependency manager

If you do not have uv installed yet:

```bash
# Install uv (python package manager)
brew install uv
# or
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 3. Run the Application

```bash
cd frontend
# script for running both frontend and backend with freshly installed dependecies
npm run dev:fresh
# go to http://localhost:5173/
```
