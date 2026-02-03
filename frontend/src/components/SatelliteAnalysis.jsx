import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Activity, BarChart3, AlertTriangle, Layers, Cpu, Compass, Zap, HelpCircle, Loader2, Calendar } from 'lucide-react';

const SatelliteAnalysis = ({ analysisData, onClose }) => {
    const [mode, setMode] = useState('evolution');
    const [selectedYear, setSelectedYear] = useState(2025);
    const [sliderValue, setSliderValue] = useState(50);
    const [policySliders, setPolicySliders] = useState({ urban: 30, conservation: 20 });
    const [activeBand, setActiveBand] = useState('RGB');
    const [terminalLogs, setTerminalLogs] = useState([]);

    // DECOUPLED LOADING STATES
    const [loadStatus, setLoadStatus] = useState({ baseline: false, comparison: false });
    const [useDemoFallback, setUseDemoFallback] = useState(false);

    const terminalRef = useRef(null);

    const lat = analysisData?.location?.lat || 13.0827;
    const lng = analysisData?.location?.lng || 80.2707;

    const getSatelliteUrl = (year, isBaseline = false) => {
        if (useDemoFallback) return (isBaseline || year >= 2024) ? "/satellite/present.png" : "/satellite/past.png";
        if (year >= 2024) return `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=14&l=sat&size=600,450`;
        return `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=13&l=sat&size=600,450`;
    };

    const imgPresent = useMemo(() => getSatelliteUrl(2024, true), [lat, lng, useDemoFallback]);
    const imgHistorical = useMemo(() => getSatelliteUrl(selectedYear), [lat, lng, selectedYear, useDemoFallback]);
    const imgFuture = "/satellite/future.png";

    // LIFECYCLE: Reset comparison on parameter change
    useEffect(() => {
        setLoadStatus(p => ({ ...p, comparison: false }));
        // Fail-safe to prevent stuck spinner
        const t = setTimeout(() => setLoadStatus(p => ({ ...p, comparison: true })), 4000);
        return () => clearTimeout(t);
    }, [selectedYear, mode]);

    // LIFECYCLE: Reset baseline only on location change
    useEffect(() => {
        setLoadStatus(p => ({ ...p, baseline: false }));
        const t = setTimeout(() => setLoadStatus(p => ({ ...p, baseline: true })), 4000);
        return () => clearTimeout(t);
    }, [lat, lng]);

    // AI LOGS
    useEffect(() => {
        const logs = [
            `ORBITAL_LINK: Established [${lat.toFixed(4)}N, ${lng.toFixed(4)}E]`,
            `TEMP_RESOLUTION: epoch ${selectedYear}`,
            "SPECTRAL_SCAN: Validating habitat baseline.",
            "AI_GAEA: Neural engine ready."
        ];
        setTerminalLogs([]);
        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                setTerminalLogs(prev => [...prev.slice(-15), { timestamp, msg: logs[i] }]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [selectedYear, mode, lat, lng]);

    const isSim = mode === 'projection';
    const calculateMetrics = () => {
        if (!isSim) {
            const yearDiff = 2024 - Math.min(2024, selectedYear);
            return [
                { label: 'Tree Cover', value: `${(78.3 + yearDiff * 1.5).toFixed(1)}%`, change: `+${(yearDiff * 1.5).toFixed(1)}%`, trend: 'up' },
                { label: 'Urban Grid', value: `${Math.max(5, 40 - (yearDiff * 2.2)).toFixed(1)}%`, change: `-${(yearDiff * 1.8).toFixed(1)}%`, trend: 'down' },
                { label: 'NDVI (Avg)', value: (0.75 + (yearDiff * 0.01)).toFixed(3), change: 'STABLE', trend: 'up' },
                { label: 'Sensor Mode', value: selectedYear.toString(), change: 'LIVE', trend: 'neutral' }
            ];
        } else {
            const urbanFactor = policySliders.urban / 100;
            const conservationFactor = policySliders.conservation / 100;
            const habitatLoss = (urbanFactor * 60) - (conservationFactor * 25);
            return [
                { label: 'Projected Habitat', value: `${Math.max(2, 78.3 - habitatLoss).toFixed(1)}%`, change: `-${habitatLoss.toFixed(1)}%`, trend: 'down' },
                { label: 'Survival Index', value: (7.5 - ((urbanFactor * 4) - (conservationFactor * 2))).toFixed(1), change: 'PREDICTIVE', trend: 'down' },
                { label: 'Heat Delta', value: `+${((urbanFactor * 4) - (conservationFactor * 1.5)).toFixed(1)}°C`, change: 'WARMING', trend: 'down' },
                { label: 'Eco-Risk', value: habitatLoss > 30 ? 'ELEVATED' : 'MODERATE', change: 'ALGO-GEN', trend: 'down' }
            ];
        }
    };

    const metrics = calculateMetrics();

    return (
        <div className="satellite-modal-overlay">
            <div className="satellite-modal-content glass-panel" style={{ background: '#0a110a', maxWidth: '1100px' }}>
                <div className="modal-header">
                    <div className="header-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Cpu size={28} className="text-neon-green" />
                            <div>
                                <h2 style={{ letterSpacing: '2px' }}>ECOLOGICAL DIGITAL TWIN v2.5</h2>
                                <span className="location-tag">COORD: {lat.toFixed(3)}N, {lng.toFixed(3)}E</span>
                            </div>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose} style={{ padding: '10px' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', gap: '25px' }}>
                    <div className="comparison-section" style={{ flex: 1.2 }}>
                        <div className="mode-toggle-group">
                            <button className={`mode-btn ${mode === 'evolution' ? 'active' : ''}`} onClick={() => setMode('evolution')}>
                                <Calendar size={14} /> HISTORICAL EVOLUTION
                            </button>
                            <button className={`mode-btn ${mode === 'projection' ? 'active' : ''}`} onClick={() => setMode('projection')}>
                                <Zap size={14} /> FUTURE PROJECTION (2035)
                            </button>
                        </div>

                        {mode === 'evolution' && (
                            <div className="timeline-selector card glass-panel mb-3">
                                <span style={{ fontSize: '0.7rem', color: 'var(--neon-green)', fontWeight: 'bold' }}>YEAR:</span>
                                <div className="timeline-track-container" style={{ flex: 1 }}>
                                    <input
                                        type="range"
                                        min="2010"
                                        max="2024"
                                        step="1"
                                        value={selectedYear > 2024 ? 2024 : selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="timeline-slider"
                                    />
                                    <div className="timeline-years">
                                        {[2010, 2014, 2018, 2021, 2024].map(y => (
                                            <span key={y} className={selectedYear === y ? 'active' : ''}>{y}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="year-display">{selectedYear}</div>
                            </div>
                        )}

                        <div className="comparison-container" style={{ background: '#111', minHeight: '340px', position: 'relative', overflow: 'hidden' }}>
                            {(!loadStatus.baseline || !loadStatus.comparison) && (
                                <div className="sync-indicator">
                                    <Loader2 className="animate-spin" size={24} color="var(--neon-green)" />
                                    <span>ORBITAL SYNC...</span>
                                </div>
                            )}

                            <img
                                key={`base-${imgPresent}`}
                                src={imgPresent}
                                alt="Baseline"
                                className="comparison-image"
                                onLoad={() => setLoadStatus(p => ({ ...p, baseline: true }))}
                                onError={() => setUseDemoFallback(true)}
                                style={{ visibility: loadStatus.baseline ? 'visible' : 'hidden' }}
                            />

                            <img
                                key={`overlay-${isSim ? imgFuture : imgHistorical}`}
                                src={isSim ? imgFuture : imgHistorical}
                                alt="Comparison"
                                className="comparison-image-overlay"
                                onLoad={() => setLoadStatus(p => ({ ...p, comparison: true }))}
                                onError={() => setUseDemoFallback(true)}
                                style={{
                                    visibility: loadStatus.comparison ? 'visible' : 'hidden',
                                    clipPath: `inset(0 0 0 ${sliderValue}%)`,
                                    filter: selectedYear < 2015 && !isSim ? 'contrast(0.7) brightness(1.2) grayscale(0.2) blur(0.2px)' : 'none'
                                }}
                            />

                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderValue}
                                onChange={(e) => setSliderValue(e.target.value)}
                                className="comparison-slider"
                                style={{ zIndex: 10 }}
                            />

                            <div className="label-past">BASELINE (2024)</div>
                            <div className="label-present" style={{ color: isSim ? '#ff4d4d' : 'var(--neon-green)' }}>
                                {isSim ? 'PROJECTED 2035' : `EPOCH ${selectedYear}`}
                            </div>
                        </div>

                        <div className="band-selector">
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
                                    <span style={{ color: '#666' }}>SYS:</span>
                                    <span className="msg">{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="analysis-section" style={{ flex: 0.8 }}>
                        {isSim && (
                            <div className="analysis-card mb-4" style={{ background: 'rgba(255, 77, 77, 0.05)', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                                <h3 className="section-title"><Zap size={18} color="#ff4d4d" /> SIMULATION</h3>
                                <div className="simulation-controls">
                                    <div className="control-item">
                                        <label>Urban Expansion <span>{policySliders.urban}%</span></label>
                                        <input type="range" min="0" max="100" value={policySliders.urban} onChange={(e) => setPolicySliders(p => ({ ...p, urban: e.target.value }))} />
                                    </div>
                                    <div className="control-item">
                                        <label>Conservation <span>{policySliders.conservation}%</span></label>
                                        <input type="range" min="0" max="100" value={policySliders.conservation} onChange={(e) => setPolicySliders(p => ({ ...p, conservation: e.target.value }))} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="analysis-card mb-4">
                            <h3 className="section-title"><Activity size={18} /> {isSim ? '2035 IMPACT' : `${selectedYear} STATE`}</h3>
                            <div className="metrics-grid">
                                {metrics.map(m => (
                                    <div key={m.label} className="metric-box">
                                        <label>{m.label}</label>
                                        <div className="metric-value-row">
                                            <span>{m.value}</span>
                                            <span className={`trend-${m.trend}`}>{m.change}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="analysis-card">
                            <h3 className="section-title"><Compass size={18} /> CLASSIFICATION</h3>
                            <div className="threat-chart">
                                {[
                                    { label: 'Canopy Density', val: isSim ? Math.max(5, 75 - (policySliders.urban * 0.4)) : Math.min(100, 75 + (2024 - selectedYear) * 1.5), color: '#39ff14' },
                                    { label: 'Built Env.', val: isSim ? Math.min(100, 45 + (policySliders.urban * 0.5)) : Math.max(5, 45 - (2024 - selectedYear) * 2), color: '#ff4d4d' }
                                ].map(t => (
                                    <div key={t.label} className="chart-row">
                                        <div className="row-info"><span>{t.label}</span><span>{Math.round(t.val)}%</span></div>
                                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${t.val}%`, backgroundColor: t.color }}></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .sync-indicator {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(0,0,0,0.8);
                    padding: 8px 15px;
                    border-radius: 4px;
                    border: 1px solid var(--neon-green);
                    z-index: 21;
                    color: var(--neon-green);
                    font-size: 0.7rem;
                    font-weight: bold;
                }
                .comparison-image-overlay {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    pointer-events: none;
                }
            `}} />
        </div>
    );
};

export default SatelliteAnalysis;
