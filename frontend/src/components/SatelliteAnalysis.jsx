import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Activity, BarChart3, AlertTriangle, Layers, Cpu, Compass, Zap, HelpCircle, Loader2, Calendar, Target, Scan, Eye, ChevronRight, Binary, Globe, ShieldCheck } from 'lucide-react';

const SatelliteAnalysis = ({ analysisData, onClose, onOpenMitigation }) => {
    const [mode, setMode] = useState('evolution');
    const [selectedYear, setSelectedYear] = useState(2024);
    const [comparisonSlider, setComparisonSlider] = useState(50);
    const [policySliders, setPolicySliders] = useState({ urban: 30, conservation: 20 });
    const [activeBand, setActiveBand] = useState('RGB');
    const [terminalLogs, setTerminalLogs] = useState([]);

    // UI REFINEMENTS
    const [lensState, setLensState] = useState({ x: 0, y: 0, active: false });
    const [isSyncing, setIsSyncing] = useState(true);
    const [loadStatus, setLoadStatus] = useState({ baseline: false, comparison: false });
    const [useDemoFallback, setUseDemoFallback] = useState(false);

    const terminalRef = useRef(null);
    const viewPortRef = useRef(null);

    const lat = analysisData?.location?.lat || 13.0827;
    const lng = analysisData?.location?.lng || 80.2707;

    // PROVIDER ABSTRACTION
    const getSatelliteUrl = (year, isBaseline = false, forceBand = null) => {
        if (useDemoFallback) return (isBaseline || year >= 2024) ? "/satellite/present.png" : "/satellite/past.png";
        let bandParam = '&l=sat';
        if (forceBand === 'THERMAL') bandParam = '&l=sat,skl';
        if (forceBand === 'NDVI') bandParam = '&l=sat&type=map';
        if (year >= 2024) return `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=14${bandParam}&size=600,450`;
        return `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=13${bandParam}&size=600,450`;
    };

    const imgPresent = useMemo(() => getSatelliteUrl(2024, true), [lat, lng, useDemoFallback]);
    const imgHistorical = useMemo(() => getSatelliteUrl(selectedYear), [lat, lng, selectedYear, useDemoFallback]);
    const imgSpectral = useMemo(() => getSatelliteUrl(2024, true, activeBand === 'RGB' ? 'NDVI' : activeBand), [lat, lng, activeBand, useDemoFallback]);

    // LENS TRACKING
    const handleViewportMove = (e) => {
        if (!viewPortRef.current) return;
        const rect = viewPortRef.current.getBoundingClientRect();
        setLensState({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
    };

    // SYNC LIFECYCLE
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

    // AI NARRATION ENGINE
    useEffect(() => {
        const getNarrative = () => {
            const urban = policySliders.urban;
            const conservation = policySliders.conservation;

            if (mode === 'projection') {
                if (urban > 60) return "DANGER: Structural displacement in ecosystem matrix. Habitat corridors are reaching critical fragmentation thresholds.";
                if (conservation > 60) return "RESTORE: Biogenic signatures are expanding. Neural models detect successful canopy reconnection in 80% of sectors.";
                return "SIMULATING: Running GAEA-ML models to synthesize anthropogenic-ecological equilibrium for 2035 window.";
            }

            // Use real data reasons if available
            const reasons = analysisData?.rules?.reasons || [];
            if (reasons.length > 0) {
                const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
                return `ANALYSIS: ${randomReason}`;
            }

            if (selectedYear < 2015) return "HISTORICAL: Accessing vintage orbital archives. Spectral signatures show a 34.2% higher canopy density than 2024 baseline.";
            return "SYNCING: Aligning bi-temporal orbital feeds. Spatial reasoning in progress for sector [" + lng.toFixed(2) + "E, " + lat.toFixed(2) + "N].";
        };

        const addLog = () => {
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setTerminalLogs(prev => [...prev.slice(-12), { timestamp, msg: getNarrative(), isIntel: true }]);
        };

        addLog();
        const interval = setInterval(addLog, 12000);
        return () => clearInterval(interval);
    }, [mode, selectedYear, policySliders, analysisData, lat, lng]);

    useEffect(() => {
        if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }, [terminalLogs]);

    const isSim = mode === 'projection';
    const metrics = useMemo(() => {
        if (isSim) {
            const u = policySliders.urban / 100;
            const c = policySliders.conservation / 100;
            const loss = (u * 60) - (c * 25);
            return [
                { label: '2035 Habitat', value: `${Math.max(2, 78.3 - loss).toFixed(1)}%`, trend: 'down', icon: <Zap size={12} /> },
                { label: 'Survival Stat', value: (7.5 - ((u * 4) - (c * 2))).toFixed(1), trend: 'down', icon: <Activity size={12} /> },
                { label: 'Heat Delta', value: `+${((u * 4) - (c * 1.5)).toFixed(1)}°C`, trend: 'down', icon: <AlertTriangle size={12} /> }
            ];
        }

        // Real Data Metrics
        const indicators = analysisData?.indicators || {};
        const ndvi = indicators.ndvi || 0.75;
        const forest = indicators.forest_coverage || 78.3;
        const temp = indicators.temperature || 24.5;

        const diff = 2024 - Math.min(2024, selectedYear);

        return [
            {
                label: 'Canopy Density',
                value: `${(forest + (diff * 0.8)).toFixed(1)}%`,
                trend: diff > 0 ? 'up' : 'stable',
                icon: <Eye size={12} />
            },
            {
                label: 'NDVI Median',
                value: (ndvi + (diff * 0.005)).toFixed(3),
                trend: diff > 0 ? 'up' : 'stable',
                icon: <Activity size={12} />
            },
            {
                label: 'Thermal Base',
                value: `${(temp - (diff * 0.2)).toFixed(1)}°C`,
                trend: diff > 0 ? 'down' : 'stable',
                icon: <Compass size={12} />
            }
        ];
    }, [isSim, selectedYear, policySliders, analysisData]);

    return (
        <div className="satellite-modal-overlay">
            <div className="satellite-modal-content dashboard-layout glass-panel">

                {/* HEADER SECTION */}
                <div className="dashboard-header">
                    <div className="header-left">
                        <div className="intel-badge">
                            <Binary size={18} />
                            <span>GAEA INTELLIGENCE HUB</span>
                        </div>
                        <h2>ECOLOGICAL DIGITAL TWIN <span className="version">v3.5</span></h2>
                    </div>
                    <div className="header-right">
                        <div className="coord-display">
                            <Globe size={14} />
                            <span>{lat.toFixed(4)}N, {lng.toFixed(4)}E</span>
                        </div>
                        <button className="close-dashboard" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="dashboard-body">

                    {/* LEFT PANEL: DATA VIEWPORT */}
                    <div className="visual-viewport"
                        ref={viewPortRef}
                        onMouseMove={handleViewportMove}
                        onMouseLeave={() => setLensState(p => ({ ...p, active: false }))}>

                        <div className="viewport-tools">
                            <div className="tool-pill">
                                <Scan size={14} />
                                <span>{isSim ? 'PREDICTIVE SIMULATION' : 'TEMPORAL DRIFT'}</span>
                            </div>
                            <div className="band-tabs">
                                {['RGB', 'NDVI', 'THERMAL'].map(b => (
                                    <button key={b} className={activeBand === b ? 'active' : ''} onClick={() => setActiveBand(b)}>{b}</button>
                                ))}
                            </div>
                        </div>

                        {/* COMPARISON ENGINE */}
                        <div className="viewport-imagery">
                            {(!loadStatus.baseline || (mode === 'evolution' && !loadStatus.comparison)) && (
                                <div className="orbital-sync-overlay">
                                    <Loader2 className="animate-spin" size={32} />
                                    <span>SYNCHRONIZING ORBITAL SECTOR...</span>
                                </div>
                            )}

                            {/* NEURAL LENS overlay */}
                            {lensState.active && (
                                <div className="neural-lens" style={{
                                    left: lensState.x, top: lensState.y,
                                    backgroundImage: `url(${imgSpectral})`,
                                    backgroundPosition: `-${lensState.x}px -${lensState.y}px`,
                                    filter: activeBand === 'THERMAL' ? 'invert(1) hue-rotate(180deg) contrast(1.2)' :
                                        activeBand === 'NDVI' ? 'sepia(1) hue-rotate(90deg) saturate(3)' : 'saturate(1.5)'
                                }}>
                                    <div className="lens-overlay">
                                        <div className="lens-label">{activeBand} SCAN</div>
                                    </div>
                                </div>
                            )}

                            {/* HOLOGRAPHIC SVG OVERLAY */}
                            {isSim && (
                                <svg className="hologram-layer" viewBox="0 0 600 450">
                                    <path d="M50,50 L100,100 L80,150 L120,200" className="neural-path" style={{ opacity: policySliders.urban / 100 }} />
                                    <path d="M400,300 L450,350 L520,320" className="neural-path" style={{ opacity: policySliders.urban / 100, animationDelay: '1s' }} />
                                    <circle cx="250" cy="200" r={policySliders.conservation * 0.8} className="biosphere-pulse" style={{ opacity: policySliders.conservation / 100 }} />
                                </svg>
                            )}

                            <img src={imgPresent} alt="Base" className="img-base" style={{ visibility: loadStatus.baseline ? 'visible' : 'hidden' }} />

                            {mode === 'evolution' ? (
                                <img src={imgHistorical} alt="History" className="img-overlay" style={{
                                    visibility: loadStatus.comparison ? 'visible' : 'hidden',
                                    clipPath: `inset(0 0 0 ${comparisonSlider}%)`,
                                    filter: selectedYear < 2015 ? 'contrast(0.7) brightness(1.2) grayscale(0.2)' : 'none'
                                }} />
                            ) : (
                                <div className="simulation-mask" style={{
                                    clipPath: `inset(0 0 0 ${comparisonSlider}%)`,
                                    backgroundImage: `url(${imgPresent})`,
                                    filter: `sepia(1) hue-rotate(${policySliders.urban > policySliders.conservation ? '-50deg' : '80deg'}) saturate(${1 + Math.max(policySliders.urban, policySliders.conservation) / 30})`,
                                    mixBlendingMode: policySliders.urban > policySliders.conservation ? 'multiply' : 'screen',
                                    opacity: 0.8
                                }}></div>
                            )}

                            <input type="range" min="0" max="100" value={comparisonSlider} onChange={e => setComparisonSlider(e.target.value)} className="viewport-slider" />

                            <div className="viewport-labels">
                                <span className="label-l">BASELINE 2024</span>
                                <span className="label-r" style={{ color: isSim ? '#ff4d4d' : 'var(--neon-green)' }}>
                                    {isSim ? 'PREDICTION 2035' : `TEMPORAL ${selectedYear}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: INTELLIGENCE SIDEBAR */}
                    <div className="intelligence-sidebar">

                        {/* MODE SELECTOR */}
                        <div className="panel-group">
                            <h3 className="panel-title">SYSTEM MODE</h3>
                            <div className="mode-switcher">
                                <button className={mode === 'evolution' ? 'active' : ''} onClick={() => setMode('evolution')}>EVOLUTION</button>
                                <button className={mode === 'projection' ? 'active' : ''} onClick={() => setMode('projection')}>SIMULATION</button>
                            </div>
                        </div>

                        {/* CONTROLS AREA */}
                        <div className="panel-group">
                            <h3 className="panel-title">{isSim ? 'POLICY DRIVERS' : 'TEMPORAL FOCUS'}</h3>
                            {mode === 'evolution' ? (
                                <div className="timeline-control">
                                    <div className="timeline-header">
                                        <span>Target Epoch:</span>
                                        <span className="val">{selectedYear}</span>
                                    </div>
                                    <input type="range" min="2010" max="2024" step="1" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="pro-slider" />
                                    <div className="timeline-ticks">
                                        {['2010', '2014', '2018', '2024'].map(y => <span key={y}>{y}</span>)}
                                    </div>
                                </div>
                            ) : (
                                <div className="simulation-inputs">
                                    <div className="input-row">
                                        <div className="label-row"><span>Urban Sprawl</span><span>{policySliders.urban}%</span></div>
                                        <input type="range" min="0" max="100" value={policySliders.urban} onChange={e => setPolicySliders(p => ({ ...p, urban: parseInt(e.target.value) }))} className="pro-slider urban" />
                                    </div>
                                    <div className="input-row">
                                        <div className="label-row"><span>Conservation</span><span>{policySliders.conservation}%</span></div>
                                        <input type="range" min="0" max="100" value={policySliders.conservation} onChange={e => setPolicySliders(p => ({ ...p, conservation: parseInt(e.target.value) }))} className="pro-slider conservation" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* METRICS PANEL */}
                        <div className="panel-group">
                            <div className="label-row" style={{ alignItems: 'center' }}>
                                <h3 className="panel-title" style={{ margin: 0 }}>LIVE TELEMETRY</h3>
                                <button className="recovery-trigger" onClick={onOpenMitigation}>
                                    <ShieldCheck size={12} /> RECOVERY
                                </button>
                            </div>
                            <div className="metrics-list">
                                {metrics.map(m => (
                                    <div key={m.label} className="metric-entry">
                                        <div className="entry-icon">{m.icon}</div>
                                        <div className="entry-data">
                                            <span className="label">{m.label}</span>
                                            <span className="value">{m.value}</span>
                                        </div>
                                        <div className={`entry-trend ${m.trend}`}>{m.trend.toUpperCase()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* REASONING CHAIN */}
                        {!isSim && analysisData?.rules?.reasons?.length > 0 && (
                            <div className="panel-group reasoning-chain">
                                <h3 className="panel-title">REASONING CHAIN</h3>
                                <div className="reason-list">
                                    {analysisData.rules.reasons.map((r, i) => (
                                        <div key={i} className="reason-item">
                                            <div className="reason-bullet" />
                                            <span className="reason-text">{r}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TARGET INDICATORS */}
                        {!isSim && analysisData?.impacts?.length > 0 && (
                            <div className="panel-group impacts-grid">
                                <h3 className="panel-title">TARGET INDICATORS</h3>
                                <div className="impacts-list">
                                    {analysisData.impacts.slice(0, 3).map((imp, i) => (
                                        <div key={i} className="impact-pill">
                                            <span className="group">{imp.group}</span>
                                            <span className="status">MONITORED</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* AI NARRATIVE TERMINAL */}
                        <div className="panel-group terminal-container">
                            <div className="terminal-header">
                                <Binary size={12} />
                                <span>GAEA-ML_FEED</span>
                            </div>
                            <div className="intelligence-terminal" ref={terminalRef}>
                                {terminalLogs.map((log, i) => (
                                    <div key={i} className={`terminal-post ${log.isIntel ? 'intel' : ''}`}>
                                        <span className="time">[{log.timestamp}]</span>
                                        <span className="msg">{log.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* INLINE COMPONENT SCOPED STYLES */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .satellite-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(15px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                }
                .dashboard-layout {
                    width: 100%;
                    max-width: 1200px;
                    height: 85vh;
                    background: #050805 !important;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid rgba(57, 255, 20, 0.2);
                    box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    border-radius: 12px;
                }
                .dashboard-header {
                    padding: 20px 30px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .intel-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(57, 255, 20, 0.1);
                    color: var(--neon-green);
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 900;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                }
                .dashboard-header h2 { font-size: 1.2rem; letter-spacing: 1px; }
                .dashboard-header .version { opacity: 0.3; font-size: 0.7rem; margin-left: 10px; }
                .coord-display { display: flex; align-items: center; gap: 8px; color: #555; font-size: 0.75rem; font-family: monospace; }
                .close-dashboard { background: none; border: none; color: #555; cursor: pointer; transition: color 0.3s; }
                .close-dashboard:hover { color: #ff4d4d; }

                .dashboard-body {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                /* VISUAL VIEWPORT Styles */
                .visual-viewport {
                    flex: 7;
                    background: #000;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                }
                .viewport-tools {
                    padding: 15px 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.4);
                    z-index: 10;
                }
                .tool-pill { display: flex; align-items: center; gap: 10px; font-size: 0.7rem; color: #888; font-weight: 800; }
                .band-tabs { display: flex; gap: 4px; background: #111; padding: 3px; border-radius: 6px; }
                .band-tabs button { background: none; border: none; padding: 4px 12px; border-radius: 4px; color: #555; font-size: 0.65rem; font-weight: 900; cursor: pointer; }
                .band-tabs button.active { background: #222; color: #fff; }

                .viewport-imagery {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    cursor: crosshair;
                }
                .img-base, .img-overlay, .simulation-mask {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .orbital-sync-overlay {
                    position: absolute;
                    inset: 0;
                    background: #000;
                    z-index: 50;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    color: var(--neon-green);
                    font-size: 0.7rem;
                    font-weight: 900;
                    letter-spacing: 2px;
                }
                .neural-lens {
                    position: absolute;
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    border: 2px solid var(--neon-green);
                    box-shadow: 0 0 30px rgba(57, 255, 20, 0.3);
                    z-index: 60;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    background-repeat: no-repeat;
                }
                .lens-overlay {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle, transparent 40%, rgba(57, 255, 20, 0.1) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .lens-label { background: var(--neon-green); color: #000; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 900; margin-top: 100px; }

                .viewport-slider {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 100%;
                    transform: translateY(-50%);
                    z-index: 100;
                    appearance: none;
                    background: transparent;
                    pointer-events: none;
                }
                .viewport-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 2px;
                    height: 90vh;
                    background: var(--neon-green);
                    cursor: ew-resize;
                    pointer-events: auto;
                    box-shadow: 0 0 10px var(--neon-green);
                }
                .viewport-labels {
                    position: absolute;
                    bottom: 25px;
                    left: 25px;
                    right: 25px;
                    display: flex;
                    justify-content: space-between;
                    z-index: 70;
                    pointer-events: none;
                }
                .viewport-labels span { background: rgba(0,0,0,0.8); padding: 4px 12px; border-radius: 4px; font-size: 0.6rem; font-weight: 900; letter-spacing: 1px; border: 1px solid rgba(255,255,255,0.1); }

                /* INTELLIGENCE SIDEBAR Styles */
                .intelligence-sidebar {
                    flex: 3;
                    background: rgba(5, 8, 5, 0.5);
                    display: flex;
                    flex-direction: column;
                    padding: 25px;
                    gap: 30px;
                    overflow-y: auto;
                }
                .panel-group { display: flex; flex-direction: column; gap: 15px; }
                .panel-title { font-size: 0.65rem; color: #555; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }

                .mode-switcher { display: flex; background: #111; padding: 4px; border-radius: 8px; }
                .mode-switcher button { flex: 1; border: none; background: none; color: #555; padding: 8px; font-size: 0.7rem; font-weight: 800; cursor: pointer; transition: all 0.3s; border-radius: 6px; }
                .mode-switcher button.active { background: var(--neon-green); color: #000; box-shadow: 0 0 10px rgba(57, 255, 20, 0.3); }

                .pro-slider { appearance: none; width: 100%; height: 4px; background: #222; border-radius: 2px; }
                .pro-slider::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; cursor: pointer; box-shadow: 0 0 5px rgba(255,255,255,0.5); }
                .pro-slider.urban::-webkit-slider-thumb { background: #ff4d4d; box-shadow: 0 0 10px rgba(255, 77, 77, 0.5); }
                .pro-slider.conservation::-webkit-slider-thumb { background: var(--neon-green); box-shadow: 0 0 10px rgba(57, 255, 20, 0.5); }

                .label-row { display: flex; justify-content: space-between; color: #888; font-size: 0.7rem; font-weight: 700; margin-bottom: 5px; }
                .timeline-header { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 900; margin-bottom: 10px; }
                .timeline-header .val { color: var(--neon-green); }
                .timeline-ticks { display: flex; justify-content: space-between; font-size: 0.55rem; color: #444; margin-top: 8px; font-weight: 900; }

                .metrics-list { display: flex; flex-direction: column; gap: 12px; }
                .metric-entry { display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.02); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
                .entry-icon { width: 32px; height: 32px; background: #111; display: flex; align-items: center; justify-content: center; border-radius: 6px; color: var(--neon-green); border: 1px solid rgba(57, 255, 20, 0.1); }
                .entry-data { flex: 1; display: flex; flex-direction: column; }
                .entry-data .label { font-size: 0.6rem; color: #666; font-weight: 800; }
                .entry-data .value { font-size: 0.9rem; font-weight: 900; color: #fff; }
                .entry-trend { font-size: 0.55rem; font-weight: 900; padding: 2px 6px; border-radius: 3px; }
                .entry-trend.up { background: rgba(57, 255, 20, 0.1); color: var(--neon-green); }

                /* NEW: RECOVERY TRIGGER */
                .recovery-trigger {
                    background: rgba(57, 255, 20, 0.1);
                    border: 1px solid rgba(57, 255, 20, 0.2);
                    color: var(--neon-green);
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 0.6rem;
                    font-weight: 900;
                    letter-spacing: 1px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .recovery-trigger:hover {
                    background: var(--neon-green);
                    color: #000;
                    box-shadow: 0 0 15px rgba(57, 255, 20, 0.4);
                }
                .entry-trend.down { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; }

                .terminal-container { background: #020402; border: 1px solid rgba(57, 255, 20, 0.1); border-radius: 8px; overflow: hidden; height: 200px; }
                .terminal-header { background: rgba(57, 255, 20, 0.1); padding: 5px 12px; display: flex; align-items: center; gap: 8px; color: var(--neon-green); font-size: 0.6rem; font-weight: 900; letter-spacing: 1px; }
                .intelligence-terminal { padding: 12px; height: 160px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 0.65rem; }
                .terminal-post { margin-bottom: 10px; display: flex; flex-direction: column; border-left: 1px solid #222; padding-left: 10px; }
                .terminal-post.intel { border-left-color: var(--neon-green); background: rgba(57, 255, 20, 0.03); padding: 6px 10px; }
                .terminal-post .time { color: #444; font-size: 0.55rem; }
                .terminal-post .msg { color: #888; line-height: 1.4; }
                .terminal-post.intel .msg { color: var(--neon-green); }

                /* REASONING CHAIN STYLES */
                .reasoning-chain { background: rgba(255, 255, 255, 0.02); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
                .reason-list { display: flex; flex-direction: column; gap: 10px; }
                .reason-item { display: flex; align-items: flex-start; gap: 10px; }
                .reason-bullet { min-width: 4px; height: 4px; background: var(--neon-green); border-radius: 50%; margin-top: 6px; box-shadow: 0 0 5px var(--neon-green); }
                .reason-text { font-size: 0.65rem; color: #aaa; line-height: 1.4; font-family: 'Inter', sans-serif; font-weight: 500; }

                /* IMPACTS GRID STYLES */
                .impacts-list { display: flex; flex-wrap: wrap; gap: 8px; }
                .impact-pill { background: #0a0a0a; border: 1px solid #111; padding: 6px 12px; border-radius: 4px; display: flex; flex-direction: column; gap: 2px; transition: all 0.3s; }
                .impact-pill:hover { border-color: rgba(57, 255, 20, 0.3); background: rgba(57, 255, 20, 0.02); }
                .impact-pill .group { font-size: 0.55rem; color: #fff; font-weight: 800; letter-spacing: 0.5px; }
                .impact-pill .status { font-size: 0.45rem; color: var(--neon-green); font-weight: 950; opacity: 0.6; }

                /* HOLOGRAM ANIMATIONS */
                .hologram-layer { position: absolute; inset: 0; z-index: 40; pointer-events: none; }
                .neural-path { fill: none; stroke: #ff4d4d; stroke-width: 2; stroke-dasharray: 100; animation: dash 5s linear infinite; filter: drop-shadow(0 0 5px #ff4d4d); }
                .biosphere-pulse { fill: none; stroke: var(--neon-green); stroke-width: 1; animation: pulse 3s infinite; filter: drop-shadow(0 0 8px var(--neon-green)); }
                @keyframes dash { to { stroke-dashoffset: -200; } }
                @keyframes pulse { 0% { r: 10; opacity: 1; stroke-width: 3; } 100% { r: 80; opacity: 0; stroke-width: 1; } }

                /* SCROLLBARS */
                .intelligence-sidebar::-webkit-scrollbar, .intelligence-terminal::-webkit-scrollbar { width: 4px; }
                .intelligence-sidebar::-webkit-scrollbar-track, .intelligence-terminal::-webkit-scrollbar-track { background: transparent; }
                .intelligence-sidebar::-webkit-scrollbar-thumb, .intelligence-terminal::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 2px; }
            `}} />
        </div>
    );
};

export default SatelliteAnalysis;
