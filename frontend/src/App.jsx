import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import SatelliteAnalysis from './components/SatelliteAnalysis';
import MitigationPlan from './components/MitigationPlan';

const API_BASE = 'http://localhost:8000';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [showSatelliteDeepDive, setShowSatelliteDeepDive] = useState(false);
  const [showMitigationPlan, setShowMitigationPlan] = useState(false);

  const fetchAnalysis = async (coords, params = null) => {
    if (!coords || typeof coords.lat !== 'number') return;

    setLoading(true);
    try {
      const endpoint = params ? `${API_BASE}/simulate` : `${API_BASE}/analyze-region`;

      const bounds = {
        min_lat: coords.lat - 0.025,
        max_lat: coords.lat + 0.025,
        min_lng: coords.lng - 0.025,
        max_lng: coords.lng + 0.025
      };

      const payload = params ? { ...coords, ...bounds, ...params } : { ...coords, ...bounds };

      const res = await axios.post(endpoint, payload);

      if (res.data) {
        setAnalysisData(res.data);
        setSelectedCell(res.data);

        if (!params) {
          // Parallel fetch for trends, forecast, and alerts
          const [trendRes, forecastRes, alertsRes] = await Promise.all([
            axios.get(`${API_BASE}/trend-data`, { params: coords }),
            axios.get(`${API_BASE}/forecast`, { params: coords }),
            axios.get(`${API_BASE}/alerts`, { params: coords })
          ]);

          setTrendData(trendRes.data || []);
          setForecastData(forecastRes.data || []);
          setAlerts(alertsRes.data || []);
        }
      }
    } catch (err) {
      console.error("Analysis pipeline failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (latlng) => {
    if (!latlng) return;
    const coords = { lat: latlng.lat, lng: latlng.lng };
    setCurrentCoords(coords);
    fetchAnalysis(coords);
  };

  const handleCellSelect = (cell) => {
    if (!cell) return;
    setSelectedCell(cell);

    const coords = cell.location ? { lat: cell.location.lat, lng: cell.location.lng } : null;
    if (coords) {
      axios.get(`${API_BASE}/trend-data`, { params: coords })
        .then(res => setTrendData(res.data || []))
        .catch(err => console.error("Error fetching cell trends:", err));

      axios.get(`${API_BASE}/forecast`, { params: coords })
        .then(res => setForecastData(res.data || []))
        .catch(err => console.error("Error fetching forecast:", err));
    }
  };

  const handleSimulate = (params) => {
    if (currentCoords) {
      fetchAnalysis(currentCoords, params);
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedCell) return;
    setIsGeneratingReport(true);
    try {
      console.log("Requesting report for:", selectedCell.location);
      const res = await axios.post(`${API_BASE}/generate-report`, selectedCell, {
        responseType: 'blob',
        timeout: 30000 // 30s timeout
      });

      const file = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Biodiversity_Report_${selectedCell.grid_id || 'regional'}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log("Report downloaded successfully");
    } catch (err) {
      console.error("Report generation failed:", err);
      alert("Failed to generate report. Please ensure the backend is running and try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (!showDashboard) {
    return <LandingPage onLaunch={() => setShowDashboard(true)} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        analysisData={selectedCell}
        trendData={trendData}
        forecastData={forecastData}
        alerts={alerts}
        onSimulate={handleSimulate}
        onDownloadReport={handleDownloadReport}
        onOpenSatellite={() => setShowSatelliteDeepDive(true)}
        onOpenMitigation={() => setShowMitigationPlan(true)}
        loading={loading}
        isExporting={isGeneratingReport}
      />
      <MapView
        onSelectRegion={handleMapClick}
        onCellSelect={handleCellSelect}
        currentAnalysis={analysisData}
        activeCell={selectedCell}
        targetCoords={currentCoords}
      />

      {showSatelliteDeepDive && (
        <SatelliteAnalysis
          analysisData={selectedCell}
          onClose={() => setShowSatelliteDeepDive(false)}
          onOpenMitigation={() => setShowMitigationPlan(true)}
        />
      )}

      {showMitigationPlan && (
        <MitigationPlan
          analysisData={selectedCell}
          onClose={() => setShowMitigationPlan(false)}
        />
      )}
    </div>
  );
}

export default App;
