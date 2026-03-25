import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import { Upload, Image, Wand2, Loader, Grid3X3, CheckCircle, Trash2, Download, X, RotateCcw } from 'lucide-react';

const categoryColors = {
  building: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', label: 'Building' },
  living_room: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', label: 'Living Room' },
  bedroom: { bg: 'rgba(139,92,246,0.1)', text: '#8b5cf6', label: 'Bedroom' },
  bathroom: { bg: 'rgba(236,72,153,0.1)', text: '#ec4899', label: 'Bathroom' },
  kitchen: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', label: 'Kitchen' },
  other: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', label: 'Other' },
};

const allCategories = ['living_room', 'bedroom', 'bathroom', 'kitchen', 'building', 'other'];

export default function ImageLab() {
  const toast = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watermark, setWatermark] = useState(true);
  const [upscale, setUpscale] = useState(true);
  const [results, setResults] = useState([]);
  const [processed, setProcessed] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      toast(`${newFiles.length} image(s) added`, 'success');
    }
  }, [toast]);

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      toast(`${newFiles.length} image(s) added`, 'success');
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = () => {
    setProcessing(true);
    setProgress(0);
    setProcessed(false);

    const total = files.length;
    let done = 0;

    const interval = setInterval(() => {
      done++;
      setProgress(Math.round((done / total) * 100));
      if (done >= total) {
        clearInterval(interval);
        // Generate mock results for each file
        const mockResults = files.map((file, i) => ({
          original_name: file.name,
          category: allCategories[i % allCategories.length],
          upscaled: upscale,
          watermarked: watermark,
          size_before: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
          size_after: `${((file.size / 1024 / 1024) * 1.5).toFixed(1)}MB`,
        }));
        setResults(mockResults);
        setProcessing(false);
        setProcessed(true);
        toast(`${total} images processed successfully!`, 'success');
      }
    }, 600);
  };

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setProcessed(false);
    setProgress(0);
  };

  const handleDownloadAll = () => {
    toast('Downloading all processed images...', 'info');
  };

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
          <Wand2 size={24} style={{ color: '#10b981' }} /> AI Image Lab
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Upscale, categorize, and watermark property images</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          {/* Upload Zone */}
          <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
            style={{
              border: `2px dashed ${dragActive ? '#10b981' : 'var(--border-color)'}`,
              borderRadius: '14px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
              background: dragActive ? 'rgba(16,185,129,0.05)' : 'var(--bg-card)',
              marginBottom: '16px', transition: 'all 0.3s',
            }}>
            <input id="file-input" type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(16,185,129,0.1)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={24} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Drop images here</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>or click to browse · JPG, PNG, WebP</div>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{files.length} images</span>
                <button onClick={() => setFiles([])} style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={12} /> Clear all
                </button>
              </div>
              {files.map((file, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Image size={14} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                  <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Options */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={watermark} onChange={e => setWatermark(e.target.checked)} style={{ accentColor: '#064E3B' }} /> Watermark
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={upscale} onChange={e => setUpscale(e.target.checked)} style={{ accentColor: '#064E3B' }} /> AI Upscale 2x
                </label>
              </div>

              {/* Process / Progress */}
              {processing ? (
                <div style={{ marginTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #064E3B, #10b981)', borderRadius: '3px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              ) : (
                <button onClick={handleProcess} disabled={files.length === 0}
                  style={{
                    width: '100%', marginTop: '14px', padding: '12px', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg, #064E3B, #065f46)', color: 'white',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                  <Wand2 size={16} /> Process with AI
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Results</h2>
            {processed && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleDownloadAll} style={{ fontSize: '12px', color: '#10b981', background: 'rgba(16,185,129,0.08)', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                  <Download size={12} /> Download All
                </button>
                <button onClick={handleReset} style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                  <RotateCcw size={12} /> Reset
                </button>
              </div>
            )}
          </div>

          {Object.keys(grouped).length > 0 ? (
            <>
              {Object.entries(grouped).map(([cat, items]) => {
                const c = categoryColors[cat] || categoryColors.other;
                return (
                  <div key={cat} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: c.bg, color: c.text }}>{c.label}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{items.length} image{items.length > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {items.map((r, i) => (
                        <div key={i} style={{
                          height: '90px', borderRadius: '10px', background: `linear-gradient(135deg, ${c.text}10, ${c.text}25)`,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        onClick={() => toast(`${r.original_name}: ${r.upscaled ? '2x upscaled' : 'original'}, ${r.watermarked ? 'watermarked' : 'no watermark'}`, 'info')}
                        >
                          <Image size={18} style={{ color: c.text, opacity: 0.4 }} />
                          <span style={{ fontSize: '10px', color: c.text, marginTop: '4px', opacity: 0.6, maxWidth: '90%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{r.original_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div style={{ padding: '14px', background: 'rgba(16,185,129,0.06)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>Complete</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{results.length}/{results.length} images · Mock Mode{upscale ? ' · 2x Upscaled' : ''}{watermark ? ' · Watermarked' : ''}</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Grid3X3 size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 12px' }} />
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Upload and process images to see results here</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.6 }}>Images will be categorized, upscaled, and watermarked</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
