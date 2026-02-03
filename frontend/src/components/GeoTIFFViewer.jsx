import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Layers, Info, Filter } from 'lucide-react';

const GeoTIFFViewer = ({ onOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const [selectedBand, setSelectedBand] = useState('RGB');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            setIsAnalyzing(true);
            setTimeout(() => setIsAnalyzing(false), 2000);
        }
    };

    const bands = [
        { id: 'RGB', name: 'Natural Color (RGB)', desc: 'Visual spectrum as seen by human eye.', wavelength: '400-700 nm', resolution: '10m' },
        { id: 'NIR', name: 'Near-Infrared', desc: 'Used for vegetation health (NDVI) measurement.', wavelength: '842 nm', resolution: '10m' },
        { id: 'SWIR', name: 'Short-Wave IR', desc: 'Effective for moisture and fire risk detection.', wavelength: '1610 nm', resolution: '20m' },
        { id: 'B8A', name: 'Narrow NIR', desc: 'High-precision vegetation monitoring.', wavelength: '865 nm', resolution: '20m' }
    ];

    const currentBand = bands.find(b => b.id === selectedBand);

    return (
        <div className="geotiff-overlay">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="geotiff-modal glass-panel"
                style={{ background: 'var(--bg-darker)', border: '1px solid var(--neon-green)', width: '100%', maxWidth: '1000px', height: '700px', display: 'flex', flexDirection: 'column' }}
            >
                <div className="modal-header" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                    <div className="title-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Layers className="icon-green" size={20} color="var(--neon-green)" />
                        <h3 style={{ color: 'white', margin: 0 }}>Advanced Multispectral Inspector</h3>
                    </div>
                    <button onClick={onClose} className="close-btn" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ padding: '20px', flex: 1, overflow: 'hidden' }}>
                    {!file ? (
                        <div className="upload-zone" style={{ border: '2px dashed var(--glass-border)', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <input type="file" accept=".tif,.tiff" onChange={handleFileUpload} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                            <Upload size={64} color="var(--neon-green)" style={{ opacity: 0.5, marginBottom: '20px' }} />
                            <h2 style={{ color: 'white', marginBottom: '10px' }}>Upload GeoTIFF for Analysis</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Sentinel-2 / Landsat-8 Multispectral Data (.tif)</p>
                        </div>
                    ) : (
                        <div className="inspector-layout" style={{ display: 'flex', gap: '20px', height: '100%' }}>
                            <div className="viewer-pane" style={{ flex: 1.5, background: '#000', borderRadius: '12px', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                {isAnalyzing ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div className="pulse-circle" style={{ width: '40px', height: '40px', background: 'var(--neon-green)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                                        <p style={{ marginTop: '20px', color: 'var(--neon-green)', fontWeight: 'bold' }}>Decompressing Tiffs & Extracting Spectral Metadata...</p>
                                    </div>
                                ) : (
                                    <div className={`raster-preview band-${selectedBand.toLowerCase()}`} style={{ flex: 1, position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10, display: 'flex', gap: '10px' }}>
                                            <span style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.8)', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--neon-green)', border: '1px solid var(--neon-green)' }}>BAND: {selectedBand}</span>
                                            <span style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.8)', borderRadius: '4px', fontSize: '0.7rem', color: 'white' }}>RES: {currentBand.resolution}</span>
                                        </div>
                                        <div className="simulated-raster" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div className="raster-texture" style={{ width: '80%', height: '80%', border: '1px solid var(--glass-border)' }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="controls-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="card glass-panel" style={{ padding: '15px' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Selected Dataset</label>
                                    <h4 style={{ margin: '5px 0', color: 'white' }}>{file.name}</h4>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--neon-green)' }}>Status: Spectral Data Indexed</span>
                                </div>

                                <div className="band-selector">
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', display: 'block' }}><Filter size={14} /> Available Spectral Bands</label>
                                    <div className="band-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {bands.map(band => (
                                            <button
                                                key={band.id}
                                                className={`band-item ${selectedBand === band.id ? 'active' : ''}`}
                                                onClick={() => setSelectedBand(band.id)}
                                                style={{ textAlign: 'left', padding: '12px', borderRadius: '10px', background: selectedBand === band.id ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid ' + (selectedBand === band.id ? 'var(--neon-green)' : 'var(--glass-border)'), cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white', background: selectedBand === band.id ? 'var(--neon-green)' : 'transparent' }}></div>
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{band.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{band.desc}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="card glass-panel" style={{ padding: '15px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'white' }}><Info size={14} /> Band Calibration Info</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Central Wavelength</span>
                                        <span style={{ color: 'white' }}>{currentBand.wavelength}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Scaling Factor</span>
                                        <span style={{ color: 'white' }}>0.0001</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Bit Depth</span>
                                        <span style={{ color: 'white' }}>16-bit UINT</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default GeoTIFFViewer;
