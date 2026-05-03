# 🔍 AI Dataset Explorer

An interactive web application for automated dataset analysis with AI-powered insights. Upload any CSV, Excel, or JSON dataset and get instant exploratory data analysis, interactive visualizations, and a streaming AI chat that can answer questions about your data.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![LangChain](https://img.shields.io/badge/LangChain-AI-orange)

## ✨ Features

- **Dataset Upload** — Drag-and-drop CSV, Excel (.xlsx), or JSON files (up to 50 MB)
- **Auto EDA** — Automatic exploratory data analysis with statistics, missing values, column types
- **Interactive Charts** — Auto-generated Plotly charts (histograms, bar charts, correlation heatmap, scatter plots, box plots, pie charts)
- **AI Chat** — Ask natural language questions about your data with streaming responses powered by GPT-4o-mini via LangChain
- **Data Preview** — View the first 20 rows of your dataset in a clean table

## 🏗️ Architecture

```
ai-dataset-explorer/
├── backend/          # Python FastAPI server
│   ├── main.py       # App entry point
│   ├── config.py     # Environment config
│   ├── store.py      # In-memory session store
│   ├── routes/       # API endpoints
│   └── services/     # Business logic (data, charts, AI)
├── frontend/         # React + Vite + TypeScript
│   └── src/
│       ├── components/   # UI components
│       ├── api/          # API client
│       ├── context/      # React context
│       └── types/        # TypeScript types
├── .env.example      # Environment template
└── README.md
```

## 🚀 Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **OpenAI API Key** — [Get one](https://platform.openai.com/api-keys)

## 📦 Setup & Run

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ai-dataset-explorer
```

### 2. Set up environment variables

```bash
# Copy the example env file
cp .env.example backend/.env

# Edit backend/.env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-actual-key
```

### 3. Start the Backend

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`. You can check `http://localhost:8000/api/health` to verify.

### 4. Start the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 5. Use the Application

1. Open `http://localhost:5173` in your browser
2. Drag & drop a CSV, Excel, or JSON file (or click to browse)
3. Preview your data in the table
5. Switch to the **AI Chat** tab to ask questions about your data

### 📸 Example Usage

Here is a step-by-step example using a sample dataset (e.g., the Titanic dataset or a sales CSV). To add your own screenshots, capture the screens described below, save them in a `docs/screenshots/` folder, and the links will automatically render in this README.

1. **Upload the Dataset**  
   Drag and drop your `dataset.csv` file into the upload zone.  
   *(Add a screenshot of the homepage with the upload area)*  
   `![Upload Screen](docs/screenshots/1_upload.png)`

2. **Data Preview**  
   Instantly view the first 20 rows of your dataset to verify the columns and formatting.  
   *(Add a screenshot of the data table preview)*  
   `![Data Preview](docs/screenshots/2_preview.png)`

3. **Exploratory Data Analysis (EDA) & Charts**  
   Click "Analyze Dataset" to automatically generate statistics and interactive charts (histograms, heatmaps, scatter plots).  
   *(Add a screenshot showing the generated charts and statistics)*  
   `![EDA and Charts](docs/screenshots/3_charts.png)`

4. **AI Chat**  
   Switch to the "AI Chat" tab and ask questions like: *"What is the average age?"* or *"Summarize the key trends in this data."* The AI will stream the response back based on your dataset's context.  
   *(Add a screenshot of the chat interface with a sample question and answer)*  
   `![AI Chat](docs/screenshots/4_chat.png)`

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, Uvicorn |
| Data | pandas, NumPy |
| Visualization | Plotly (server-side generation, client-side rendering) |
| AI | LangChain, OpenAI GPT-4o-mini |
| Streaming | Server-Sent Events (SSE) |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/upload` | Upload a dataset file |
| `GET` | `/api/eda/{session_id}` | Get EDA results |
| `GET` | `/api/charts/{session_id}` | Get auto-generated charts |
| `POST` | `/api/chat/{session_id}` | Chat with your data (SSE streaming) |

## 📝 Notes

- Datasets are stored in memory (server restart clears them)
- Maximum file size: 50 MB
- Supported formats: CSV, Excel (.xlsx), JSON
- The AI chat uses GPT-4o-mini for cost-effective, fast responses
- All charts are interactive (zoom, pan, hover tooltips)
