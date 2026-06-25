import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSliderProps {
  images: string[];
  alt: string;
  className?: string;
  fallback?: string;
}

export default function ImageSlider({ images, alt, className = 'w-full h-full object-cover', fallback }: ImageSliderProps) {
  const [idx, setIdx] = useState(0);
  const imgs = images.length > 0 ? images : [fallback || ''];
  const fb = fallback || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="relative w-full h-full group/slider overflow-hidden">
      <img
        src={imgs[idx]}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = fb; }}
        className={className}
      />
      {imgs.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/55 hover:bg-black/75 text-white rounded-full p-0.5 opacity-0 group-hover/slider:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/55 hover:bg-black/75 text-white rounded-full p-0.5 opacity-0 group-hover/slider:opacity-100 transition-opacity z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {imgs.map((_, di) => (
              <button
                key={di}
                onClick={(e) => { e.stopPropagation(); setIdx(di); }}
                className={`rounded-full transition-all ${di === idx ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
