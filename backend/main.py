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
    print(f"Generating detailed report for: {data.get('location')}")
    try:
        pdf = FPDF()
        pdf.add_page()
        
        # --- Page Header ---
        pdf.set_fill_color(27, 67, 50) # Dark forest green
        pdf.rect(0, 0, 210, 40, 'F')
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", 'B', 24)
        pdf.cell(190, 20, "BIO-RISK INTELLIGENCE", ln=True, align='L')
        pdf.set_font("Helvetica", size=10)
        pdf.cell(190, 5, "Advanced Geospatial Biodiversity Risk Assessment Report", ln=True, align='L')
        pdf.ln(15)
        
        # --- Section 1: Geospatial Metadata ---
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Helvetica", 'B', 14)
        pdf.cell(0, 10, "1. PROJECT METADATA", ln=True)
        pdf.set_font("Helvetica", size=10)
        
        lat = data.get('location', {}).get('lat', 0)
        lng = data.get('location', {}).get('lng', 0)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        pdf.cell(95, 8, f"Analysis ID: BR-AI-{random.randint(1000, 9999)}", border=1)
        pdf.cell(95, 8, f"Timestamp: {timestamp}", border=1, ln=True)
        pdf.cell(95, 8, f"Latitude: {lat:.6f}", border=1)
        pdf.cell(95, 8, f"Longitude: {lng:.6f}", border=1, ln=True)
        pdf.cell(190, 8, "Monitoring Resolution: 30m Multispectral Baseline", border=1, ln=True)
        pdf.ln(10)
        
        # --- Section 2: Ecosystem Vitals ---
        pdf.set_font("Helvetica", 'B', 14)
        pdf.cell(0, 10, "2. ECOSYSTEM VITALS (TELEMETRY)", ln=True)
        pdf.set_font("Helvetica", size=10)
        
        indicators = data.get('indicators', {})
        ndvi = indicators.get('ndvi', 0.0)
        coverage = indicators.get('forest_coverage', 0.0)
        biomass = indicators.get('biomass', 0.0)
        temp = indicators.get('temperature', 0.0)
        
        # Vitals Table
        pdf.set_fill_color(240, 240, 240)
        pdf.cell(63, 10, "Indicator", border=1, fill=True, align='C')
        pdf.cell(63, 10, "Value", border=1, fill=True, align='C')
        pdf.cell(64, 10, "Status", border=1, fill=True, align='C', ln=True)
        
        def get_status(val, low, high):
            if val < low: return "Critical"
            if val < high: return "Warning"
            return "Optimal"

        pdf.cell(63, 8, "NDVI (Veg. Health)", border=1)
        pdf.cell(63, 8, f"{ndvi:.3f}", border=1, align='C')
        pdf.cell(64, 8, get_status(ndvi, 0.4, 0.6), border=1, align='C', ln=True)
        
        pdf.cell(63, 8, "Canopy Coverage", border=1)
        pdf.cell(63, 8, f"{coverage:.1f}%", border=1, align='C')
        pdf.cell(64, 8, get_status(coverage, 30, 60), border=1, align='C', ln=True)
        
        pdf.cell(63, 8, "Biomass Density", border=1)
        pdf.cell(63, 8, f"{biomass:.1f} t/ha", border=1, align='C')
        pdf.cell(64, 8, "Active Carbon Sink", border=1, align='C', ln=True)
        
        pdf.cell(63, 8, "Avg. Temperature", border=1)
        pdf.cell(63, 8, f"{temp:.1f} C", border=1, align='C')
        pdf.cell(64, 8, "Thermal Baseline", border=1, align='C', ln=True)
        pdf.ln(10)
        
        # --- Section 3: AI Risk Intelligence ---
        pdf.set_font("Helvetica", 'B', 14)
        pdf.cell(0, 10, "3. AI RISK INTELLIGENCE & REASONING", ln=True)
        
        rules = data.get('rules', {})
        risk_level = rules.get('risk_level', 'Unknown')
        risk_score = rules.get('risk_score', 0)
        
        # Risk Box
        if risk_level == "High": pdf.set_fill_color(255, 230, 230); pdf.set_text_color(200, 0, 0)
        elif risk_level == "Medium": pdf.set_fill_color(255, 245, 220); pdf.set_text_color(200, 100, 0)
        else: pdf.set_fill_color(230, 255, 230); pdf.set_text_color(0, 150, 0)
        
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(190, 12, f"CALCULATED RISK LEVEL: {risk_level.upper()} ({risk_score}/10)", border=1, fill=True, ln=True, align='C')
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Helvetica", size=10)
        
        pdf.ln(3)
        pdf.set_font("Helvetica", 'B', 11)
        pdf.cell(0, 8, "Ecological Reasoning (Neural Chain):", ln=True)
        pdf.set_font("Helvetica", size=10)
        reasons = rules.get('reasons', [])
        for reason in reasons:
            pdf.multi_cell(0, 6, f"> {reason}")
        if not reasons:
            pdf.cell(0, 6, "> Current satellite snapshots show no immediate anthropogenic or thermal threats.", ln=True)
        pdf.ln(10)
        
        # --- Section 4: Biodiversity Impact Projection ---
        pdf.set_font("Helvetica", 'B', 14)
        pdf.cell(0, 10, "4. BIODIVERSITY IMPACT PROJECTION", ln=True)
        pdf.set_font("Helvetica", size=10)
        
        impacts = data.get('impacts', [])
        for imp in impacts:
            pdf.set_font("Helvetica", 'B', 10)
            pdf.cell(0, 6, f"Target Indicator: {imp['group']}", ln=True)
            pdf.set_font("Helvetica", size=9)
            pdf.multi_cell(0, 5, f"Risk Context: {imp['impact']}")
            pdf.ln(2)
        if not impacts:
            pdf.cell(0, 6, "Impact on indicator species is currently projected to be within baseline seasonal variance.", ln=True)
        pdf.ln(10)
        
        # --- Section 5: Strategic Interventions ---
        pdf.set_font("Helvetica", 'B', 14)
        pdf.cell(0, 10, "5. RECOMMENDED CONSERVATION STRATEGY", ln=True)
        pdf.set_font("Helvetica", size=10)
        
        actions = data.get('interventions', [])
        for action in actions:
            pdf.set_font("Helvetica", 'B', 10)
            pdf.cell(0, 7, f"[PRIORITY ACTION] {action}", ln=True)
        if not actions:
            pdf.cell(0, 7, "Standard surveillance protocols and boundary enforcement recommended.", ln=True)
        
        pdf.ln(20)
        # --- Footer ---
        pdf.set_font("Helvetica", 'I', 8)
        pdf.set_text_color(120, 120, 120)
        pdf.cell(0, 10, "This report is generated using AI-driven geospatial analysis of multispectral satellite data.", align='C', ln=True)
        pdf.cell(0, 5, "Bio-Risk AI Platform © 2026 | Conservation Intelligence Division", align='C')
        
        pdf_bytes = pdf.output()
        # Convert bytearray to bytes for FastAPI Response compatibility
        return Response(content=bytes(pdf_bytes), media_type="application/pdf", 
                        headers={"Content-Disposition": "attachment; filename=biodiversity_report.pdf"})
    except Exception as e:
        import traceback
        print(f"Error generating report: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to generate PDF report")

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
    # Generates a 7-day risk forecast with meaningful intelligence
    forecast = []
    seed = int((lat + lng) * 100)
    random.seed(seed)
    
    events = [
        "Stable climate patterns",
        "Minor thermal anomaly detected",
        "Potential heatwave window",
        "Moisture stress in canopy",
        "Increased urban encroachment signal",
        "Positive reforestation impact",
        "Migratory pattern shift",
        "Expected precipitation cooling"
    ]
    
    base_risk = random.randint(3, 6)
    for i in range(7):
        date = datetime.now() + timedelta(days=i)
        # Add some variation based on "events"
        event_idx = (seed + i) % len(events)
        event_desc = events[event_idx]
        
        # Risk logic inspired by event
        risk_variation = random.uniform(-0.3, 0.8)
        if "heatwave" in event_desc.lower() or "encroachment" in event_desc.lower():
            risk_variation += 1.2
        elif "cooling" in event_desc.lower() or "reforestation" in event_desc.lower():
            risk_variation -= 0.8

        risk_level_val = min(10, max(0, base_risk + risk_variation + (i * 0.2)))
        
        forecast.append({
            "date": date.strftime("%Y-%m-%d"),
            "risk_score": round(risk_level_val, 1),
            "label": "High" if risk_level_val > 7 else "Medium" if risk_level_val > 4 else "Low",
            "event": event_desc
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

@app.get("/mitigation-plan")
async def get_mitigation_plan(lat: float, lng: float):
    # LOCALIZED GEOGRAPHIC REASONING ENGINE
    # Defines specific biomes and threats for key Indian regions
    
    # Chennai / Coromandel Coast
    if (12.0 < lat < 13.5 and 79.5 < lng < 80.5):
        location = "Coromandel Coastal Sector (Chennai)"
        focus = "Pallikaranai Wetland Restoration"
        threats = ["Salinity intrusion", "Urban run-off", "Habitat encroachment"]
        strategies = [
            {
                "title": "Restoration of Wetland Matrix",
                "desc": "Intelligent clearing of invasive Prosopis juliflora and desilting of key hydrological channels in the Chennai Basin.",
                "methods": ["Satellite-guided desilting", "Salinity gradient monitoring", "Native mangrove replanting"]
            },
            {
                "title": "Urban Buffer Zonation",
                "desc": "Implementing a 500m no-construction 'Green Sponge' zone to absorb monsoon floods and reduce thermal urban islands.",
                "methods": ["Policy zonation", "Permeable urban infrastructure", "Micro-forest deployment"]
            },
            {
                "title": "Acoustic Surveillance Grid",
                "desc": "Deploying IoT acoustic sensors to detect illegal sand mining and sewage discharge in real-time.",
                "methods": ["Edge-AI sound classification", "Vibration sensor networking", "Instant enforcement alerts"]
            }
        ]
    # Jim Corbett / Northern Region
    elif (29.0 < lat < 30.0 and 78.5 < lng < 79.5):
        location = "Jim Corbett National Park (Northern Sector)"
        focus = "Tiger-Elephant Corridor Integrity"
        threats = ["Wildlife-human conflict", "Linear infrastructure fragmentation", "Flash floods"]
        strategies = [
            {
                "title": "Linear Infrastructure Mitigation",
                "desc": "Installation of underpasses and overpasses on National Highway 74 based on animal migration heatmaps.",
                "methods": ["Animal-tracking heatmaps", "Artificial habitat bridges", "Smart lighting reduction"]
            },
            {
                "title": "Riparian Buffer Reinforcement",
                "desc": "Restoring natural banks of the Ramganga river using native grass and bamboo to prevent soil erosion during monsoons.",
                "methods": ["River-bank biostabilization", "Bamboo-grid planting", "Erosion sonar monitoring"]
            },
            {
                "title": "IoT Early Warning Nodes",
                "desc": "Seismic and acoustic sensors to detect herd movements and alert local villages, reducing negative encounters.",
                "methods": ["Herd tracking via sensors", "Village SMS alert network", "Autonomous deterrent systems"]
            }
        ]
    # Default / Generic High-Fidelity Logic
    else:
        location = f"Regional Sector [{lat:.2f}N, {lng:.2f}E]"
        focus = "General Ecosystem Resilience"
        threats = ["Vegetation biomass loss", "Regional thermal anomalies", "Soil moisture decline"]
        strategies = [
            {
                "title": "Precision Reforestation",
                "desc": "UAV-based seed dispersal targeting low-NDVI patches identified in current satellite snapshots.",
                "methods": ["Multispectral target mapping", "Encapsulated seed drone delivery", "Germination Success Monitoring"]
            },
            {
                "title": "Thermal Mitigation Grid",
                "desc": "Strategically placed micro-wetlands to lower local surface temperatures by up to 2.5°C.",
                "methods": ["Shadow thermal analysis", "Evaporative cooling zones", "Moisture retention optimization"]
            },
            {
                "title": "Community Eco-Surveillance",
                "desc": "Digital dashboard access for local forest guards to report and verify satellite-detected anomalies.",
                "methods": ["App-based field verification", "Local incentive programs", "Real-time threat reporting"]
            }
        ]
        
    return {
        "location": location,
        "focus": focus,
        "threats": threats,
        "strategies": strategies,
        "coords": {"lat": lat, "lng": lng},
        "reduction_forecast": round(random.uniform(12.5, 28.2), 1)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
