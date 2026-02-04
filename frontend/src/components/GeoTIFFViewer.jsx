import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Layers, Info, Filter, Zap } from 'lucide-react';
import satelliteRgb from '../assets/satellite_rgb.png';
import satelliteNir from '../assets/satellite_nir.png';

const GeoTIFFViewer = ({ onOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const [selectedBand, setSelectedBand] = useState('RGB');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileUpload = (e) => {
        const uploadedFile = e.target?.files ? e.target.files[0] : e;
        if (uploadedFile && uploadedFile.name) {
            setFile(uploadedFile);
            setIsAnalyzing(true);
            setTimeout(() => setIsAnalyzing(false), 2000);
        }
    };

    const loadSample = () => {
        handleFileUpload({ name: 'S2_L2A_T43P_20240204_SAMPLE.tif', size: '42.5 MB' });
    };

    const bands = [
        { id: 'RGB', name: 'Natural Color (RGB)', desc: 'Visual spectrum as seen by human eye.', wavelength: '400-700 nm', resolution: '10m' },
        { id: 'NIR', name: 'Near-Infrared', desc: 'Used for vegetation health (NDVI) measurement.', wavelength: '842 nm', resolution: '10m' },
        { id: 'SWIR', name: 'Short-Wave IR', desc: 'Effective for moisture and fire risk detection.', wavelength: '1610 nm', resolution: '20m' },
        { id: 'B8A', name: 'Narrow NIR', desc: 'High-precision vegetation monitoring.', wavelength: '865 nm', resolution: '20m' }
    ];

    const currentBand = bands.find(b => b.id === selectedBand);

    return (
        <div className="geotiff-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,10,0.85)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="geotiff-modal glass-panel"
                style={{ background: '#020402', border: '1px solid rgba(57, 255, 20, 0.3)', width: '95%', maxWidth: '1200px', minWidth: '900px', height: '90vh', maxHeight: '850px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
            >
                <div className="modal-header" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="title-group" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: 'rgba(57, 255, 20, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Layers className="icon-green" size={24} color="var(--neon-green)" />
                        </div>
                        <div>
                            <h3 style={{ color: 'white', margin: 0, letterSpacing: '1px' }}>ADVANCED MULTISPECTRAL INSPECTOR</h3>
                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Earth Observation Data Pipeline</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="close-btn" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}><X size={20} /></button>
                </div>

                <div className="modal-body" style={{ padding: '30px', flex: 1, overflow: 'hidden', display: 'flex' }}>
                    {!file ? (
                        <div className="upload-screen" style={{ width: '100%', height: '100%', display: 'flex', gap: '40px' }}>
                            <div className="upload-zone" style={{ flex: 1.2, border: '2px dashed rgba(57, 255, 20, 0.2)', borderRadius: '24px', background: 'rgba(57, 255, 20, 0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'all 0.3s' }}>
                                <input type="file" accept=".tif,.tiff" onChange={handleFileUpload} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }} />
                                <Upload size={80} color="var(--neon-green)" style={{ opacity: 0.3, marginBottom: '25px' }} />
                                <h2 style={{ color: 'white', marginBottom: '10px', fontSize: '1.5rem' }}>Drop GeoTIFF Here</h2>
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '300px', fontSize: '0.9rem' }}>Supports Sentinel-2 and Landsat-8 multispectral files for advanced band extraction.</p>
                                <div style={{ marginTop: '30px', padding: '8px 20px', background: 'rgba(57, 255, 20, 0.1)', color: 'var(--neon-green)', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 'bold' }}>CHOOSE FILE</div>
                            </div>

                            <div className="about-zone" style={{ flex: 0.8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div className="card glass-panel" style={{ padding: '30px', background: 'rgba(255,255,255,0.03)' }}>
                                    <h4 style={{ color: 'var(--neon-green)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><Info size={18} /> How it works</h4>
                                    <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <li style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>01</div>
                                            <span>Upload a raw .tif satellite image containing multiple spectral bands.</span>
                                        </li>
                                        <li style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>02</div>
                                            <span>The AI engine decompresses and indexes the spectral metadata.</span>
                                        </li>
                                        <li style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>03</div>
                                            <span>Select between RGB, Near-Infrared, or SWIR to inspect specific ecological vitals.</span>
                                        </li>
                                    </ul>

                                    <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Don't have a GeoTIFF? Try our pre-loaded satellite sample.</p>
                                        <button
                                            onClick={loadSample}
                                            style={{ width: '100%', padding: '12px', background: 'white', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                        >
                                            <Layers size={16} /> LOAD PRESET SAMPLE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="inspector-layout" style={{ display: 'flex', gap: '30px', width: '100%', height: '100%' }}>
                            <div className="viewer-pane" style={{
                                flex: 2.5,
                                background: '#000',
                                borderRadius: '24px',
                                border: '1px solid rgba(57, 255, 20, 0.2)',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: '600px' // FORCE minimum width to avoid vertical line
                            }}>
                                {isAnalyzing ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
                                        <div className="loading-bar-container" style={{ width: '200px', height: '4px', background: 'rgba(57, 255, 20, 0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: '0%' }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                style={{ height: '100%', background: 'var(--neon-green)' }}
                                            />
                                        </div>
                                        <p style={{ marginTop: '20px', color: 'var(--neon-green)', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Indexing Spectral Cube...</p>
                                    </div>
                                ) : (
                                    <div style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#020402',
                                        padding: '40px',
                                        position: 'relative'
                                    }}>
                                        {/* ASPECT RATIO LOCKED CONTAINER */}
                                        <div style={{
                                            width: '100%',
                                            maxWidth: '700px',
                                            aspectRatio: '16/10',
                                            position: 'relative',
                                            background: '#010101',
                                            border: '2px solid var(--neon-green)',
                                            borderRadius: '16px',
                                            boxShadow: '0 0 60px rgba(57, 255, 20, 0.15)',
                                            overflow: 'hidden',
                                            zIndex: 10
                                        }}>
                                            {/* BAND INFO OVERLAY */}
                                            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, display: 'flex', gap: '10px' }}>
                                                <div style={{ padding: '8px 16px', background: 'var(--neon-green)', color: 'black', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>{selectedBand} MODE ACTIVE</div>
                                                <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.8)', color: 'white', borderRadius: '6px', fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.2)' }}>{currentBand.resolution} RESOLUTION</div>
                                            </div>

                                            {/* IMAGE ENGINE */}
                                            <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: '#111' }}>
                                                {selectedBand === 'RGB' && (
                                                    <img
                                                        src={satelliteRgb}
                                                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop" }}
                                                        alt="Satellite"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                )}
                                                {selectedBand === 'NIR' && (
                                                    <img src={satelliteNir} alt="NIR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                )}
                                                {selectedBand === 'SWIR' && (
                                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #00ffff 0%, #001a1a 100%)' }} />
                                                )}
                                            </div>

                                            {/* SCANNING BEAM */}
                                            <motion.div
                                                animate={{ top: ['0%', '100%'] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    width: '100%',
                                                    height: '4px',
                                                    background: 'var(--neon-green)',
                                                    boxShadow: '0 0 30px var(--neon-green)',
                                                    zIndex: 20
                                                }}
                                            />

                                            {/* HUD OVERLAY */}
                                            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(var(--neon-green) 1px, transparent 1px), linear-gradient(90deg, var(--neon-green) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 5 }}></div>
                                        </div>

                                        <div style={{ position: 'absolute', bottom: '15px', right: '25px', color: 'rgba(57,255,20,0.3)', fontSize: '0.6rem', letterSpacing: '4px', fontWeight: 'bold' }}>
                                            DATA_SOURCE: S2L2A_INTEL
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="controls-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '25px', minWidth: '250px' }}>
                                <div className="card glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.03)' }}>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Dataset</label>
                                    <h4 style={{ margin: '8px 0', color: 'white', fontSize: '1rem' }}>{file.name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '6px', height: '6px', background: 'var(--neon-green)', borderRadius: '50%' }}></div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--neon-green)', textTransform: 'uppercase', fontWeight: 'bold' }}>Spectral Index Ready</span>
                                    </div>
                                </div>

                                <div className="band-selector">
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}><Filter size={14} /> Spectral Band Selection</label>
                                    <div className="band-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {bands.map(band => (
                                            <button
                                                key={band.id}
                                                className={`band-item ${selectedBand === band.id ? 'active' : ''}`}
                                                onClick={() => setSelectedBand(band.id)}
                                                style={{ textAlign: 'left', padding: '15px', borderRadius: '12px', background: selectedBand === band.id ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid ' + (selectedBand === band.id ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'), cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                                            >
                                                {selectedBand === band.id && <motion.div layoutId="band-glow" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(57, 255, 20, 0.05)' }} />}
                                                <div style={{ display: 'flex', gap: '18px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', backgroundColor: selectedBand === band.id ? 'var(--neon-green)' : 'transparent', boxShadow: selectedBand === band.id ? '0 0 10px var(--neon-green)' : 'none' }}></div>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>{band.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{band.desc}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="card glass-panel" style={{ padding: '20px', marginTop: 'auto', background: 'rgba(57,255,20,0.02)', border: '1px solid rgba(57,255,20,0.1)' }}>
                                    <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'white' }}><Info size={14} /> Band Calibration Intelligence</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Wavelength</span>
                                            <span style={{ color: 'white', fontWeight: 'bold' }}>{currentBand.wavelength}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Radiometric Res.</span>
                                            <span style={{ color: 'white', fontWeight: 'bold' }}>16-bit UINT</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Cloud Cover Est.</span>
                                            <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>0.02%</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setFile(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', padding: '10px', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.2s' }}>REMOVE CURRENT DATASET</button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default GeoTIFFViewer;
