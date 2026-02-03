from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import numpy as np
from datetime import datetime, timedelta
from fpdf import FPDF
import io
from fastapi.responses import Response

from risk_engine.ecological_risk import AdvancedRiskEngine
from ml.risk_model import BiodiversityRiskModel
from data_processing.satellite_features import SatelliteProcessor

app = FastAPI(title="Biodiversity Risk API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ml_service = BiodiversityRiskModel()
processor = SatelliteProcessor(grid_size=5)

class RegionRequest(BaseModel):
    lat: float
    lng: float
    min_lat: float = None
    min_lng: float = None
    max_lat: float = None
    max_lng: float = None
    # Simulation Parameters
    urban_growth_pct: float = 0.0
    temp_increase: float = 0.0
    # Manual overrides (legacy)
    ndvi: float = None
    urban: bool = None
    temp_anomaly: float = None
    water_reduction: bool = None

@app.get("/")
async def root():
    return {"status": "online", "message": "Biodiversity Risk Intelligence API"}

@app.post("/analyze-region")
async def analyze_region(req: RegionRequest):
    # If explicit parameters are provided, use them (legacy/manual override)
    if req.ndvi is not None:
        return process_single_point(req.lat, req.lng, req.ndvi, req.urban, req.temp_anomaly, req.water_reduction)
    
    # Otherwise, use the Satellite Pipeline
    min_lat = req.min_lat if req.min_lat is not None else req.lat - 0.025
    max_lat = req.max_lat if req.max_lat is not None else req.lat + 0.025
    min_lng = req.min_lng if req.min_lng is not None else req.lng - 0.025
    max_lng = req.max_lng if req.max_lng is not None else req.lng + 0.025
    
    grid_data = processor.get_grid_features(min_lat, min_lng, max_lat, max_lng)
    
    results = []
    for cell in grid_data:
        # --- Apply Simulation Logic ---
        cell["temperature"] += req.temp_increase
        if cell["land_use"] != "urban" and random.random() < (req.urban_growth_pct / 100.0):
            cell["land_use"] = "urban"
            cell["ndvi"] *= 0.4
            cell["water_index"] *= 0.5
            cell["temperature"] += 3.0
            
        # Rule-based logic
        rule_results = AdvancedRiskEngine.evaluate_risk(
            cell["ndvi"], cell["land_use"], cell["temperature"], cell["water_index"]
        )
        
        # ML logic
        ml_results = ml_service.predict(
            cell["ndvi"], cell["land_use"], cell["temperature"], cell["water_index"]
        )
        
        # Species Impacts & Interventions
        species_impacts = AdvancedRiskEngine.estimate_species_impact(rule_results["reasons"])
        interventions = AdvancedRiskEngine.get_interventions(rule_results["reasons"])
        
        results.append({
            "grid_id": cell["grid_id"],
            "location": {"lat": cell["lat"], "lng": cell["lng"]},
            "indicators": cell,
            "rules": rule_results,
            "ml": ml_results,
            "impacts": species_impacts,
            "interventions": interventions
        })
    
    center_index = len(results) // 2
    response = results[center_index].copy()
    response["grid"] = results
    return response

@app.post("/generate-report")
async def generate_report(data: dict):
    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font("Arial", 'B', 20)
    pdf.set_text_color(46, 204, 113) 
    pdf.cell(190, 15, "Biodiversity Risk Intelligence Report", ln=True, align='C')
    pdf.ln(5)
    
    # Summary Section
    pdf.set_font("Arial", 'B', 14)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(100, 10, "1. Risk Summary", ln=True)
    pdf.set_font("Arial", size=11)
    pdf.cell(100, 7, f"Region Center: {data['location']['lat']:.4f}, {data['location']['lng']:.4f}", ln=True)
    pdf.cell(100, 7, f"Risk Level: {data['rules']['risk_level']}", ln=True)
    pdf.cell(100, 7, f"Risk Score: {data['rules']['risk_score']}/10", ln=True)
    pdf.cell(100, 7, f"AI Classifier Confidence: {data['ml']['confidence']*100:.1f}%", ln=True)
    pdf.ln(5)
    
    # Reasoning Section
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(100, 10, "2. Ecological Reasoning", ln=True)
    pdf.set_font("Arial", size=11)
    for reason in data['rules']['reasons']:
        pdf.multi_cell(0, 7, f"- {reason}")
    if not data['rules']['reasons']:
        pdf.cell(100, 7, "No critical stressors detected.")
    pdf.ln(5)
    
    # Species Impacts
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(100, 10, "3. Biodiversity Impact Projection", ln=True)
    pdf.set_font("Arial", size=11)
    for imp in data['impacts']:
        pdf.set_font("Arial", 'B', 11)
        pdf.cell(100, 7, f"Group: {imp['group']}", ln=True)
        pdf.set_font("Arial", size=11)
        pdf.multi_cell(0, 7, f"Impact: {imp['impact']}")
        pdf.ln(2)
    pdf.ln(5)
    
    # Interventions
    pdf.set_font("Arial", 'B', 14)
    pdf.set_text_color(46, 204, 113)
    pdf.cell(100, 10, "4. Suggested Interventions", ln=True)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=11)
    for action in data.get('interventions', []):
        pdf.multi_cell(0, 8, f"[ACTION] {action}", border=0)
    pdf.ln(10)
    
    # Footer
    pdf.set_font("Arial", 'I', 8)
    pdf.cell(0, 10, f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Bio-Risk AI Platform", align='C')
    
    pdf_output = pdf.output(dest='S')
    return Response(content=pdf_output, media_type="application/pdf", 
                    headers={"Content-Disposition": "attachment; filename=biodiversity_report.pdf"})

def process_single_point(lat, lng, ndvi, urban, temp, water):
    land_use = "urban" if urban else "forest"
    water_index = 0.05 if water else 0.5
    rule_results = AdvancedRiskEngine.evaluate_risk(ndvi, land_use, temp + 25.0, water_index)
    ml_results = ml_service.predict(ndvi, land_use, temp + 25.0, water_index)
    species_impacts = AdvancedRiskEngine.estimate_species_impact(rule_results["reasons"])
    interventions = AdvancedRiskEngine.get_interventions(rule_results["reasons"])
    
    return {
        "location": {"lat": lat, "lng": lng},
        "indicators": {
            "ndvi": round(ndvi, 3), "urban": urban, "temp_anomaly": round(temp, 2), "water_reduction": water
        },
        "rules": rule_results,
        "ml": ml_results,
        "impacts": species_impacts,
        "interventions": interventions
    }

    return data

@app.get("/trend-data")
async def get_trend_data(lat: float, lng: float):
    data = []
    current_date = datetime.now()
    base_ndvi = random.uniform(0.6, 0.8)
    base_temp = 24.0
    initial_ndvi = base_ndvi
    for i in range(12):
        month_date = current_date - timedelta(days=30 * (11 - i))
        base_ndvi -= random.uniform(-0.01, 0.03)
        base_temp += random.uniform(-0.5, 1.0)
        decline_pct = max(0, ((initial_ndvi - base_ndvi) / initial_ndvi) * 100)
        data.append({
            "date": month_date.strftime("%b %Y"),
            "ndvi": max(0, min(1, round(base_ndvi, 3))),
            "temperature": round(base_temp, 1),
            "decline_pct": round(decline_pct, 1)
        })
    return data

@app.get("/forecast")
async def get_forecast(lat: float, lng: float):
    # Generates a 7-day risk forecast based on lat/lng baseline
    # In a real app, this would query a predictive model
    forecast = []
    # Create a stable baseline for this location
    seed = int((lat + lng) * 100)
    random.seed(seed)
    
    base_risk = random.randint(3, 6)
    for i in range(7):
        date = datetime.now() + timedelta(days=i)
        # Add some upward trend to simulate "forecasted risk"
        risk_variation = random.uniform(-0.5, 1.5)
        risk_level = min(10, max(0, base_risk + risk_variation + (i * 0.3)))
        forecast.append({
            "date": date.strftime("%Y-%m-%d"),
            "risk_score": round(risk_level, 1),
            "label": "High" if risk_level > 7 else "Medium" if risk_level > 4 else "Low"
        })
    return forecast

@app.get("/alerts")
async def get_alerts(lat: float, lng: float):
    # Generates active alerts based on region context
    # Use lat/lng to seed for stability
    seed = int((lat + lng) * 1000)
    random.seed(seed)
    
    potential_alerts = [
        {"type": "Fire Risk", "severity": "High", "desc": "High thermal anomaly detected in northern sector."},
        {"type": "Deforestation", "severity": "Medium", "desc": "Unusual canopy loss detected via NDVI temporal analysis."},
        {"type": "Illegal Logging", "severity": "High", "desc": "Acoustic sensors triggered in protected buffer zone."},
        {"type": "Extreme Heat", "severity": "Medium", "desc": "Extended dry spell impacting primary growth."},
        {"type": "Invasive Species", "severity": "Low", "desc": "Suspicious spectral signatures detected in wetland zone."}
    ]
    
    # Return 2-3 semi-stable alerts for this region
    count = random.randint(2, 3)
    return random.sample(potential_alerts, count)

@app.post("/simulate")
async def simulate_scenario(req: RegionRequest):
    return await analyze_region(req)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
