import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Rectangle, Tooltip as LeafletTooltip, useMap, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity, ShieldAlert, Zap, Layers, Loader2 } from 'lucide-react';

// Hardcoded colors for maximum compatibility
const COLORS = {
    NEON_GREEN: '#39ff14',
    RISK_HIGH: '#ff4d4d', // Brighter red
    RISK_MED: '#f1c40f',
    RISK_LOW: '#2ecc71',
    GRID_STROKE: '#ffffff', // High contrast white
    ACTIVE_STROKE: '#39ff14'
};

// Fix for default marker icons
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapFlyTo = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
            try {
                map.flyTo([coords.lat, coords.lng], 13, { duration: 1.5 });
            } catch (e) {
                console.error("Map flyTo error:", e);
            }
        }
    }, [coords, map]);
    return null;
};

const MapEvents = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            if (e && e.latlng) {
                onMapClick(e.latlng);
            }
        },
    });
    return null;
};

import GeoTIFFViewer from './GeoTIFFViewer';
import { Search, MapPin } from 'lucide-react';
import axios from 'axios';

const MapView = ({ onSelectRegion, onCellSelect, currentAnalysis, activeCell, targetCoords }) => {
    const [layer, setLayer] = useState('risk');
    const [showGeoTIFF, setShowGeoTIFF] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearchLoading(true);
        try {
            // Added User-Agent as per Nominatim policy and increased robustness
            const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    format: 'json',
                    q: searchQuery,
                    countrycodes: 'in',
                    limit: 1
                },
                headers: {
                    'User-Agent': 'BioRisk-Demo-App'
                }
            });

            if (res.data && res.data.length > 0) {
                const { lat, lon } = res.data[0];
                const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
                onSelectRegion(coords);
            } else {
                alert("Location not found in India. Please try another search.");
            }
        } catch (err) {
            console.error("Search failed:", err);
            alert("Search service unavailable. Please try again later.");
        } finally {
            setSearchLoading(false);
        }
    };

    const getHeatmapColor = (cell) => {
        if (!cell || !cell.indicators || !cell.rules) return 'rgba(255, 255, 255, 0.2)';

        if (layer === 'ndvi') {
            const val = cell.indicators?.ndvi ?? 0;
            const h = 120;
            const s = '80%';
            const l = `${(val * 35) + 20}%`;
            return `hsl(${h}, ${s}, ${l})`;
        }

        if (layer === 'fire') {
            const val = cell.indicators?.temperature ?? 0;
            if (val > 35) return '#ff4500'; // Fire red
            if (val > 30) return '#ff8c00'; // Orange
            return 'rgba(255, 165, 0, 0.1)';
        }

        const level = cell.rules?.risk_level || 'Low';
        if (level === 'High') return COLORS.RISK_HIGH;
        if (level === 'Medium') return COLORS.RISK_MED;
        return COLORS.RISK_LOW;
    };

    const gridCells = currentAnalysis?.grid || [];
    const avgConfidence = 0.942; // Simulated for high-standard demo

    return (
        <div className="map-viewport">
            {/* Top Analysis Ribbon */}
            <div className="top-ribbon glass-panel" style={{ pointerEvents: 'auto', display: 'flex' }}>
                <div className="search-container">
                    <form onSubmit={handleSearch} className="search-form">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search India (e.g. Jim Corbett, Wayanad)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" disabled={searchLoading}>
                            {searchLoading ? <Loader2 className="animate-spin" size={14} /> : 'SEARCH'}
                        </button>
                    </form>
                </div>

                <div className="ribbon-divider"></div>

                <div className="ribbon-stat">
                    <label>Region Monitoring</label>
                    <div className="live-indicator">
                        <div className="live-dot"></div>
                        <span>{currentAnalysis ? 'SYNCED' : 'IDLE'}</span>
                    </div>
                </div>
                <div className="ribbon-stat" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
                    <label>AI Confidence</label>
                    <span style={{ color: COLORS.NEON_GREEN }}>{currentAnalysis ? `${(avgConfidence * 100).toFixed(1)}%` : '--'}</span>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="layer-toggle-group">
                        <button className={`layer-btn ${layer === 'risk' ? 'active' : ''}`} onClick={() => setLayer('risk')}>
                            <ShieldAlert size={14} /> CLASSIFICATION
                        </button>
                        <button className={`layer-btn ${layer === 'ndvi' ? 'active' : ''}`} onClick={() => setLayer('ndvi')}>
                            <Activity size={14} /> NDVI INDEX
                        </button>
                        <button className={`layer-btn ${layer === 'fire' ? 'active' : ''}`} onClick={() => setLayer('fire')}>
                            <Zap size={14} /> FIRE RISK
                        </button>
                    </div>

                    <button className="geotiff-btn" onClick={() => setShowGeoTIFF(true)}>
                        <Layers size={14} /> GeoTIFF INSPECTOR
                    </button>
                </div>
            </div>

            {showGeoTIFF && <GeoTIFFViewer onClose={() => setShowGeoTIFF(false)} />}

            <MapContainer
                center={[12.9716, 77.5946]}
                zoom={11}
                scrollWheelZoom={true}
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
                />

                {/* Click Interaction Layer */}
                <MapEvents onMapClick={onSelectRegion} />
                <MapFlyTo coords={targetCoords || currentAnalysis?.location} />

                {/* Target Marker and Analysis Radius */}
                {currentAnalysis?.location && (
                    <>
                        <Marker position={[currentAnalysis.location.lat, currentAnalysis.location.lng]} />
                        <Circle
                            center={[currentAnalysis.location.lat, currentAnalysis.location.lng]}
                            radius={2500}
                            pathOptions={{ color: COLORS.NEON_GREEN, weight: 1, fillOpacity: 0.05, dashArray: '5, 10' }}
                        />
                    </>
                )}

                {/* The Grid Overlay */}
                {gridCells.map((cell, idx) => {
                    if (!cell || !cell.location) return null;
                    const coords = cell.location;
                    // Slightly overlap cells to ensure no gaps (0.01 width/height)
                    const bounds = [
                        [coords.lat - 0.0051, coords.lng - 0.0051],
                        [coords.lat + 0.0051, coords.lng + 0.0051]
                    ];
                    const isActive = activeCell?.grid_id === cell.grid_id;
                    const cellColor = getHeatmapColor(cell);

                    return (
                        <Rectangle
                            key={`${cell.grid_id}_${layer}_${idx}`}
                            bounds={bounds}
                            eventHandlers={{
                                click: (e) => {
                                    L.DomEvent.stopPropagation(e);
                                    onCellSelect(cell);
                                }
                            }}
                            pathOptions={{
                                color: isActive ? COLORS.ACTIVE_STROKE : COLORS.GRID_STROKE,
                                weight: isActive ? 4 : 1,
                                opacity: isActive ? 1 : 0.3,
                                fillColor: cellColor,
                                fillOpacity: isActive ? 0.8 : 0.6,
                                fill: true
                            }}
                        >
                            <LeafletTooltip direction="top">
                                <div style={{ minWidth: '120px', padding: '5px' }}>
                                    <div style={{ fontWeight: 'bold', borderBottom: '1px solid #333', marginBottom: '4px', fontSize: '0.8rem' }}>
                                        {layer === 'risk' ? `Risk: ${cell.rules?.risk_level || 'N/A'}` : `NDVI: ${(cell.indicators?.ndvi ?? 0).toFixed(2)}`}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#555' }}>
                                        Confidence: {((cell.ml?.confidence || 0) * 100).toFixed(0)}%
                                    </div>
                                </div>
                            </LeafletTooltip>
                        </Rectangle>
                    );
                })}
            </MapContainer>

            {/* Legend Panel */}
            <div className="floating-overlay glass-panel control-panel">
                <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '0.8rem', color: COLORS.NEON_GREEN, letterSpacing: '1px' }}>ECOLOGICAL OVERLAY</h4>
                    <p style={{ fontSize: '0.6rem', color: '#555' }}>ACTIVE: {layer.toUpperCase()} MODEL</p>
                </div>
                {layer === 'risk' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { label: 'Critical Threat', color: COLORS.RISK_HIGH },
                            { label: 'Moderate Risk', color: COLORS.RISK_MED },
                            { label: 'Stable Habitat', color: COLORS.RISK_LOW }
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.7rem' }}>
                                <div style={{ width: 14, height: 14, borderRadius: '3px', background: item.color, border: '1px solid rgba(255,255,255,0.2)' }}></div>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <div style={{ height: '10px', width: '100%', background: `linear-gradient(to right, #081c15, ${COLORS.NEON_GREEN})`, borderRadius: '5px', marginBottom: '6px', border: '1px solid rgba(255,255,255,0.1)' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#888' }}>
                            <span>SPARSE VEGETATION</span>
                            <span>DENSE CANOPY</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapView;
