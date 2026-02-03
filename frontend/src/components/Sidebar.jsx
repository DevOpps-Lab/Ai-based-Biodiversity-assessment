import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Leaf, AlertTriangle, Thermometer, Droplets, Info, RefreshCw, Zap, FileText, ShieldAlert, Activity, BarChart3, Search } from 'lucide-react';

const Sidebar = ({ analysisData, trendData, forecastData, alerts, onSimulate, onDownloadReport, loading, isExporting }) => {
    const [simParams, setSimParams] = useState({
        urban_growth_pct: 0,
        temp_increase: 0
    });

    // "Live Jitter" state to simulate real-time sensor fluctuations
    const [jitter, setJitter] = useState({ ndvi: 0, biomass: 0, coverage: 0 });

    React.useEffect(() => {
        if (!analysisData) return;
        const interval = setInterval(() => {
            setJitter({
                ndvi: (Math.random() - 0.5) * 0.01,
                biomass: (Math.random() - 0.5) * 2,
                coverage: (Math.random() - 0.5) * 0.5
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [analysisData]);

    if (!analysisData) {
        // ... (rest of the empty state remains same)
        return (
            <div className="sidebar">
                {loading && (
                    <div className="sidebar-loader">
                        <Activity className="animate-spin" color="var(--neon-green)" size={40} />
                        <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>Analyzing Satellite Feed...</p>
                    </div>
                )}
                <div className="header">
                    <div className="logo pulse-glow"><Leaf size={28} /> BIO-RISK AI</div>
                    <div className="tagline">Ecological Intelligence Platform</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px', color: '#666' }}>
                    {!loading ? (
                        <>
                            <Search size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                            <p>Enter a location in the search bar or click the map to initiate satellite analysis pipeline.</p>
                        </>
                    ) : (
                        <p style={{ opacity: 0.5 }}>Retrieving multispectral data for the selected region...</p>
                    )}
                </div>
            </div>
        );
    }

    const indicators = analysisData?.indicators || {};
    const rules = analysisData?.rules || { risk_level: 'Low', risk_score: 0, reasons: [] };

    // Calculated live values
    const liveForestCoverage = Math.max(0, Math.min(100, (indicators.forest_coverage || 0) + jitter.coverage)).toFixed(1);
    const liveNDVI = Math.max(0, Math.min(1, (indicators.ndvi || 0) + jitter.ndvi)).toFixed(3);
    const liveBiomass = Math.max(0, (indicators.biomass || 0) + jitter.biomass).toFixed(1);

    return (
        <div className="sidebar" style={{ position: 'relative' }}>
            {loading && (
                <div className="sidebar-loader">
                    <div className="logo pulse-glow" style={{ flexDirection: 'column' }}>
                        <Leaf size={48} />
                        <span style={{ fontSize: '0.8rem', marginTop: '10px' }}>ANALYZING SATELLITE FEED...</span>
                    </div>
                </div>
            )}

            <div className="header">
                <div className="logo"><Leaf size={28} /> BIO-RISK AI</div>
                <div className="tagline">Ecological Intelligence Dashboard</div>
            </div>

            {/* LIVE MONITORING PANEL */}
            <div className="card glass-panel section-highlight">
                <h3 className="section-title"><Activity size={18} /> Live Monitoring Feed</h3>
                <div className="monitoring-grid">
                    <div className="monitor-stat">
                        <label>Forest Coverage</label>
                        <div className="stat-value-group">
                            <span className="stat-val">{liveForestCoverage}%</span>
                            <div className="mini-gauge"><div style={{ width: `${liveForestCoverage}%` }}></div></div>
                        </div>
                    </div>
                    <div className="monitor-stat">
                        <label>Avg NDVI Index</label>
                        <span className="stat-val">{liveNDVI}</span>
                    </div>
                    <div className="monitor-stat">
                        <label>Biomass Est.</label>
                        <span className="stat-val">{liveBiomass} <small>t/ha</small></span>
                    </div>
                </div>
            </div>

            {/* EARLY WARNING SYSTEM */}
            <div className="card glass-panel" style={{ borderLeft: '3px solid var(--risk-high)' }}>
                <h3 className="section-title"><ShieldAlert size={18} color="var(--risk-high)" /> Early Warning System</h3>
                <div className="alert-feed">
                    {(alerts || []).length > 0 ? (
                        alerts.map((alert, idx) => (
                            <div key={idx} className={`alert-item alert-${alert.severity.toLowerCase()}`}>
                                <div className="alert-meta">
                                    <span className="alert-type">{alert.type}</span>
                                    <span className="alert-tag">LIVE</span>
                                </div>
                                <p className="alert-desc">{alert.desc}</p>
                            </div>
                        ))
                    ) : (
                        <div className="no-alerts">No critical events detected in this sector.</div>
                    )}
                </div>
            </div>

            {/* AI ANALYSIS PANEL (Forecast) */}
            <div className="card glass-panel">
                <h3 className="section-title"><Zap size={18} color="var(--neon-green)" /> 7-Day Risk Forecast</h3>
                <div className="forecast-chart">
                    <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={forecastData}>
                            <XAxis dataKey="date" hide />
                            <Tooltip
                                contentStyle={{ background: '#000', border: 'none', borderRadius: '4px', fontSize: '10px' }}
                                labelStyle={{ display: 'none' }}
                            />
                            <Bar
                                dataKey="risk_score"
                                radius={[2, 2, 0, 0]}
                                fill="var(--neon-green)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="forecast-labels">
                        <span>Day 1</span>
                        <span>Day 7</span>
                    </div>
                </div>
            </div>

            {/* Risk Assessment */}
            <div className="card glass-panel" style={{ borderLeft: `4px solid ${rules.risk_level === 'High' ? 'var(--risk-high)' : rules.risk_level === 'Medium' ? 'var(--risk-med)' : 'var(--risk-low)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Risk Assessment</h3>
                    <span className={`status-badge status-${(rules.risk_level || 'low').toLowerCase()}`}>
                        {rules.risk_level}
                    </span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${((rules.risk_score || 0) / 10) * 100}%`,
                            background: `linear-gradient(90deg, var(--risk-low), var(--risk-med), var(--risk-high))`,
                            transition: 'width 1s ease-out'
                        }}></div>
                    </div>
                </div>
            </div>

            {/* Species & Interventions Combined for space */}
            <div className="card glass-panel">
                <h3 className="section-title"><Info size={16} color="var(--neon-green)" /> Neural Logic Insights</h3>
                <div className="logic-list">
                    {(rules.reasons || []).length > 0 ? (
                        (rules.reasons || []).slice(0, 2).map((reason, idx) => (
                            <div key={idx} className="logic-item">
                                <div className="logic-bullet"></div>
                                <span>{reason}</span>
                            </div>
                        ))
                    ) : (
                        <div className="logic-item">
                            <div className="logic-bullet" style={{ background: 'var(--risk-low)' }}></div>
                            <span>Stable ecosystem indicators detected in this sector.</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={onDownloadReport}
                    className="btn-report"
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <>
                            <RefreshCw className="animate-spin" size={14} /> GENERATING REPORT...
                        </>
                    ) : (
                        <>
                            <FileText size={14} /> EXPORT ECO-INTELLIGENCE REPORT
                        </>
                    )}
                </button>
            </div>

            {/* Simulation Options */}
            <div className="card glass-panel sim-panel">
                <h3 style={{ fontSize: '0.8rem', opacity: 0.8 }}>Future Projection (Simulation)</h3>
                <div className="sim-controls">
                    <input type="range" min="0" max="100" value={simParams.urban_growth_pct} onChange={(e) => setSimParams({ ...simParams, urban_growth_pct: e.target.value })} />
                    <button className="btn-primary" onClick={() => onSimulate(simParams)}>
                        PROJECT FUTURE STATE
                    </button>
                </div>
            </div>

            {/* Historical Trend Analysis */}
            <div className="card glass-panel">
                <h3 className="section-title"><BarChart3 size={18} /> 12-Month Trend</h3>
                <div style={{ height: '100px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData || []}>
                            <Tooltip contentStyle={{ background: '#000', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                            <Line type="monotone" dataKey="ndvi" stroke="var(--neon-green)" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="temperature" stroke="var(--risk-high)" dot={false} strokeWidth={1} strokeDasharray="3 3" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="forecast-labels">
                    <span>12m Ago</span>
                    <span>Current</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
