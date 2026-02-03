from typing import List, Dict, Any

class AdvancedRiskEngine:
    """
    Production-level biodiversity risk engine using weighted scoring 
    and transparent ecological reasoning.
    """
    
    @staticmethod
    def evaluate_risk(ndvi: float, land_use: str, temperature: float, water_index: float) -> Dict[str, Any]:
        """
        Calculates a weighted risk score based on environmental indicators.
        
        Rules:
        - NDVI < 0.3: +3 (Critical vegetation degradation)
        - Land Use == 'urban': +3 (Habitat loss / fragmentation)
        - Temperature > 33.0: +2 (Heat stress / Thermal anomaly)
        - Water Index < 0.2: +2 (Hydrological stress)
        """
        risk_score = 0
        reasons = []
        
        # 1. Vegetation Health (NDVI)
        if ndvi < 0.3:
            risk_score += 3
            reasons.append("Low vegetation health (Critical NDVI)")
        elif ndvi < 0.5:
            risk_score += 1
            reasons.append("Minor vegetation stress")
            
        # 2. Habitat Loss (Urbanization)
        if land_use.lower() == "urban":
            risk_score += 3
            reasons.append("Urban expansion detected in grid")
            
        # 3. Thermal Stress (Temperature)
        if temperature > 33.0:
            risk_score += 2
            reasons.append(f"High thermal stress ({temperature}°C)")
        elif temperature > 30.0:
            risk_score += 1
            reasons.append("Moderate heat stress")
            
        # 4. Hydrological Stress (Water Presence)
        if water_index < 0.2:
            risk_score += 2
            reasons.append("Potential water body loss / drought stress")
            
        # Classification of risk levels
        if risk_score >= 8:
            risk_level = "High"
            color = "red"
        elif risk_score >= 4:
            risk_level = "Medium"
            color = "orange"
        else:
            risk_level = "Low"
            color = "green"
            
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "color": color,
            "reasons": reasons
        }

    @staticmethod
    def estimate_species_impact(reasons: List[str]) -> List[Dict[str, str]]:
        """
        Maps risk reasons to ecologically affected species groups.
        """
        impact_map = {
            "vegetation": {"group": "Mammals & Insects", "impact": "Loss of canopy cover and primary foraging sites."},
            "urban": {"group": "Terrestrial Fauna", "impact": "Habitat fragmentation and increased human-wildlife conflict."},
            "thermal": {"group": "Pollinators", "impact": "Heat stress and disruption of plant-pollinator phenology."},
            "heat": {"group": "Pollinators", "impact": "Heat stress and disruption of plant-pollinator phenology."},
            "water": {"group": "Birds & Amphibians", "impact": "Loss of seasonal wetlands and hydration sources."}
        }
        
        impacts = []
        for reason in reasons:
            for key, val in impact_map.items():
                if key in reason.lower():
                    impacts.append(val)
                    
        # Filter duplicates
        unique_impacts = {i['group']: i for i in impacts}.values()
        return list(unique_impacts)

    @staticmethod
    def get_interventions(reasons: List[str]) -> List[str]:
        """
        Suggests conservation interventions based on risk factors.
        """
        interventions = []
        for reason in reasons:
            r = reason.lower()
            if "vegetation" in r or "ndvi" in r:
                interventions.append("Reforestation with native species to restore canopy.")
            if "urban" in r:
                interventions.append("Strict enforcement of buffer zones around protected habitats.")
            if "thermal" in r or "heat" in r:
                interventions.append("Implementation of heat-tolerant vegetation corridors.")
            if "water" in r or "drought" in r:
                interventions.append("Restoration of riparian zones and natural drainage systems.")
        
        if not interventions:
            interventions.append("Preventative monitoring and maintenance of ecosystem health.")
            
        return list(set(interventions))
