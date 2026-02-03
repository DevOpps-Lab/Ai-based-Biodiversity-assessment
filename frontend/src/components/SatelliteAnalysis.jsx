import React, { useState, useEffect, useRef } from 'react';
import { X, Activity, BarChart3, AlertTriangle, Layers, Cpu, Compass, Zap, HelpCircle, Loader2 } from 'lucide-react';

const SatelliteAnalysis = ({ analysisData, onClose }) => {
    const [mode, setMode] = useState('historical'); // 'historical' or 'simulation'
    const [sliderValue, setSliderValue] = useState(50);
    const [policySliders, setPolicySliders] = useState({ urban: 30, conservation: 20 });
    const [activeBand, setActiveBand] = useState('RGB');
    const [terminalLogs, setTerminalLogs] = useState([]);
    const [imgLoading, setImgLoading] = useState(true);
    const terminalRef = useRef(null);

    // REAL-TIME IMAGERY: Switching to Yandex Static API (High reliability for demo without token hurdles)
    const lat = analysisData?.location?.lat || 13.0827;
    const lng = analysisData?.location?.lng || 80.2707;

    // Yandex Static API: No token usually required for light demo traffic
    const imgPresent = `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=14&l=sat&size=600,450`;

    // Historical and Future
    const imgPast = "/satellite/past.png";
    const imgFuture = "/satellite/future.png";

    const [imgError, setImgError] = useState(false);

    // AI Reasoning Log Simulation
    useEffect(() => {
        const logs = [
            `ORBITAL LINK: Established via G-SAT [${lat.toFixed(2)}, ${lng.toFixed(2)}]`,
            "Spectral targets validated. Baseline: 2024.",
            "Bio-Analyst 'Gaea' initializing causal neural net...",
            "Telemetry suggests high soil moisture variance.",
            "Ready for policy simulation."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                addLog(logs[i]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [lat, lng]);

    const addLog = (msg) => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setTerminalLogs(prev => [...prev.slice(-15), { timestamp, msg }]);
    };

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalLogs]);

    // FUNCTIONAL SIMULATION ENGINE (Amplified for visible impact)
    const handlePolicyChange = (key, val) => {
        setPolicySliders(prev => ({ ...prev, [key]: parseInt(val) }));
        const currentVal = parseInt(val);

        if (key === 'urban' && currentVal > 60) {
            addLog(`!!! DANGER: Habitat connectivity in Sector [${lng.toFixed(1)}] dropping below 30% !!!`);
        } else if (key === 'conservation' && currentVal > 70) {
            addLog(`SIGNAL: Restoration corridors established. Genetic flow increasing.`);
        }
    };
    const isSim = mode === 'simulation';

    const calculateMetrics = () => {
        if (!isSim) {
            return [
                { label: 'Habitat Density', value: '78.3%', change: '-14%', trend: 'down' },
                { label: 'Species Index', value: '7.5', change: '-1.2', trend: 'down' },
                { label: 'Moisture Level', value: '44%', change: '+5%', trend: 'up' },
                { label: 'Carbon Sink', value: '1.2t', change: '-0.3t', trend: 'down' }
            ];
        } else {
            // DRAMATIC SIMULATION MATH
            const urbanFactor = policySliders.urban / 100; // 0 to 1
            const conservationFactor = policySliders.conservation / 100; // 0 to 1

            // Worst case: Urban is high, conservation is low
            const habitatLoss = (urbanFactor * 60) - (conservationFactor * 25);
            const speciesImpact = (urbanFactor * 4) - (conservationFactor * 2);
            const tempImpact = (urbanFactor * 3.5) - (conservationFactor * 1.2);

            const currentHabitat = 78.3 - habitatLoss;
            const currentSpecies = 7.5 - speciesImpact;

            return [
                {
                    label: 'Projected Habitat',
                    value: `${Math.max(2, currentHabitat).toFixed(1)}%`,
                    change: habitatLoss > 0 ? `-${habitatLoss.toFixed(1)}%` : `+${Math.abs(habitatLoss).toFixed(1)}%`,
                    trend: habitatLoss > 10 ? 'down' : 'up'
                },
                {
                    label: 'Survival Index',
                    value: Math.max(0.5, currentSpecies).toFixed(1),
                    change: currentSpecies < 4 ? 'CRITICAL' : 'RECOVERING',
                    trend: currentSpecies < 4 ? 'down' : 'up'
                },
                {
                    label: 'Regional Temp',
                    value: `+${Math.max(0.2, tempImpact).toFixed(1)}°C`,
                    change: tempImpact > 1.5 ? 'WARMING' : 'STABLE',
                    trend: tempImpact > 1.5 ? 'down' : 'up'
                },
                {
                    label: 'Extinction Risk',
                    value: habitatLoss > 40 ? 'CATASTROPHIC' : 'MODERATE',
                    change: 'AUTO-GEN',
                    trend: habitatLoss > 40 ? 'down' : 'up'
                }
            ];
        }
    };

    const metrics = calculateMetrics();

    return (
        <div className="satellite-modal-overlay">
            <div className="satellite-modal-content glass-panel" style={{ background: '#0a110a' }}>
                <div className="modal-header">
                    <div className="header-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Cpu size={28} className="text-neon-green" />
                            <div>
                                <h2 style={{ letterSpacing: '2px' }}>ECOLOGICAL DIGITAL TWIN v2.4</h2>
                                <span className="location-tag">LIVE FEED | COORD: {lat.toFixed(4)}N, {lng.toFixed(4)}E</span>
                            </div>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose} style={{ padding: '10px' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Perspective Selector */}
                    <div className="comparison-section">
                        <div className="mode-toggle-group">
                            <button className={`mode-btn ${mode === 'historical' ? 'active' : ''}`} onClick={() => setMode('historical')}>
                                HISTORICAL (REAL VIEW vs 2015)
                            </button>
                            <button className={`mode-btn ${mode === 'simulation' ? 'active' : ''}`} onClick={() => setMode('simulation')}>
                                FUTURE (REAL VIEW vs 2035)
                            </button>
                        </div>

                        <div className="comparison-container" style={{ background: '#111' }}>
                            {imgLoading && !imgError && (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5, color: 'var(--neon-green)', textAlign: 'center' }}>
                                    <Loader2 className="animate-spin" size={32} />
                                    <p style={{ fontSize: '0.6rem', marginTop: '10px' }}>CONNECTING TO ORBITAL LINK...</p>
                                </div>
                            )}
                            {imgError && (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5, color: '#ff4d4d', textAlign: 'center' }}>
                                    <AlertTriangle size={32} />
                                    <p style={{ fontSize: '0.6rem', marginTop: '10px' }}>SATELLITE DOWNLINK FAILED</p>
                                </div>
                            )}
                            <img
                                src={imgPresent}
                                alt="Current Satellite"
                                className="comparison-image"
                                onLoad={() => setImgLoading(false)}
                                onError={() => { setImgError(true); setImgLoading(false); }}
                                style={{ opacity: imgLoading ? 0 : 1, transition: 'opacity 0.5s' }}
                            />
                            <div
                                className="comparison-overlay"
                                style={{
                                    clipPath: `inset(0 0 0 ${sliderValue}%)`,
                                    backgroundImage: `url(${isSim ? imgFuture : imgPast})`,
                                    backgroundSize: 'cover',
                                    filter: activeBand === 'NDVI' ? 'sepia(1) hue-rotate(90deg) saturate(3)' : activeBand === 'THERMAL' ? 'invert(1) hue-rotate(180deg)' : 'none',
                                    zIndex: 2
                                }}
                            ></div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderValue}
                                onChange={(e) => setSliderValue(e.target.value)}
                                className="comparison-slider"
                                style={{ zIndex: 10 }}
                            />
                            <div className="label-past" style={{ zIndex: 5 }}>REAL SATELLITE (CURRENT)</div>
                            <div className="label-present" style={{ color: isSim ? '#ff4d4d' : 'var(--neon-green)', zIndex: 5 }}>{isSim ? '2035 PROJECTION' : '2015 HISTORICAL'}</div>
                        </div>

                        <div className="band-selector">
                            <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: '800', alignSelf: 'center' }}>VIEWBAND:</span>
                            {['RGB', 'NDVI', 'THERMAL'].map(band => (
                                <div key={band} className={`band-pill ${activeBand === band ? 'active' : ''}`} onClick={() => setActiveBand(band)}>
                                    {band}
                                </div>
                            ))}
                        </div>

                        <div className="ai-terminal mt-4" ref={terminalRef}>
                            {terminalLogs.map((log, i) => (
                                <div key={i} className="terminal-line">
                                    <span className="timestamp">[{log.timestamp}]</span>
                                    <span className="prefix">AI_ANALYST:</span>
                                    <span className="msg">{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls & Metrics */}
                    <div className="analysis-section">
                        {isSim && (
                            <div className="analysis-card mb-4" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 className="section-title"><Zap size={18} color="var(--risk-high)" /> SIMULATION PARAMETERS</h3>
                                <div className="simulation-controls">
                                    <div className="control-item">
                                        <label>Urban Sprawl (Policy Deficit) <span>{policySliders.urban}%</span></label>
                                        <input type="range" min="0" max="100" value={policySliders.urban} onChange={(e) => handlePolicyChange('urban', e.target.value)} />
                                    </div>
                                    <div className="control-item">
                                        <label>Conservation Funding <span>{policySliders.conservation}%</span></label>
                                        <input type="range" min="0" max="100" value={policySliders.conservation} onChange={(e) => handlePolicyChange('conservation', e.target.value)} />
                                    </div>
                                    <p style={{ fontSize: '0.65rem', color: '#555', marginTop: '5px' }}>Adjusting these sliders will live-recalculate the 2035 ecological forecast metrics below.</p>
                                </div>
                            </div>
                        )}

                        <div className="analysis-card mb-4">
                            <h3><Activity size={18} /> {isSim ? 'REAL-TIME 2035 PROJECTION' : 'ECOLOGICAL AUDIT (CURRENT)'}</h3>
                            <div className="metrics-grid">
                                {metrics.map(m => (
                                    <div key={m.label} className="metric-box">
                                        <label>{m.label}</label>
                                        <div className="metric-value-row">
                                            <span style={{ color: isSim && m.trend === 'down' ? '#ff4d4d' : 'white' }}>{m.value}</span>
                                            <span className={`trend-${m.trend}`}>{m.change}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="analysis-card">
                            <h3><Compass size={18} /> CAUSAL BREAKDOWN</h3>
                            <div className="threat-chart">
                                {[
                                    { label: 'Habitat Fragment', val: isSim ? Math.min(100, 75 + policySliders.urban * 0.3) : 75, color: '#ff4d4d' },
                                    { label: 'Moisture Loss', val: isSim ? Math.min(100, 55 + policySliders.urban * 0.2) : 55, color: '#f1c40f' },
                                    { label: 'Protection Coverage', val: isSim ? Math.min(100, policySliders.conservation * 1.5) : 30, color: '#39ff14' }
                                ].map(t => (
                                    <div key={t.label} className="chart-row">
                                        <div className="row-info">
                                            <span>{t.label}</span>
                                            <span>{t.val.toFixed(0)}%</span>
                                        </div>
                                        <div className="bar-bg">
                                            <div className="bar-fill" style={{ width: `${t.val}%`, backgroundColor: t.color }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SatelliteAnalysis;
