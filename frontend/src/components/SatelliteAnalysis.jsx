import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Activity, BarChart3, AlertTriangle, Layers, Cpu, Compass, Zap, HelpCircle, Loader2, Calendar, Target, Scan, Eye } from 'lucide-react';

const SatelliteAnalysis = ({ analysisData, onClose }) => {
    const [mode, setMode] = useState('evolution');
    const [selectedYear, setSelectedYear] = useState(2024);
    const [sliderValue, setSliderValue] = useState(50);
    const [policySliders, setPolicySliders] = useState({ urban: 30, conservation: 20 });
    const [activeBand, setActiveBand] = useState('RGB');
    const [terminalLogs, setTerminalLogs] = useState([]);

    // NEW INTELLIGENCE FEATURES
    const [lensState, setLensState] = useState({ x: 0, y: 0, active: false });
    const [showHologram, setShowHologram] = useState(true);
    const [narrationBatch, setNarrationBatch] = useState(0);

    const [loadStatus, setLoadStatus] = useState({ baseline: false, comparison: false });
    const [useDemoFallback, setUseDemoFallback] = useState(false);

    const terminalRef = useRef(null);
    const containerRef = useRef(null);

    const lat = analysisData?.location?.lat || 13.0827;
    const lng = analysisData?.location?.lng || 80.2707;

    const getSatelliteUrl = (year, isBaseline = false, forceBand = null) => {
        if (useDemoFallback) return (isBaseline || year >= 2024) ? "/satellite/present.png" : "/satellite/past.png";

        let bandParam = '&l=sat';
        if (forceBand === 'THERMAL') bandParam = '&l=sat,skl'; // Emulating thermal with skeleton overlay
        if (forceBand === 'NDVI') bandParam = '&l=sat&type=map'; // Emulating NDVI with map blend

        if (year >= 2024) return `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=14${bandParam}&size=600,450`;
        return `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=13${bandParam}&size=600,450`;
    };

    const imgPresent = useMemo(() => getSatelliteUrl(2024, true), [lat, lng, useDemoFallback]);
    const imgHistorical = useMemo(() => getSatelliteUrl(selectedYear), [lat, lng, selectedYear, useDemoFallback]);
    const imgSpectral = useMemo(() => getSatelliteUrl(2024, true, activeBand === 'RGB' ? 'NDVI' : activeBand), [lat, lng, activeBand, useDemoFallback]);

    // X-RAY LENS TRACKING
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setLensState({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            active: true
        });
    };

    // LIFECYCLE: Reset comparison on parameter change
    useEffect(() => {
        setLoadStatus(p => ({ ...p, comparison: false }));
        const t = setTimeout(() => setLoadStatus(p => ({ ...p, comparison: true })), 4000);
        return () => clearTimeout(t);
    }, [selectedYear, mode]);

    useEffect(() => {
        setLoadStatus(p => ({ ...p, baseline: false }));
        const t = setTimeout(() => setLoadStatus(p => ({ ...p, baseline: true })), 4000);
        return () => clearTimeout(t);
    }, [lat, lng]);

    // AI BIO-INTELLIGENCE NARRATION
    useEffect(() => {
        const getNarrative = () => {
            const urban = policySliders.urban;
            const conservation = policySliders.conservation;

            if (mode === 'projection') {
                if (urban > 70) return "WARNING: Aggressive urban expansion detected. Predictive models show total fragmentation of existing wildlife corridors by 2031.";
                if (conservation > 70) return "OPTIMISM: Significant reforestation efforts in this projection are restoring canopy connectivity to 1990 levels.";
                return "SIMULATION: Evaluating the delicate equilibrium between anthropogenic pressure and ecological resilience.";
            }

            if (selectedYear < 2012) return "ARCHIVE: Analyzing the 'Silver-Leaf' era. Notice the dense vegetation baseline before the 2015 development spike.";
            if (selectedYear > 2020) return "RECENT: Monitoring the stabilization of urban boundaries relative to current conservation policy.";
            return "ANALYSIS: Temporal drift established. Synthesizing spatial shifts across the bi-temporal baseline.";
        };

        const addNarrativeLog = () => {
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setTerminalLogs(prev => [...prev.slice(-15), {
                timestamp,
                msg: getNarrative(),
                isNarrative: true
            }]);
        };

        const interval = setInterval(() => {
            addNarrativeLog();
            setNarrationBatch(b => b + 1);
        }, 8000);

        // Initial log
        addNarrativeLog();

        return () => clearInterval(interval);
    }, [mode, selectedYear, policySliders.urban, policySliders.conservation]);

    const isSim = mode === 'projection';
    const metrics = useMemo(() => {
        if (!isSim) {
            const yearDiff = 2024 - Math.min(2024, selectedYear);
            return [
                { label: 'Tree Cover', value: `${(78.3 + yearDiff * 1.5).toFixed(1)}%`, trend: 'up' },
                { label: 'Urban Grid', value: `${Math.max(5, 40 - (yearDiff * 2.2)).toFixed(1)}%`, trend: 'down' },
                { label: 'NDVI (Avg)', value: (0.75 + (yearDiff * 0.01)).toFixed(3), trend: 'up' },
                { label: 'Biosphere Status', value: selectedYear < 2015 ? 'VIBRANT' : 'STRESSED', trend: 'neutral' }
            ];
        } else {
            const urbanFactor = policySliders.urban / 100;
            const conservationFactor = policySliders.conservation / 100;
            const habitatLoss = (urbanFactor * 60) - (conservationFactor * 25);
            return [
                { label: '2035 Habitat', value: `${Math.max(2, 78.3 - habitatLoss).toFixed(1)}%`, trend: 'down' },
                { label: 'Survival Index', value: (7.5 - ((urbanFactor * 4) - (conservationFactor * 2))).toFixed(1), trend: 'down' },
                { label: 'Thermal Delta', value: `+${((urbanFactor * 4) - (conservationFactor * 1.5)).toFixed(1)}°C`, trend: 'down' },
                { label: 'Causal Risk', value: habitatLoss > 30 ? 'ELEVATED' : 'STABLE', trend: 'down' }
            ];
        }
    }, [isSim, selectedYear, policySliders]);

    // Spectral lens helper
    const getLensFilter = () => {
        if (activeBand === 'THERMAL') return 'invert(1) hue-rotate(180deg) contrast(1.2)';
        if (activeBand === 'NDVI') return 'sepia(1) hue-rotate(90deg) saturate(3) brightness(1.1)';
        return 'saturate(2) brightness(1.2)'; // Enhanced RGB
    };

    return (
        <div className="satellite-modal-overlay">
            <div className="satellite-modal-content glass-panel" style={{ background: '#070c07', maxWidth: '1200px', border: '1px solid rgba(57, 255, 20, 0.3)' }}>
                <div className="modal-header">
                    <div className="header-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="neural-chip-container">
                                <Cpu size={28} className="text-neon-green" />
                                <div className="pulse-ring"></div>
                            </div>
                            <div>
                                <h2 style={{ letterSpacing: '3px', fontWeight: '900' }}>BIO-INTELLIGENCE TERMINAL v3.0</h2>
                                <span className="location-tag">ORBITAL SECTOR: {lng.toFixed(3)}E | {lat.toFixed(3)}N | STATION_GAMMA</span>
                            </div>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="comparison-section">
                        <div className="intelligence-toolbar mb-3">
                            <div className="mode-toggle-group">
                                <button className={`mode-btn ${mode === 'evolution' ? 'active' : ''}`} onClick={() => setMode('evolution')}>
                                    <Calendar size={14} /> TEMPORAL DRIFT
                                </button>
                                <button className={`mode-btn ${mode === 'projection' ? 'active' : ''}`} onClick={() => setMode('projection')}>
                                    <Zap size={14} /> CAUSAL PROJECTION
                                </button>
                            </div>
                            <div className="visual-controls">
                                <button className={`control-toggle ${showHologram ? 'active' : ''}`} onClick={() => setShowHologram(!showHologram)}>
                                    <Scan size={14} /> HOLOGRAM
                                </button>
                                <div className="band-pill-group">
                                    {['RGB', 'NDVI', 'THERMAL'].map(band => (
                                        <button key={band} className={`band-pill ${activeBand === band ? 'active' : ''}`} onClick={() => setActiveBand(band)}>
                                            {band}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {mode === 'evolution' && (
                            <div className="timeline-selector card glass-panel mb-3">
                                <div className="timeline-track-container" style={{ flex: 1 }}>
                                    <input
                                        type="range" min="2010" max="2024" step="1"
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

                        <div
                            ref={containerRef}
                            className="comparison-container intelligence-view"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setLensState(p => ({ ...p, active: false }))}
                        >
                            {(!loadStatus.baseline || (mode === 'evolution' && !loadStatus.comparison)) && (
                                <div className="sync-indicator">
                                    <Loader2 className="animate-spin" size={24} color="var(--neon-green)" />
                                    <span>STREAMING ORBITAL DATA...</span>
                                </div>
                            )}

                            {/* NEURAL X-RAY LENS */}
                            {lensState.active && (
                                <div
                                    className="neural-xray-lens"
                                    style={{
                                        left: lensState.x,
                                        top: lensState.y,
                                        backgroundImage: `url(${imgSpectral})`,
                                        backgroundPosition: `-${lensState.x}px -${lensState.y}px`,
                                        filter: getLensFilter()
                                    }}
                                >
                                    <div className="lens-crosshair"></div>
                                    <div className="lens-label">{activeBand === 'RGB' ? 'BIO-SCAN' : activeBand}</div>
                                </div>
                            )}

                            {/* HOLOGRAPHIC CAUSAL PATHS */}
                            {isSim && showHologram && (
                                <svg className="holographic-overlay" viewBox="0 0 600 450">
                                    <defs>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    {/* Urban branching paths - more visible as Urban slider increases */}
                                    <path
                                        d="M100,100 L150,150 L200,140 L250,180 M300,50 L320,120 L400,110 M50,400 L120,380 L180,420"
                                        className="hologram-path urban"
                                        style={{ opacity: policySliders.urban / 100, strokeDashoffset: policySliders.urban }}
                                    />
                                    <path
                                        d="M400,300 L450,350 L520,340 M550,50 L500,120 L580,180"
                                        className="hologram-path urban"
                                        style={{ opacity: policySliders.urban / 100, strokeDashoffset: policySliders.urban * 2 }}
                                    />
                                    {/* Conservation glow spots */}
                                    <circle cx="200" cy="250" r="40" className="hologram-pulse conservation" style={{ opacity: policySliders.conservation / 100 }} />
                                    <circle cx="450" cy="150" r="60" className="hologram-pulse conservation" style={{ opacity: policySliders.conservation / 100 }} />
                                </svg>
                            )}

                            <img
                                src={imgPresent}
                                alt="Baseline"
                                className="comparison-image"
                                onLoad={() => setLoadStatus(p => ({ ...p, baseline: true }))}
                                style={{ visibility: loadStatus.baseline ? 'visible' : 'hidden' }}
                            />

                            {mode === 'evolution' ? (
                                <img
                                    src={imgHistorical}
                                    alt="Historical"
                                    className="comparison-image-overlay"
                                    onLoad={() => setLoadStatus(p => ({ ...p, comparison: true }))}
                                    style={{
                                        visibility: loadStatus.comparison ? 'visible' : 'hidden',
                                        clipPath: `inset(0 0 0 ${sliderValue}%)`,
                                        filter: selectedYear < 2015 ? 'contrast(0.7) brightness(1.2) grayscale(0.2) sepia(0.2)' : 'none'
                                    }}
                                />
                            ) : (
                                <div
                                    className="comparison-image-overlay simulation-layer"
                                    style={{
                                        clipPath: `inset(0 0 0 ${sliderValue}%)`,
                                        backgroundImage: `url(${imgPresent})`,
                                        backgroundSize: 'cover',
                                        filter: `sepia(1) hue-rotate(${policySliders.urban > policySliders.conservation ? '-50deg' : '80deg'}) saturate(${1 + Math.max(policySliders.urban, policySliders.conservation) / 25}) contrast(1.1)`,
                                        mixBlendingMode: policySliders.urban > policySliders.conservation ? 'multiply' : 'screen',
                                        opacity: 0.7 + (Math.max(policySliders.urban, policySliders.conservation) / 300)
                                    }}
                                ></div>
                            )}

                            <input
                                type="range" min="0" max="100" value={sliderValue}
                                onChange={(e) => setSliderValue(e.target.value)}
                                className="comparison-slider"
                            />

                            <div className="label-past">BASELINE.2024</div>
                            <div className="label-present" style={{ color: isSim ? '#ff4d4d' : 'var(--neon-green)' }}>
                                {isSim ? 'PROJECTION.2035' : `TEMPORAL.${selectedYear}`}
                            </div>
                        </div>

                        <div className="ai-narrative-terminal mt-4" ref={terminalRef}>
                            {terminalLogs.map((log, i) => (
                                <div key={i} className={`terminal-line ${log.isNarrative ? 'narrative' : ''}`}>
                                    <span className="timestamp">[{log.timestamp}]</span>
                                    <span className="source">{log.isNarrative ? 'INTEL_AGENT' : 'SYS_LINK'}:</span>
                                    <span className="msg">{log.msg}</span>
                                    {log.isNarrative && <div className="typing-cursor"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="analysis-section">
                        {isSim && (
                            <div className="analysis-card mb-4 sim-card">
                                <h3 className="section-title"><Zap size={18} color="#ff4d4d" /> CAUSAL PARAMETERS</h3>
                                <div className="simulation-controls">
                                    <div className="control-item">
                                        <label>Urban Expansion Delta <span>{policySliders.urban}%</span></label>
                                        <input type="range" min="0" max="100" value={policySliders.urban} onChange={(e) => setPolicySliders(p => ({ ...p, urban: parseInt(e.target.value) }))} />
                                    </div>
                                    <div className="control-item">
                                        <label>Conservation Offset <span>{policySliders.conservation}%</span></label>
                                        <input type="range" min="0" max="100" value={policySliders.conservation} onChange={(e) => setPolicySliders(p => ({ ...p, conservation: parseInt(e.target.value) }))} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="analysis-card mb-4">
                            <h3 className="section-title"><Activity size={18} /> BIO-METRIC AUDIT</h3>
                            <div className="metrics-grid">
                                {metrics.map(m => (
                                    <div key={m.label} className="metric-box">
                                        <label>{m.label}</label>
                                        <div className="metric-value-row">
                                            <span>{m.value}</span>
                                            <span className={`trend-${m.trend}`}><Eye size={10} style={{ marginRight: '4px' }} /> MONITORING</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="analysis-card">
                            <h3 className="section-title"><Compass size={18} /> SPATIAL BREAKDOWN</h3>
                            <div className="threat-chart">
                                {[
                                    { label: 'Canopy Density', val: isSim ? Math.max(5, 75 - (policySliders.urban * 0.4)) : Math.min(100, 75 + (2024 - selectedYear) * 1.5), color: '#39ff14' },
                                    { label: 'Built Environment', val: isSim ? Math.min(100, 45 + (policySliders.urban * 0.5)) : Math.max(5, 45 - (2024 - selectedYear) * 2), color: '#ff4d4d' },
                                    { label: 'Ecosystem Stress', val: isSim ? Math.min(100, 30 + (policySliders.urban * 0.3)) : 30, color: '#f1c40f' }
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
                .intelligence-view {
                    cursor: crosshair;
                }
                .neural-xray-lens {
                    position: absolute;
                    width: 160px;
                    height: 160px;
                    border-radius: 50%;
                    border: 2px solid var(--neon-green);
                    box-shadow: 0 0 20px rgba(57, 255, 20, 0.4), inset 0 0 20px rgba(57, 255, 20, 0.2);
                    pointer-events: none;
                    z-index: 30;
                    transform: translate(-50%, -50%);
                    background-repeat: no-repeat;
                    overflow: hidden;
                }
                .lens-crosshair {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(to right, var(--neon-green) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--neon-green) 1px, transparent 1px);
                    background-position: center;
                    background-size: 20px 20px;
                    background-repeat: no-repeat;
                    opacity: 0.5;
                }
                .lens-label {
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--neon-green);
                    color: black;
                    font-size: 0.6rem;
                    font-weight: 900;
                    padding: 2px 8px;
                    border-radius: 10px;
                    letter-spacing: 1px;
                }
                .holographic-overlay {
                    position: absolute;
                    inset: 0;
                    z-index: 25;
                    pointer-events: none;
                }
                .hologram-path {
                    fill: none;
                    stroke: #ff4d4d;
                    stroke-width: 2;
                    stroke-dasharray: 100;
                    animation: dash 3s linear infinite;
                    filter: url(#glow);
                }
                .hologram-pulse {
                    fill: rgba(57, 255, 20, 0.1);
                    stroke: var(--neon-green);
                    stroke-width: 1;
                    animation: pulse-glow 2s ease-in-out infinite;
                }
                @keyframes dash {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes pulse-glow {
                    0% { transform: scale(0.9); opacity: 0.2; }
                    50% { transform: scale(1.1); opacity: 0.5; }
                    100% { transform: scale(0.9); opacity: 0.2; }
                }
                .ai-narrative-terminal {
                    background: rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(57, 255, 20, 0.1);
                    border-radius: 8px;
                    padding: 15px;
                    max-height: 180px;
                    overflow-y: auto;
                    font-family: 'Courier New', monospace;
                }
                .terminal-line.narrative {
                    color: var(--neon-green);
                    border-left: 2px solid var(--neon-green);
                    padding-left: 10px;
                    margin: 10px 0;
                    background: rgba(57, 255, 20, 0.05);
                }
                .intelligence-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .visual-controls {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                .control-toggle {
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #888;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                }
                .control-toggle.active {
                    color: #00f0ff;
                    border-color: #00f0ff;
                    box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
                }
                .sim-card .section-title { color: #ff4d4d; }
            `}} />
        </div>
    );
};

export default SatelliteAnalysis;
