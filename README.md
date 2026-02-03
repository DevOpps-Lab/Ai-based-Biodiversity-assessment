# AI-Driven Biodiversity Risk Prediction System

This is a full-stack geospatial intelligence system that predicts biodiversity risk using satellite-derived indicators and ecological reasoning.

## 📁 Project Structure
- **/backend**: FastAPI server with the Risk Engine and ML Model.
- **/frontend**: React dashboard with Leaflet map and Recharts analysis.

## 🚀 Getting Started

### 1. Start the Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
The API will be available at `http://localhost:8000`.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## 🛰️ Architecture
- **Risk Engine**: Rule-based ecological reasoning.
- **ML Model**: Random Forest classifier for risk confirmation.
- **Geospatial UI**: Interactive Leaflet map with grid-based risk layers.
- **Decision Support**: Explainable AI panel and "What-if" simulation.

---
Built with Antigravity 🧠
