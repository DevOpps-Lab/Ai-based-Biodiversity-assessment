import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Leaf, Target, Settings, ChevronRight, Activity, Zap, Info, Cpu, MapPin, Loader2, BrainCircuit } from 'lucide-react';
import axios from 'axios';

const MitigationPlan = ({ analysisData, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);
    const [error, setError] = useState(null);

    const lat = analysisData?.location?.lat || 13.0827;
    const lng = analysisData?.location?.lng || 80.2707;
    const riskLevel = analysisData?.rules?.risk_level || 'Low';

    useEffect(() => {
        const fetchPlan = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:8000/mitigation-plan?lat=${lat}&lng=${lng}`);
                setPlan(res.data);
            } catch (err) {
                console.error("Failed to fetch mitigation intelligence:", err);
                setError("Neural connection timed out. Please retry link synchronization.");
            } finally {
                // Artificial delay for "AI synthesis" feel
                setTimeout(() => setLoading(false), 2500);
            }
        };

        fetchPlan();
    }, [lat, lng]);

    if (loading) {
        return (
            <div className="mitigation-modal-overlay">
                <div className="mitigation-modal-content glass-panel loading-state">
                    <div className="loading-animation">
                        <div className="neural-core">
                            <BrainCircuit size={48} className="text-neon-green animate-pulse" />
                        </div>
                        <div className="loading-text">
                            <h3>SYNTHESIZING ADAPTIVE STRATEGIES</h3>
                            <div className="loading-bar"><div className="bar-progress"></div></div>
                            <span className="coord-trace">TARGET: {lat.toFixed(4)}N, {lng.toFixed(4)}E</span>
                        </div>
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .loading-state { padding: 60px; display: flex; align-items: center; justify-content: center; min-height: 400px; }
                    .loading-animation { display: flex; flex-direction: column; align-items: center; gap: 30px; text-align: center; }
                    .neural-core { padding: 20px; background: rgba(57, 255, 20, 0.05); border-radius: 50%; border: 1px solid rgba(57, 255, 20, 0.2); box-shadow: 0 0 30px rgba(57, 255, 20, 0.1); }
                    .loading-text h3 { letter-spacing: 3px; font-size: 0.9rem; color: var(--neon-green); margin-bottom: 15px; font-weight: 900; }
                    .loading-bar { width: 240px; height: 3px; background: #111; border-radius: 4px; overflow: hidden; margin: 0 auto 10px; }
                    .bar-progress { width: 40%; height: 100%; background: var(--neon-green); animation: slide 2s infinite ease-in-out; }
                    .coord-trace { font-size: 0.6rem; color: #444; font-family: monospace; }
                    @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
                `}} />
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="mitigation-modal-overlay">
                <div className="mitigation-modal-content glass-panel error-state">
                    <Activity size={32} className="text-red-500 mb-4" />
                    <p>{error || "Critical failure in mitigation engine."}</p>
                    <button onClick={onClose} className="btn-secondary mt-4">DISCONNECT</button>
                </div>
            </div>
        );
    }

    return (
        <div className="mitigation-modal-overlay">
            <div className="mitigation-modal-content glass-panel industrial-theme">
                <div className="mitigation-header">
                    <div className="header-badge">
                        <ShieldCheck size={14} />
                        <span>ECO-RESILIENCE ACTION PLAN</span>
                    </div>
                    <button className="close-mitigation" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="mitigation-body">
                    <div className="plan-intro">
                        <div className="location-context">
                            <MapPin size={24} className="text-neon-green" />
                            <div>
                                <h3>{plan.location}</h3>
                                <span className="focus-text">PRIMARY FOCUS: {plan.focus.toUpperCase()}</span>
                                <div className="threat-tags">
                                    {(plan.threats || []).map(t => (
                                        <span key={t} className="threat-tag">#{t.toUpperCase()}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={`risk-status ${riskLevel.toLowerCase()}`}>
                            <label>INTEL_RISK</label>
                            <span>{riskLevel.toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="strategy-grid">
                        {(plan.strategies || []).map((s, idx) => (
                            <div key={idx} className="strategy-card">
                                <div className="card-header">
                                    <div className="title-row">
                                        <div className="strategy-icon-box">
                                            {idx === 0 ? <Leaf size={16} /> : idx === 1 ? <Cpu size={16} /> : <Target size={16} />}
                                        </div>
                                        <h4>{s.title}</h4>
                                    </div>
                                    <ChevronRight size={16} className="text-neutral-600" />
                                </div>
                                <p className="strategy-desc">{s.desc}</p>
                                <div className="strategy-methods">
                                    {s.methods.map((m, i) => (
                                        <div key={i} className="method-pill">{m}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mitigation-footer">
                        <div className="footer-intel">
                            <Zap size={14} className="animate-pulse text-neon-green" />
                            <span>GAEA CAUSAL ENGINE: SIMULATED IMPACT: <b className="text-neon-green">-{plan.reduction_forecast}%</b> RISK REDUCTION</span>
                        </div>
                        <button className="btn-confirm-plan" onClick={onClose}>
                            DEPLOY MITIGATION PROTOCOL
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .mitigation-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.95);
                    backdrop-filter: blur(25px);
                    z-index: 3000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                }
                .mitigation-modal-content {
                    width: 100%;
                    max-width: 850px;
                    max-height: 92vh;
                    display: flex;
                    flex-direction: column;
                    background: #020402 !important;
                    border: 1px solid rgba(57, 255, 20, 0.4);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 0 100px rgba(0, 0, 0, 0.9), 0 0 20px rgba(57, 255, 20, 0.1);
                }
                .mitigation-header {
                    padding: 20px 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    background: rgba(0,0,0,0.8);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .header-badge {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(57, 255, 20, 0.1);
                    color: var(--neon-green);
                    padding: 6px 14px;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 900;
                    letter-spacing: 2.5px;
                }
                .close-mitigation { background: none; border: none; color: #444; cursor: pointer; transition: color 0.3s; }
                .close-mitigation:hover { color: #ff4d4d; }

                .mitigation-body { 
                    padding: 35px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 30px; 
                    overflow-y: auto;
                    flex: 1;
                }
                
                .plan-intro { display: flex; justify-content: space-between; align-items: flex-start; }
                .focus-text { display: block; font-size: 0.7rem; color: var(--neon-green); font-weight: 800; letter-spacing: 1px; margin-top: 5px; opacity: 0.8; }
                .threat-tags { display: flex; gap: 10px; margin-top: 15px; }
                .threat-tag { font-size: 0.55rem; color: #555; font-weight: 800; letter-spacing: 1px; border: 1px solid #111; padding: 2px 8px; border-radius: 4px; }
                
                .location-context h3 { font-size: 1.4rem; color: #fff; font-weight: 800; }
                .risk-status { text-align: right; }
                .risk-status label { font-size: 0.55rem; color: #333; font-weight: 900; letter-spacing: 1.5px; }
                .risk-status span { font-size: 1.2rem; font-weight: 950; display: block; }
                .risk-status.high span { color: #ff4d4d; }
                .risk-status.medium span { color: #f1c40f; }
                .risk-status.low span { color: var(--neon-green); }

                .strategy-grid { display: grid; grid-template-columns: 1fr; gap: 15px; }
                .strategy-card { background: rgba(255,255,255,0.01); padding: 25px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.03); transition: all 0.3s; }
                .strategy-card:hover { border-color: rgba(57, 255, 20, 0.2); background: rgba(57, 255, 20, 0.02); transform: translateX(5px); }
                
                .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .strategy-icon-box { width: 32px; height: 32px; background: #0a0a0a; border: 1px solid #222; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--neon-green); }
                .title-row h4 { font-size: 0.8rem; letter-spacing: 1.5px; font-weight: 900; color: #efefef; }
                .strategy-desc { font-size: 0.8rem; color: #666; line-height: 1.6; margin-bottom: 20px; }
                
                .strategy-methods { display: flex; flex-wrap: wrap; gap: 8px; }
                .method-pill { font-size: 0.6rem; color: #aaa; background: #000; padding: 4px 10px; border-radius: 4px; border: 1px solid #111; font-weight: 600; text-transform: uppercase; }

                .mitigation-footer { margin-top: 10px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 30px; }
                .footer-intel { display: flex; align-items: center; gap: 12px; color: #444; font-size: 0.7rem; font-weight: 900; font-family: monospace; }
                .btn-confirm-plan { background: var(--neon-green); color: black; border: none; padding: 14px 30px; border-radius: 6px; font-weight: 950; font-size: 0.8rem; letter-spacing: 1.5px; cursor: pointer; transition: all 0.3s; }
                .btn-confirm-plan:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(57, 255, 20, 0.5); }
                
                .text-neon-green { color: var(--neon-green); }
                .error-state { padding: 50px; text-align: center; }
            `}} />
        </div>
    );
};

export default MitigationPlan;
