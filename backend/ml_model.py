import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

class BiodiversityML:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.is_trained = False
        self.model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
        
        # Try to load existing model
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
                self.is_trained = True
        else:
            self._train_synthetic()

    def _train_synthetic(self):
        """
        Trains the model on a synthetic dataset to simulate ecological patterns.
        """
        # Features: [NDVI, LandUse (0: Forest, 1: Urban, 2: Water), TempAnomaly, WaterPresence (0/1)]
        np.random.seed(42)
        X = np.random.rand(500, 4)
        X[:, 1] = np.random.randint(0, 3, 500) # Land use categories
        X[:, 3] = np.random.randint(0, 2, 500) # Water presence
        
        # Labels: 0 (Low), 1 (Medium), 2 (High)
        # Simplified rules for label generation:
        y = []
        for row in X:
            score = 0
            if row[0] < 0.3: score += 1
            if row[1] == 1: score += 1 # Urban
            if row[2] > 0.7: score += 1 # High Temp
            if row[3] == 0: score += 1 # No water
            
            if score >= 3: y.append(2)
            elif score >= 1: y.append(1)
            else: y.append(0)
            
        self.model.fit(X, y)
        self.is_trained = True
        
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)

    def predict(self, ndvi, land_use_type, temp_anomaly, water_presence):
        """
        Predicts risk class and confidence.
        land_use_type: 0 (Forest), 1 (Urban), 2 (Water)
        water_presence: 0 (No), 1 (Yes)
        """
        features = np.array([[ndvi, land_use_type, temp_anomaly, water_presence]])
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        confidence = float(np.max(probabilities))
        
        classes = ["Low Risk", "Medium Risk", "High Risk"]
        return {
            "prediction": classes[prediction],
            "confidence": confidence
        }
