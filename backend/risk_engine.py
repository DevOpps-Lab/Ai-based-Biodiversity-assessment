import numpy as np

class RiskEngine:
    """
    Core logic for calculating biodiversity risk scores using ecological reasoning.
    """
    
    @staticmethod
    def calculate_risk_score(ndvi, urban_presence, temp_anomaly, water_reduction):
        """
        Calculates a score based on environmental indicators.
        
        Rules:
        - NDVI < 0.3: +3 (Degraded habitat)
        - Urban Presence: +3 (Habitat loss)
        - Temp Anomaly > 2.0: +2 (Heat stress)
        - Water Reduction: +2 (Wetland loss)
        """
        score = 0
        reasons = []
        
        if ndvi < 0.3:
            score += 3
            reasons.append("Significant vegetation degradation (NDVI < 0.3)")
        elif ndvi < 0.5:
            score += 1
            reasons.append("Minor vegetation stress")
            
        if urban_presence:
            score += 3
            reasons.append("Urban expansion detected in vicinity")
            
        if temp_anomaly > 2.0:
            score += 2
            reasons.append(f"High heat stress (+{temp_anomaly}°C anomaly)")
        elif temp_anomaly > 1.0:
            score += 1
            reasons.append("Moderate temperature rise")
            
        if water_reduction:
            score += 2
            reasons.append("Wetland or water body reduction detected")
            
        # Classification
        if score >= 7:
            level = "High Risk"
            color = "red"
        elif score >= 4:
            level = "Medium Risk"
            color = "yellow"
        else:
            level = "Low Risk"
            color = "green"
            
        return {
            "score": score,
            "level": level,
            "color": color,
            "reasons": reasons
        }

    @staticmethod
    def estimate_species_impact(reasons):
        """
        Maps risk reasons to affected species groups.
        """
        impacts = []
        for reason in reasons:
            if "vegetation" in reason.lower() or "forest" in reason.lower():
                impacts.append({"group": "Mammals & Insects", "description": "Loss of canopy cover and nesting sites."})
            if "urban" in reason.lower():
                impacts.append({"group": "General Fauna", "description": "Habitat fragmentation and increased human conflict."})
            if "temp" in reason.lower() or "heat" in reason.lower():
                impacts.append({"group": "Pollinators", "description": "Disruption of flowering cycles and heat stress."})
            if "water" in reason.lower() or "wetland" in reason.lower():
                impacts.append({"group": "Birds & Amphibians", "description": "Loss of breeding grounds and hydration sources."})
        
        # Remove duplicates based on group
        unique_impacts = {i['group']: i for i in impacts}.values()
        return list(unique_impacts)
