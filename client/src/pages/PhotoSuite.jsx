import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, RotateCw, FlipHorizontal, Sparkles, Download, Save, RefreshCw, Maximize2, ZoomIn, Droplets, Sun, Contrast, Palette } from 'lucide-react';
import { API_BASE } from '../config/api';

export const PhotoSuite = ({ projectToLoad, clearLoadedProject }) => {
  const { token } = useAuth();
  
  // Project state
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState('Untitled Photo');
  const [imageSrc, setImageSrc] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // Canvas Refs
  const originalCanvasRef = useRef(null);
  const editedCanvasRef = useRef(null);
  const renderVersionRef = useRef(0);
  const objectUrlRef = useRef(null);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  // Basic Adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  // Advanced Color Controls
  const [hueRotate, setHueRotate] = useState(0);       // 0–360
  const [temperature, setTemperature] = useState(0);    // -50 to 50 (warm/cool shift)
  const [exposure, setExposure] = useState(0);          // -50 to 50 (highlights/shadows)
  const [gamma, setGamma] = useState(100);              // 50–200 (midtone correction)
  const [highlights, setHighlights] = useState(0);      // -50 to 50
  const [shadows, setShadows] = useState(0);            // -50 to 50
  
  // Effects & Filters
  const [blur, setBlur] = useState(0);                  // 0–20px
  const [sharpen, setSharpen] = useState(0);             // 0–100
  const [noise, setNoise] = useState(0);                 // 0–100
  const [vignette, setVignette] = useState(0);           // 0–100
  const [grain, setGrain] = useState(0);                 // 0–100
  
  // Color Filters (Presets)
  const [activeFilter, setActiveFilter] = useState('none'); // none, grayscale, sepia, invert, warm, cool, vintage, dramatic, fade
  
  // Transform
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  // Resizing States
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [aspectRatio, setAspectRatio] = useState('free');
  const [lockRatio, setLockRatio] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState({ w: 800, h: 600 });

  // Active editor panel
  const [activePanel, setActivePanel] = useState('adjust'); // adjust, effects, filters, transform, resize

  // Load project if passed from Dashboard
  useEffect(() => {
    if (projectToLoad) {
      setProjectId(projectToLoad._id);
      setProjectName(projectToLoad.name);
      const url = projectToLoad.originalUrl.startsWith('/uploads/') 
        ? `${API_BASE}${projectToLoad.originalUrl}` 
        : projectToLoad.originalUrl;
      setOriginalFile(null);
      setIsLoadingPhoto(true);
      loadImage(url, projectToLoad.filters);
      
      if (projectToLoad.filters) {
        const f = projectToLoad.filters;
        if (f.brightness !== undefined) setBrightness(f.brightness);
        if (f.contrast !== undefined) setContrast(f.contrast);
        if (f.saturation !== undefined) setSaturation(f.saturation);
        if (f.rotation !== undefined) setRotation(f.rotation);
        if (f.flipH !== undefined) setFlipH(f.flipH);
        if (f.flipV !== undefined) setFlipV(f.flipV);
        if (f.width !== undefined) setWidth(f.width);
        if (f.height !== undefined) setHeight(f.height);
        if (f.hueRotate !== undefined) setHueRotate(f.hueRotate);
        if (f.temperature !== undefined) setTemperature(f.temperature);
        if (f.exposure !== undefined) setExposure(f.exposure);
        if (f.blur !== undefined) setBlur(f.blur);
        if (f.sharpen !== undefined) setSharpen(f.sharpen);
        if (f.noise !== undefined) setNoise(f.noise);
        if (f.vignette !== undefined) setVignette(f.vignette);
        if (f.grain !== undefined) setGrain(f.grain);
        if (f.activeFilter !== undefined) setActiveFilter(f.activeFilter);
        if (f.gamma !== undefined) setGamma(f.gamma);
        if (f.highlights !== undefined) setHighlights(f.highlights);
        if (f.shadows !== undefined) setShadows(f.shadows);
      }
      clearLoadedProject();
    }
  }, [projectToLoad]);

  // Load Image helper
  const loadImage = (src, savedFilters = null) => {
    const img = new Image();
    if (!src.startsWith('blob:') && !src.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      setWidth(savedFilters?.width || naturalWidth);
      setHeight(savedFilters?.height || naturalHeight);
      setOriginalDimensions({ w: naturalWidth, h: naturalHeight });

      const sourceScale = Math.min(1, Math.sqrt(8_000_000 / (naturalWidth * naturalHeight)), 12_000 / Math.max(naturalWidth, naturalHeight));
      if (sourceScale < 1) {
        const scale = sourceScale;
        const optimizedCanvas = document.createElement('canvas');
        optimizedCanvas.width = Math.max(1, Math.round(naturalWidth * scale));
        optimizedCanvas.height = Math.max(1, Math.round(naturalHeight * scale));
        const optimizedContext = optimizedCanvas.getContext('2d');
        if (optimizedContext) {
          optimizedContext.fillStyle = '#fff';
          optimizedContext.fillRect(0, 0, optimizedCanvas.width, optimizedCanvas.height);
          optimizedContext.imageSmoothingEnabled = true;
          optimizedContext.imageSmoothingQuality = 'high';
          optimizedContext.drawImage(img, 0, 0, optimizedCanvas.width, optimizedCanvas.height);
          optimizedCanvas.toBlob((blob) => {
            if (!blob) {
              setOriginalImage(img);
              setImageSrc(src);
              setIsLoadingPhoto(false);
              return;
            }
            const optimizedUrl = URL.createObjectURL(blob);
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = optimizedUrl;
            const optimizedImage = new Image();
            optimizedImage.onload = () => {
              setOriginalImage(optimizedImage);
              setImageSrc(optimizedUrl);
              setPhotoError('');
              setIsLoadingPhoto(false);
            };
            optimizedImage.onerror = () => {
              setPhotoError('This image could not be optimized for editing.');
              setIsLoadingPhoto(false);
            };
            optimizedImage.src = optimizedUrl;
          }, 'image/jpeg', 0.96);
          return;
        }
      }
      setOriginalImage(img);
      setImageSrc(src);
      setPhotoError('');
      setIsLoadingPhoto(false);
    };
    img.onerror = () => {
      setPhotoError('This image could not be opened. Try a JPG, PNG, or WEBP photo.');
      setIsLoadingPhoto(false);
    };
    img.src = src;
  };

  // Image Drag & Drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) acceptPhoto(file);
  };

  const acceptPhoto = (file) => {
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      setPhotoError('Choose a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('This image is larger than 10 MB. Choose a smaller file to continue.');
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setProjectId(null);
    setOriginalFile(file);
    setOriginalImage(null);
    setImageSrc(null);
    setIsRendering(false);
    setIsLoadingPhoto(true);
    setProjectName(file.name.replace(/\.[^.]+$/, '') || 'Untitled Photo');
    loadImage(objectUrlRef.current);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) acceptPhoto(file);
    e.target.value = '';
  };

  // Lock Aspect Ratio Handler
  const handleWidthChange = (val) => {
    const newW = parseInt(val) || 0;
    setWidth(newW);
    if (lockRatio && originalDimensions.w > 0) {
      const ratio = originalDimensions.w / originalDimensions.h;
      setHeight(Math.round(newW / ratio));
    }
  };

  const handleHeightChange = (val) => {
    const newH = parseInt(val) || 0;
    setHeight(newH);
    if (lockRatio && originalDimensions.h > 0) {
      const ratio = originalDimensions.w / originalDimensions.h;
      setWidth(Math.round(newH * ratio));
    }
  };

  const applyAspectRatioPreset = (preset) => {
    setAspectRatio(preset);
    if (preset === '1:1') {
      const side = Math.min(width, height);
      setWidth(side);
      setHeight(side);
      setLockRatio(true);
    } else if (preset === '16:9') {
      const newH = Math.round((width * 9) / 16);
      setHeight(newH);
      setLockRatio(true);
    } else if (preset === '4:3') {
      const newH = Math.round((width * 3) / 4);
      setHeight(newH);
      setLockRatio(true);
    } else if (preset === '9:16') {
      const newW = Math.round((height * 9) / 16);
      setWidth(newW);
      setLockRatio(true);
    } else {
      setLockRatio(false);
    }
  };

  // Draw a capped live preview and process pixels off the main thread so large
  // (up to 10 MB) uploads stay responsive while sliders are adjusted.
  useEffect(() => {
    if (!originalImage) return undefined;

    const originalCanvas = originalCanvasRef.current;
    const editedCanvas = editedCanvasRef.current;
    if (!originalCanvas || !editedCanvas) return undefined;

    setIsRendering(true);
    let worker;
    const timer = window.setTimeout(() => {
      const scale = Math.min(1, Math.sqrt(8_000_000 / Math.max(1, width * height)), 12_000 / Math.max(width, height, 1));
      const sourceW = Math.max(1, Math.round(width * scale));
      const sourceH = Math.max(1, Math.round(height * scale));
      const isSwapped = rotation === 90 || rotation === 270;
      const outputW = isSwapped ? sourceH : sourceW;
      const outputH = isSwapped ? sourceW : sourceH;

      originalCanvas.width = Math.max(1, Math.round(originalDimensions.w * scale));
      originalCanvas.height = Math.max(1, Math.round(originalDimensions.h * scale));
      originalCanvas.getContext('2d')?.drawImage(originalImage, 0, 0, originalCanvas.width, originalCanvas.height);

      editedCanvas.width = outputW;
      editedCanvas.height = outputH;
      const context = editedCanvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        setPhotoError('Your browser could not start the image editor. Try a current version of Chrome, Edge, Firefox, or Safari.');
        setIsRendering(false);
        return;
      }
      context.clearRect(0, 0, outputW, outputH);
      context.filter = blur > 0 ? `blur(${blur * scale}px)` : 'none';
      context.save();
      context.translate(outputW / 2, outputH / 2);
      context.rotate((rotation * Math.PI) / 180);
      context.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      context.drawImage(originalImage, -sourceW / 2, -sourceH / 2, sourceW, sourceH);
      context.restore();
      context.filter = 'none';

      try {
        const pixels = context.getImageData(0, 0, outputW, outputH);
        const id = ++renderVersionRef.current;
        worker = new Worker(new URL('./photoEnhance.worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = ({ data }) => {
          if (data.id !== renderVersionRef.current) return;
          context.putImageData(new ImageData(new Uint8ClampedArray(data.buffer), data.width, data.height), 0, 0);
          if (vignette > 0) {
            const strength = vignette / 100;
            const radius = Math.max(outputW, outputH) * (1.2 - strength * 0.4);
            const gradient = context.createRadialGradient(outputW / 2, outputH / 2, radius * 0.3, outputW / 2, outputH / 2, radius);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(0.7, `rgba(0,0,0,${strength * 0.3})`);
            gradient.addColorStop(1, `rgba(0,0,0,${strength * 0.8})`);
            context.fillStyle = gradient;
            context.fillRect(0, 0, outputW, outputH);
          }
          setPhotoError('');
          setIsRendering(false);
          worker.terminate();
        };
        worker.onerror = () => {
          setPhotoError('The photo could not be processed. Try resetting the adjustments or using a smaller image.');
          setIsRendering(false);
          worker?.terminate();
        };
        worker.postMessage({
          id,
          buffer: pixels.data.buffer,
          width: outputW,
          height: outputH,
          settings: { brightness, contrast, saturation, hueRotate, temperature, exposure, gamma, highlights, shadows, sharpen, noise, grain, activeFilter }
        }, [pixels.data.buffer]);
      } catch (error) {
        console.error('Photo processing failed:', error);
        setPhotoError('This image is too large for the available browser memory. Try a smaller image.');
        setIsRendering(false);
      }
    }, 70);

    return () => {
      window.clearTimeout(timer);
      worker?.terminate();
    };
  }, [originalImage, brightness, contrast, saturation, rotation, flipH, flipV, width, height,
      originalDimensions, hueRotate, temperature, exposure, gamma, highlights, shadows,
      blur, sharpen, noise, vignette, grain, activeFilter]);
  // Auto-Enhance Presets
  const enhancePresets = [
    { label: '✨ Auto Enhance', fn: () => { setBrightness(103); setContrast(106); setSaturation(108); setExposure(2); setHighlights(-8); setShadows(8); setSharpen(10); setVignette(0); setNoise(0); setGrain(0); setActiveFilter('none'); } },
    { label: '🎬 Cinematic', fn: () => { setBrightness(95); setContrast(125); setSaturation(85); setTemperature(-8); setVignette(45); setGamma(110); setShadows(-15); } },
    { label: '🌅 Golden Hour', fn: () => { setBrightness(105); setContrast(105); setSaturation(130); setTemperature(25); setExposure(8); setHighlights(15); setActiveFilter('warm'); } },
    { label: '🖤 B&W Film', fn: () => { setActiveFilter('grayscale'); setContrast(130); setBrightness(102); setGrain(25); setVignette(30); } },
    { label: '📸 Vintage', fn: () => { setActiveFilter('vintage'); setSaturation(80); setContrast(108); setGrain(15); setVignette(25); setGamma(95); } },
    { label: '💎 HDR Pop', fn: () => { setBrightness(103); setContrast(118); setSaturation(115); setHighlights(-10); setShadows(15); setSharpen(20); setNoise(0); setGrain(0); setActiveFilter('none'); } },
  ];

  const handleDownload = () => {
    const editCanvas = editedCanvasRef.current;
    if (!editCanvas) return;
    editCanvas.toBlob((blob) => {
      if (!blob) {
        setPhotoError('The edited image could not be exported. Try reducing its dimensions.');
        return;
      }
      const link = document.createElement('a');
      const safeName = (projectName || 'photo').replace(/[^a-z0-9-_]+/gi, '-');
      link.download = `${safeName}-edited.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }, 'image/png');
  };

  const handleSaveProject = async () => {
    const editCanvas = editedCanvasRef.current;
    if (!editCanvas) return;

    setSaveStatus('saving');
    try {
      const createEditedBlob = (quality) => new Promise((resolve, reject) => {
        editCanvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Unable to export edited image')), 'image/jpeg', quality);
      });
      let editedBlob = await createEditedBlob(0.92);
      if (editedBlob.size > 10 * 1024 * 1024) editedBlob = await createEditedBlob(0.82);
      if (editedBlob.size > 10 * 1024 * 1024) throw new Error('This edit is still larger than 10 MB. Reduce the output dimensions and save again.');
      let savedProjectId = projectId;

      if (!savedProjectId) {
        if (!originalFile) throw new Error('Upload an image before saving this project.');
        const originalForm = new FormData();
        originalForm.append('photo', originalFile, originalFile.name);
        originalForm.append('name', projectName);
        originalForm.append('width', String(originalDimensions.w));
        originalForm.append('height', String(originalDimensions.h));
        const createResponse = await fetch(`${API_BASE}/api/photos/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: originalForm
        });
        const created = await createResponse.json();
        if (!createResponse.ok) throw new Error(created.message || 'Could not upload the original photo.');
        savedProjectId = created._id;
        setProjectId(savedProjectId);
      }

      const editedForm = new FormData();
      editedForm.append('editedPhoto', editedBlob, 'edited-photo.jpg');
      editedForm.append('name', projectName);
      editedForm.append('width', String(editCanvas.width));
      editedForm.append('height', String(editCanvas.height));
      editedForm.append('filters', JSON.stringify({ brightness, contrast, saturation, rotation, flipH, flipV,
        hueRotate, temperature, exposure, gamma, highlights, shadows, blur, sharpen, noise, vignette, grain, activeFilter }));
      const saveResponse = await fetch(`${API_BASE}/api/photos/${savedProjectId}/edited`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: editedForm
      });
      const saved = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(saved.message || 'Could not save the edited photo.');
      setSaveStatus('success');
      setPhotoError('');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('');
      setPhotoError(error.message || 'Could not save the edited photo. Please try again.');
    }
  };

  const handleReset = () => {
    setBrightness(100); setContrast(100); setSaturation(100);
    setHueRotate(0); setTemperature(0); setExposure(0);
    setGamma(100); setHighlights(0); setShadows(0);
    setBlur(0); setSharpen(0); setNoise(0);
    setVignette(0); setGrain(0); setActiveFilter('none');
    setRotation(0); setFlipH(false); setFlipV(false);
    if (originalImage) {
      setWidth(originalDimensions.w);
      setHeight(originalDimensions.h);
    }
  };

  // Reusable slider component
  const Slider = ({ label, value, onChange, min, max, unit = '', color = 'emerald' }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full accent-${color}-500 h-1 bg-slate-900 rounded-lg cursor-pointer`}
      />
    </div>
  );

  const filterPresets = [
    { id: 'none', label: 'Original', color: 'bg-white/10' },
    { id: 'grayscale', label: 'B&W', color: 'bg-gray-500/20' },
    { id: 'sepia', label: 'Sepia', color: 'bg-amber-500/20' },
    { id: 'warm', label: 'Warm', color: 'bg-orange-500/20' },
    { id: 'cool', label: 'Cool', color: 'bg-blue-500/20' },
    { id: 'vintage', label: 'Vintage', color: 'bg-yellow-700/20' },
    { id: 'dramatic', label: 'Dramatic', color: 'bg-red-500/20' },
    { id: 'fade', label: 'Fade', color: 'bg-purple-500/20' },
    { id: 'invert', label: 'Invert', color: 'bg-pink-500/20' },
  ];

  return (
    <div className="workspace-page space-y-6 animate-float-in">
      
      {/* Photo Suite Top Bar */}
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Creative studio / image editing</p>
          <h1 className="page-title">
            <span className="page-title-icon" aria-hidden="true">🎨</span> Photo Suite
          </h1>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="page-project-name bg-transparent border-b border-white/10 hover:border-emerald-400 focus:border-emerald-500 text-sm text-gray-300 focus:outline-none py-1 transition-colors font-medium"
            placeholder="Name your artwork"
          />
        </div>

        {imageSrc && (
          <div className="page-header-actions">
            <button
              onClick={enhancePresets[0].fn}
              className="px-4 py-2 bg-[#6C63FF] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Sparkles size={14} />
              <span>Auto enhance</span>
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Reset All</span>
            </button>
            <button
              onClick={handleSaveProject}
              disabled={saveStatus === 'saving' || isRendering}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              {saveStatus === 'saving' ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : <Save size={14} />}
              <span>{saveStatus === 'success' ? 'Saved!' : 'Save Project'}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isRendering}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-[#0d1d19] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Download size={14} />
              <span>Download PNG</span>
            </button>
          </div>
        )}
      </div>

      {photoError && (
        <div role="alert" className="photo-feedback" aria-live="polite">
          <span>{photoError}</span>
          <button type="button" onClick={() => setPhotoError('')} aria-label="Dismiss message">×</button>
        </div>
      )}

      {imageSrc && (
        <div className="photo-specs" role="status">
          <span>{originalDimensions.w.toLocaleString()} × {originalDimensions.h.toLocaleString()} px source</span>
          {originalFile && <span>{Math.round(originalFile.size / 1024)} KB upload</span>}
          <span>{isRendering ? 'Updating preview…' : 'Optimized preview and export · up to 8 MP'}</span>
        </div>
      )}

      {/* Editor Body Grid */}
      {!imageSrc ? (
        /* DRAG AND DROP ZONE */
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="photo-upload-card min-h-[420px] rounded-[32px] border-2 border-dashed border-emerald-800/40 bg-emerald-950/10 backdrop-blur-md flex flex-col items-center justify-center p-6 sm:p-10 text-center group hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px]" />
          
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
            <Upload size={36} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 relative z-10 font-sans">
            {isLoadingPhoto ? 'Preparing your photo…' : 'Upload your high-res photography'}
          </h3>
          <p className="text-gray-400 text-sm font-light max-w-sm mb-8 leading-relaxed relative z-10">
            Drag a photo here or choose it from your device. JPG, PNG, and WEBP are supported up to 10 MB per image.
          </p>
          
          <label className="px-6 py-3 bg-[#3d685a] hover:bg-[#1e3f35] text-white font-semibold rounded-2xl transition-all shadow-md cursor-pointer relative z-10">
            Browse Storage
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
          </label>
        </div>
      ) : (
        /* MAIN CANVAS WORKSPACE & CONTROLS */
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
          
          {/* Controls Side Panel */}
          <div className="photo-controls order-2 2xl:col-span-4 2xl:col-start-9 2xl:row-start-1 space-y-4">
            
            {/* Panel Tabs */}
            <div className="glass-card rounded-2xl p-1.5 flex flex-wrap gap-1">
              {[
                { id: 'adjust', label: '🎚️ Adjust' },
                { id: 'effects', label: '✨ Effects' },
                { id: 'filters', label: '🎨 Filters' },
                { id: 'transform', label: '🔄 Transform' },
                { id: 'resize', label: '📐 Resize' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                    activePanel === tab.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ============ ADJUST PANEL ============ */}
            {activePanel === 'adjust' && (
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 font-sans flex items-center gap-1.5">
                  <Sun size={14} /> Light & Color
                </h3>
                <Slider label="Brightness" value={brightness} onChange={setBrightness} min={0} max={200} unit="%" />
                <Slider label="Contrast" value={contrast} onChange={setContrast} min={0} max={200} unit="%" />
                <Slider label="Saturation" value={saturation} onChange={setSaturation} min={0} max={200} unit="%" />
                <Slider label="Exposure" value={exposure} onChange={setExposure} min={-50} max={50} />
                <Slider label="Highlights" value={highlights} onChange={setHighlights} min={-50} max={50} />
                <Slider label="Shadows" value={shadows} onChange={setShadows} min={-50} max={50} />
                <Slider label="Temperature" value={temperature} onChange={setTemperature} min={-50} max={50} />
                <Slider label="Gamma" value={gamma} onChange={setGamma} min={50} max={200} unit="%" />
                <Slider label="Hue Rotate" value={hueRotate} onChange={setHueRotate} min={0} max={360} unit="°" />
              </div>
            )}

            {/* ============ EFFECTS PANEL ============ */}
            {activePanel === 'effects' && (
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 font-sans flex items-center gap-1.5">
                  <Droplets size={14} /> Effects & Textures
                </h3>
                <Slider label="Blur" value={blur} onChange={setBlur} min={0} max={20} unit="px" />
                <Slider label="Sharpen" value={sharpen} onChange={setSharpen} min={0} max={100} unit="%" />
                <Slider label="Vignette" value={vignette} onChange={setVignette} min={0} max={100} unit="%" />
                <Slider label="Film Noise" value={noise} onChange={setNoise} min={0} max={100} unit="%" />
                <Slider label="Film Grain" value={grain} onChange={setGrain} min={0} max={100} unit="%" />

                {/* Quick Enhance Presets */}
                <div className="border-t border-white/5 pt-4 space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Presets</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {enhancePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => { handleReset(); setTimeout(preset.fn, 50); }}
                        className="py-2.5 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 rounded-xl text-[10px] font-bold text-gray-300 hover:text-emerald-300 transition-all cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============ FILTERS PANEL ============ */}
            {activePanel === 'filters' && (
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 font-sans flex items-center gap-1.5">
                  <Palette size={14} /> Color Filters
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {filterPresets.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`py-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        activeFilter === f.id
                          ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300'
                          : `${f.color} border border-white/5 text-gray-400 hover:text-white`
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${f.color} border border-white/10`} />
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ============ TRANSFORM PANEL ============ */}
            {activePanel === 'transform' && (
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 font-sans">
                  🔄 Transform Layout
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-gray-300 hover:text-white"
                  >
                    <RotateCw size={16} />
                    <span className="text-[10px] font-semibold">Rotate 90°</span>
                  </button>

                  <button
                    onClick={() => setRotation(prev => (prev + 270) % 360)}
                    className="py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-gray-300 hover:text-white"
                  >
                    <RotateCw size={16} className="scale-x-[-1]" />
                    <span className="text-[10px] font-semibold">Rotate -90°</span>
                  </button>

                  <button
                    onClick={() => setFlipH(!flipH)}
                    className={`py-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      flipH 
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <FlipHorizontal size={16} />
                    <span className="text-[10px] font-semibold">Flip H</span>
                  </button>

                  <button
                    onClick={() => setFlipV(!flipV)}
                    className={`py-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      flipV 
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <FlipHorizontal size={16} className="rotate-90" />
                    <span className="text-[10px] font-semibold">Flip V</span>
                  </button>
                </div>

                <div className="text-xs text-gray-500 text-center pt-2">
                  Current: {rotation}° {flipH ? '| H-Flip' : ''} {flipV ? '| V-Flip' : ''}
                </div>
              </div>
            )}

            {/* ============ RESIZE PANEL ============ */}
            {activePanel === 'resize' && (
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 font-sans">
                  📐 Scale & Resizing
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Width (px)</label>
                    <input
                      type="number" value={width}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Height (px)</label>
                    <input
                      type="number" value={height}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                  <input
                    type="checkbox" checked={lockRatio}
                    onChange={(e) => setLockRatio(e.target.checked)}
                    className="rounded border-white/10 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs text-gray-400 font-medium">Lock Aspect Ratio</span>
                </label>

                <div>
                  <label className="block text-[10px] text-gray-500 font-semibold mb-2 uppercase">Presets</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['free', '1:1', '16:9', '4:3', '9:16'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => applyAspectRatioPreset(preset)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          aspectRatio === preset
                            ? 'bg-emerald-500 text-forest-950'
                            : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center pt-2 border-t border-white/5">
                  Output: {width} × {height} px
                </div>
              </div>
            )}

          </div>

          {/* Side-by-Side Live Previews Area */}
          <div className="photo-preview-workspace order-1 2xl:col-span-8 2xl:col-start-1 2xl:row-start-1 space-y-6">
            
            {/* Canvases layout container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Original Canvas */}
              <div className="glass-card rounded-3xl p-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-xs mb-3">
                <span className="font-semibold text-gray-400 uppercase tracking-wider">Original preview</span>
                  <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white rounded font-medium">Source</span>
                </div>
                <div className="photo-preview-stage w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/5 flex items-center justify-center p-2">
                  <canvas 
                    ref={originalCanvasRef} 
                    className="max-w-full max-h-full object-contain shadow-md rounded-lg" 
                  />
                </div>
              </div>

              {/* Box 2: Edited Canvas */}
              <div className="glass-card rounded-3xl p-4 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-emerald-500/5 blur-[60px]" />
                
                <div className="w-full flex items-center justify-between text-xs mb-3 relative z-10">
                <span className="font-semibold text-emerald-400 uppercase tracking-wider">Enhanced preview</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-bold">Processed</span>
                </div>
                <div className="photo-preview-stage w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/5 flex items-center justify-center p-2 relative z-10">
                  <canvas 
                    ref={editedCanvasRef} 
                    className="max-w-full max-h-full object-contain shadow-lg rounded-lg border border-emerald-500/20" 
                  />
                </div>
              </div>

            </div>

            {/* Quick Upload Another Trigger */}
            <div className="flex items-center justify-center py-2">
              <label className="text-xs text-gray-400 hover:text-emerald-400 font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
                <Upload size={14} />
                <span>Upload a different photograph</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default PhotoSuite;
