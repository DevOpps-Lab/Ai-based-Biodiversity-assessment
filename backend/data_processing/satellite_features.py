import numpy as np
import random
from typing import Dict, List, Any

class SatelliteProcessor:
    """
    Simulates or integrates real satellite data ingestion.
    Calculates NDVI, Land Use, Temperature, and Water Index for a given region.
    """
    
    def __init__(self, grid_size: int = 5):
        self.grid_size = grid_size

    def get_grid_features(self, min_lat: float, min_lng: float, max_lat: float, max_lng: float) -> List[Dict[str, Any]]:
        """
        Divides the bounding box into a grid and generates features for each cell.
        """
        # Ensure consistency for the same location
        seed = int((min_lat + min_lng) * 1000000)
        random.seed(seed)
        
        grid_cells = []
        lat_step = (max_lat - min_lat) / self.grid_size
        lng_step = (max_lng - min_lng) / self.grid_size
        
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                cell_lat = min_lat + (i + 0.5) * lat_step
                cell_lng = min_lng + (j + 0.5) * lng_step
                
                # Logic: In a real app, this calls Sentinel Hub / Google Earth Engine
                # Here we simulate realistic distributions
                
                # 1. Land Use (Forest, Urban, Water, Agriculture)
                land_use_probs = [0.4, 0.2, 0.1, 0.3] # Forest, Urban, Water, Agri
                land_use = random.choices(["forest", "urban", "water", "agriculture"], weights=land_use_probs)[0]
                
                # 2. NDVI (Vegetation Health)
                if land_use == "forest":
                    ndvi = random.uniform(0.6, 0.9)
                elif land_use == "agriculture":
                    ndvi = random.uniform(0.4, 0.7)
                elif land_use == "urban":
                    ndvi = random.uniform(0.1, 0.3)
                else: # water
                    ndvi = random.uniform(0, 0.1)
                
                # 3. Temperature (Land Surface Temp)
                # Urban areas are usually hotter (Heat Island Effect)
                base_temp = 25.0
                if land_use == "urban":
                    temp = base_temp + random.uniform(5, 10)
                elif land_use == "forest":
                    temp = base_temp + random.uniform(-2, 2)
                else:
                    temp = base_temp + random.uniform(0, 5)
                
                # 4. Water Presence Index (0.0 - 1.0)
                if land_use == "water":
                    water_index = random.uniform(0.8, 1.0)
                elif land_use == "forest":
                    water_index = random.uniform(0.1, 0.3)
                else:
                    water_index = random.uniform(0, 0.1)
                
                # 5. Biomass Estimation (Metric Tons per Hectare)
                # Forest has highest biomass, urban lowest
                if land_use == "forest":
                    biomass = ndvi * 450 + random.uniform(-10, 10)
                    coverage = random.uniform(75, 98)
                elif land_use == "agriculture":
                    biomass = ndvi * 200 + random.uniform(-5, 5)
                    coverage = random.uniform(20, 45)
                elif land_use == "urban":
                    biomass = ndvi * 50 + random.uniform(0, 5)
                    coverage = random.uniform(5, 15)
                else: # water
                    biomass = ndvi * 10 + random.uniform(0, 2)
                    coverage = random.uniform(0, 5)

                grid_cells.append({
                    "grid_id": f"{i}_{j}",
                    "lat": round(cell_lat, 5),
                    "lng": round(cell_lng, 5),
                    "ndvi": round(ndvi, 3),
                    "land_use": land_use,
                    "temperature": round(temp, 1),
                    "water_index": round(water_index, 2),
                    "biomass": round(max(0, biomass), 1),
                    "forest_coverage": round(max(0, coverage), 1)
                })
                
        return grid_cells

    @staticmethod
    def map_to_risk_engine(cell: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converts satellite features to the format expected by the RiskEngine.
        """
        return {
            "ndvi": cell["ndvi"],
            "urban_presence": cell["land_use"] == "urban",
            "temp_anomaly": max(0, cell["temperature"] - 25.0), # Assuming 25C is baseline
            "water_reduction": cell["water_index"] < 0.1 and cell["land_use"] != "water" # Simplified logic
        }
