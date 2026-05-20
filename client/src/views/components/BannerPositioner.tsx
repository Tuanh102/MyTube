import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Move, ZoomIn, ZoomOut } from 'lucide-react';

interface BannerPositionerProps {
  image: string;
  aspectRatio?: number;
  circular?: boolean;
}

export interface BannerPositionerRef {
  capture: () => Promise<Blob | null>;
}

const BannerPositioner = forwardRef<BannerPositionerRef, BannerPositionerProps>(
  ({ image, aspectRatio = 4 / 1, circular = false }, ref) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imgSize, setImgSize] = useState({ width: 0, height: 0, initialScale: 1 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Calculate initial scale to fill container (object-fit: cover equivalent)
    useEffect(() => {
      if (!image) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;
      img.onload = () => {
        if (!containerRef.current) return;
        const cont = containerRef.current.getBoundingClientRect();
        const scale = Math.max(cont.width / img.naturalWidth, cont.height / img.naturalHeight);
        setImgSize({
          width: img.naturalWidth,
          height: img.naturalHeight,
          initialScale: scale
        });
        // Center the image initially
        setPosition({
          x: (cont.width - img.naturalWidth * scale) / 2,
          y: (cont.height - img.naturalHeight * scale) / 2
        });
      };
    }, [image]);

    useImperativeHandle(ref, () => ({
      capture: async () => {
        if (!imgRef.current || !containerRef.current || !imgSize.width) return null;

        const canvas = document.createElement('canvas');
        const container = containerRef.current;
        const contRect = container.getBoundingClientRect();
        
        canvas.width = 2048;
        canvas.height = 2048 / aspectRatio;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const scaleToCanvas = canvas.width / contRect.width;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate drawing dimensions on canvas
        const drawScale = imgSize.initialScale * zoom * scaleToCanvas;
        const drawX = position.x * scaleToCanvas;
        const drawY = position.y * scaleToCanvas;
        const drawW = imgSize.width * drawScale;
        const drawH = imgSize.height * drawScale;

        ctx.drawImage(imgRef.current!, drawX, drawY, drawW, drawH);

        return new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
        });
      }
    }));

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleZoom = (delta: number) => {
      setZoom(prev => Math.max(1, Math.min(3, prev + delta)));
    };

    return (
      <div className="space-y-3 group/positioner">
        <div 
          ref={containerRef}
          className={`relative w-full overflow-hidden cursor-move border border-white/10 shadow-inner group bg-[#0a0a0a] ${
            circular ? 'aspect-square rounded-full' : 'aspect-[4/1] rounded-xl'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {image && (
            <img 
              ref={imgRef}
              src={image}
              crossOrigin="anonymous"
              alt="Preview"
              className="absolute max-w-none pointer-events-none select-none"
              style={{
                width: imgSize.width * imgSize.initialScale,
                height: imgSize.height * imgSize.initialScale,
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: 'top left',
              }}
            />
          )}
          
          <div className={`absolute inset-0 pointer-events-none border border-white/20 grid grid-cols-3 grid-rows-3 opacity-0 group-hover:opacity-100 transition-opacity ${
            circular ? 'rounded-full' : ''
          }`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border-[0.5px] border-white/10 border-dashed" />
            ))}
          </div>

          {/* Circle mask for avatar */}
          {circular && (
            <div className="absolute inset-0 pointer-events-none ring-[100px] ring-black/40 rounded-full" />
          )}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity">
            <Move className="text-white" size={circular ? 24 : 32} />
          </div>
        </div>

        {/* Mini Controls - Only show on hover of the whole component */}
        <div className="flex items-center justify-between gap-4 px-1 opacity-0 group-hover/positioner:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/positioner:translate-y-0">
          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-lg border border-white/5">
            <button type="button" onClick={() => handleZoom(-0.1)} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition">
              <ZoomOut size={16} />
            </button>
            <input 
              type="range" 
              min="1" 
              max="3" 
              step="0.01" 
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-24 accent-red-600 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <button type="button" onClick={() => handleZoom(0.1)} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition">
              <ZoomIn size={16} />
            </button>
          </div>
          <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest flex items-center gap-1">
            <Move size={10} /> Kéo để căn chỉnh
          </p>
        </div>
      </div>
    );
  }
);

BannerPositioner.displayName = 'BannerPositioner';
export default BannerPositioner;
