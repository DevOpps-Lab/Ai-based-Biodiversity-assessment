import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Leaf, Shield, Zap, BarChart3, Globe, ArrowRight, Cpu } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            {/* Background elements */}
            <div className="bg-glow bg-glow-1"></div>
            <div className="bg-glow bg-glow-2"></div>

            <nav className="landing-nav">
                <div className="logo-group">
                    <Leaf className="logo-icon" size={32} />
                    <span className="logo-text">BIO-RISK AI</span>
                </div>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#technology">Technology</a>
                    <button className="nav-cta" onClick={() => navigate('/dashboard')}>Launch Platform</button>
                </div>
            </nav>

            <main className="landing-hero">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hero-content"
                >
                    <div className="hero-badge">Next-Gen Ecological Intelligence</div>
                    <h1>Predicting Biodiversity Risks <br /> <span>Before They Occur</span></h1>
                    <p>
                        Our AI-driven platform combines high-resolution satellite remote sensing with advanced
                        ecological reasoning to provide real-time monitoring and predictive alerts for global ecosystems.
                    </p>
                    <div className="hero-actions">
                        <button className="primary-cta" onClick={() => navigate('/dashboard')}>
                            Access Dashboard <ArrowRight size={20} />
                        </button>
                        <button className="secondary-cta">Watch Demo</button>
                    </div>
                </motion.div>
                {/* ... (rest of the file remains same) */}

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="hero-image-container"
                >
                    <div className="hero-image-mockup glass-panel">
                        <div className="mockup-header">
                            <div className="mockup-dot"></div>
                            <div className="mockup-dot"></div>
                            <div className="mockup-dot"></div>
                        </div>
                        <div className="mockup-content">
                            <Globe size={200} className="floating-globe" />
                            <div className="mockup-overlay">
                                <div className="overlay-stat">
                                    <label>Conservation Status</label>
                                    <span>CRITICAL</span>
                                </div>
                                <div className="overlay-stat">
                                    <label>AI Confidence</label>
                                    <span>94.2%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            <section id="features" className="landing-features">
                <div className="section-header">
                    <h2>Advanced Capabilities</h2>
                    <p>Industry-standard tools for conservationists, governments, and NGOs.</p>
                </div>

                <div className="features-grid">
                    {[
                        { icon: <Globe />, title: "Live Satellite Monitoring", desc: "Real-time tracking of forest coverage, NDVI, and biomass indices across the globe." },
                        { icon: <Shield />, title: "Early Warning System", desc: "Predictive alerts for fire risks, deforestation events, and illegal logging activities." },
                        { icon: <Zap />, title: "AI-Driven Forecasting", desc: "Neural network models projecting environmental risks 7 days into the future." },
                        { icon: <BarChart3 />, title: "Precision Analytics", desc: "In-depth trend analysis and GeoTIFF band inspection for multispectral data." },
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className="feature-card glass-panel"
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section id="technology" className="landing-tech">
                <div className="section-header">
                    <h2>The Technology Stack</h2>
                    <p>Fusing geospatial intelligence with neural reasoning.</p>
                </div>

                <div className="tech-container">
                    <div className="tech-stack-visual glass-panel">
                        <div className="stack-layer">
                            <span className="layer-tag">INTERFACE</span>
                            <h4>React & Framer Motion</h4>
                            <p>High-performance UI with real-time state synchronization.</p>
                        </div>
                        <div className="stack-layer">
                            <span className="layer-tag">API LAYER</span>
                            <h4>FastAPI Intelligence</h4>
                            <p>Asynchronous Python backend for sub-second risk calculations.</p>
                        </div>
                        <div className="stack-layer">
                            <span className="layer-tag">AI CORE</span>
                            <h4>Random Forest Logic</h4>
                            <p>Multi-parameter classification of spectral signatures.</p>
                        </div>
                        <div className="stack-layer">
                            <span className="layer-tag">DATA SOURCE</span>
                            <h4>Multispectral Satellite Pipes</h4>
                            <p>Direct integration with orbital remote sensing telemetry.</p>
                        </div>
                    </div>

                    <div className="tech-details">
                        <div className="detail-item">
                            <div className="detail-icon"><Cpu size={24} /></div>
                            <div className="detail-text">
                                <h4>Neural Risk Engine</h4>
                                <p>Our proprietary GAEA-ML engine reasons through NDVI, thermal, and land-use data to detect anomalies.</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-icon"><Globe size={24} /></div>
                            <div className="detail-text">
                                <h4>Geospatial Scaling</h4>
                                <p>Elastic grid systems allow analysis from local 30m resolution to regional continental monitoring.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="logo-group">
                        <Leaf className="logo-icon" size={24} />
                        <span className="logo-text">BIO-RISK AI</span>
                    </div>
                    <p>© 2026 Bio-Risk Intelligence Platform. Powered by DeepMind Ecological AI.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
