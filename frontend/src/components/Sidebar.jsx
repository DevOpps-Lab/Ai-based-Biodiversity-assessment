import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Leaf, AlertTriangle, Thermometer, Droplets, Info, RefreshCw, Zap, FileText, ShieldAlert, Activity, BarChart3, Search } from 'lucide-react';

const Sidebar = ({ analysisData, trendData, forecastData, alerts, onSimulate, onDownloadReport, onOpenSatellite, onOpenMitigation, loading, isExporting }) => {
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

            {/* NEW: DEEP SATELLITE INSIGHT TRIGGER */}
            <button className="deep-insight-btn" onClick={onOpenSatellite}>
                <Zap size={18} fill="white" />
                EXPLORE DEEP SATELLITE INSIGHTS
            </button>

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

            <div className="card glass-panel">
                <h3 className="section-title"><Zap size={18} color="var(--neon-green)" /> 7-Day Risk Forecast</h3>
                <div className="forecast-chart">
                    <ResponsiveContainer width="100%" height={120}>
                        <AreaChart data={forecastData}>
                            <defs>
                                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--neon-green)" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="var(--neon-green)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <YAxis hide domain={[0, 10]} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="custom-tooltip">
                                                <p className="tooltip-date">{payload[0].payload.date}</p>
                                                <p className="tooltip-val">Risk: <span>{payload[0].value}</span></p>
                                                <p className="tooltip-event">{payload[0].payload.event}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="risk_score"
                                stroke="var(--neon-green)"
                                fillOpacity={1}
                                fill="url(#colorRisk)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="forecast-labels">
                        <span>NOW</span>
                        <span>+7 DAYS</span>
                    </div>

                    {forecastData && forecastData.length > 0 && (
                        <div className="forecast-highlight">
                            <div className="highlight-header">
                                <AlertTriangle size={12} color="var(--risk-high)" />
                                <span>CRITICAL FORECAST WINDOW</span>
                            </div>
                            <div className="highlight-body">
                                {(() => {
                                    const keyEvent = [...forecastData].sort((a, b) => b.risk_score - a.risk_score)[0];
                                    return (
                                        <>
                                            <strong>{keyEvent.date}</strong> — {keyEvent.event || "Monitoring for anomalies..."}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>Future Projection (Simulation)</h3>
                    <button className="btn-mini-link" onClick={onOpenMitigation}>
                        <ShieldAlert size={12} /> RECOVERY PLAN
                    </button>
                </div>
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

            <style dangerouslySetInnerHTML={{
                __html: `
                .btn-mini-link {
                    background: none;
                    border: none;
                    color: var(--neon-green);
                    opacity: 0.6;
                    font-size: 0.65rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: all 0.2s;
                    letter-spacing: 1px;
                }
                .btn-mini-link:hover {
                    opacity: 1;
                    background: rgba(57, 255, 20, 0.1);
                    box-shadow: 0 0 100px rgba(57, 255, 20, 0.2);
                }
                .custom-tooltip {
                    background: rgba(0, 0, 0, 0.9);
                    border: 1px solid var(--neon-green);
                    padding: 10px;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.8);
                    min-width: 140px;
                    backdrop-filter: blur(5px);
                }
                .tooltip-date {
                    font-size: 0.65rem;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .tooltip-val {
                    font-size: 0.9rem;
                    font-weight: 800;
                    margin-bottom: 4px;
                }
                .tooltip-val span {
                    color: var(--neon-green);
                }
                .tooltip-event {
                    font-size: 0.7rem;
                    color: #fff;
                    font-style: italic;
                    opacity: 0.9;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 4px;
                    margin-top: 4px;
                }
                .forecast-highlight {
                    margin-top: 15px;
                    background: rgba(231, 76, 60, 0.05);
                    border: 1px solid rgba(231, 76, 60, 0.2);
                    border-radius: 8px;
                    padding: 10px;
                }
                .highlight-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 6px;
                }
                .highlight-header span {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: var(--risk-high);
                    letter-spacing: 0.5px;
                }
                .highlight-body {
                    font-size: 0.75rem;
                    line-height: 1.4;
                    color: var(--text-primary);
                }
                .highlight-body strong {
                    color: var(--neon-green);
                }
            `}} />
        </div>
    );
};

export default Sidebar;
