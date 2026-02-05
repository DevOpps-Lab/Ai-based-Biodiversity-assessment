# 🌿 Bio-Risk Intelligence: AI-Driven Biodiversity Prediction

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-199903?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)

**Bio-Risk Intelligence** is a state-of-the-art geospatial platform designed to monitor, analyze, and predict ecological risks. By leveraging multispectral satellite data and a hybrid AI reasoning engine, it provides actionable insights for conservation planning and biodiversity protection.

---

## 🚀 Key Features

- **🛰️ Satellite-Derived Intelligence**: Processes real-time (simulated) multispectral data including NDVI (Vegetation Health), LST (Land Surface Temperature), and Land Use patterns.
- **🧠 Dual-AI Reasoning Engine**: 
  - **Rule-Based Ecological Logic**: Deterministic reasoning based on established environmental thresholds.
  - **Machine Learning (ML)**: Random Forest Classifier for predictive risk confirmation and trend analysis.
- **🗺️ Interactive Geospatial Dashboard**: High-resolution mapping with Leaflet, featuring grid-based risk overlays and site-specific telemetry.
- **� What-If Scenario Simulations**: Project future risks by simulating urban expansion and climate-driven temperature increases.
- **📄 Professional Eco-Intelligence Reports**: Automated generation of detailed PDF reports for conservation stakeholders.
- **🇮🇳 Localized Mitigation Strategies**: Biome-specific action plans (e.g., Wetland restoration in Chennai vs. Wildlife corridor integrity in Jim Corbett).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Mapping**: Leaflet / React-Leaflet
- **Data Viz**: Recharts (Telemetry & Forecasts)
- **UI/UX**: Framer Motion (Animations), Lucide React (Icons)
- **State Management**: React Hooks & Context API

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Validation**: Pydantic
- **Data Science**: Scikit-Learn, NumPy, Pandas
- **PDF Core**: FPDF2
- **Server**: Uvicorn

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Satellite Data Feed] --> B[Satellite Feature Processor]
    B --> C{Hybrid AI Engine}
    C --> D[Advanced Risk Engine - Rule Based]
    C --> E[ML Risk Model - Random Forest]
    D & E --> F[API Layer - FastAPI]
    F --> G[React Dashboard]
    G --> H[Interactive Maps]
    G --> I[PDF Intelligence Reports]
    G --> J[What-If Simulations]
```

---

## � Getting Started

### Prerequisites
- Python 3.9+ 
- Node.js 18+

### 🏠 1. Setup Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Mac/Linux
pip install -r requirements.txt
python main.py
```
*The API will be live at `http://127.0.0.1:8000`*

### 💻 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*Access the dashboard at `http://localhost:5173`*

---

## 🧪 Environmental Indicators
The system monitors four primary indicators to determine risk:
1. **NDVI (Normalized Difference Vegetation Index)**: Measures canopy health and biomass density.
2. **Land Use Analysis**: Detects shifts between Forest, Urban, Agriculture, and Water bodies.
3. **Thermal Anomaly**: Tracks departures from regional temperature baselines (Heat Island Effect).
4. **Hydrological Stability**: Monitors moisture levels and wetland persistence.

---

## 📺 Demo Video
Watch the platform in action: [Bio-Risk Intelligence Demo](https://youtu.be/HTevqclV9ak)

## 📄 License
This project is developed for educational and research purposes in biodiversity conservation.

---

