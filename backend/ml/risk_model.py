import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle
import os
from typing import Dict, Any

class BiodiversityRiskModel:
    """
    ML Classifier for biodiversity risk using Random Forest.
    Trained on synthetic ecological patterns to provide data-driven predictions.
    """
    
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
        self.is_trained = False
        self.model_path = os.path.join(os.path.dirname(__file__), "risk_classifier.pkl")
        self.classes = ["Low Risk", "Medium Risk", "High Risk"]
        
        # Load or train
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                    self.is_trained = True
            except Exception:
                self._train_and_save()
        else:
            self._train_and_save()

    def _train_and_save(self):
        """
        Generates synthetic data and trains the classifier.
        Features: [NDVI, LandUse_Code, Temperature, WaterIndex]
        LandUse_Code: 0: Forest, 1: Agriculture, 2: Urban, 3: Water
        """
        np.random.seed(42)
        n_samples = 1000
        
        # Features
        ndvi = np.random.uniform(0.1, 0.9, n_samples)
        land_use = np.random.randint(0, 4, n_samples)
        temp = np.random.uniform(20, 40, n_samples)
        water = np.random.uniform(0, 1, n_samples)
        
        X = np.stack([ndvi, land_use, temp, water], axis=1)
        
        # Labels (Simplified ecological logic for synthetic training)
        y = []
        for row in X:
            score = 0
            # Logic similar to Risk Engine but with different weights for ML patterns
            if row[0] < 0.3: score += 2 # Low NDVI
            if row[1] == 2: score += 3  # Urban
            if row[2] > 33: score += 2   # High Temp
            if row[3] < 0.2: score += 2  # Low Water
            
            if score >= 6: y.append(2)   # High
            elif score >= 3: y.append(1) # Medium
            else: y.append(0)            # Low
            
        self.model.fit(X, y)
        self.is_trained = True
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)

    def predict(self, ndvi: float, land_use: str, temperature: float, water_index: float) -> Dict[str, Any]:
        """
        Provides risk classification and confidence score.
        """
        # Map land use to numeric codes
        lu_map = {"forest": 0, "agriculture": 1, "urban": 2, "water": 3}
        lu_code = lu_map.get(land_use.lower(), 0)
        
        features = np.array([[ndvi, lu_code, temperature, water_index]])
        
        prediction_idx = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        confidence = float(np.max(probabilities))
        
        return {
            "prediction": self.classes[prediction_idx],
            "confidence": round(confidence, 2),
            "probabilities": {
                self.classes[i]: round(float(probabilities[i]), 2) 
                for i in range(len(self.classes))
            }
        }
