import React, { useRef } from 'react';
import { Plus, X, Upload } from 'lucide-react';

interface MultiImageInputProps {
  images: string[];
  onChange: (images: string[]) => void;
  onError: (msg: string) => void;
  maxImages?: number;
}

export default function MultiImageInput({ images, onChange, onError, maxImages = 6 }: MultiImageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const readers: Promise<string>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 4 * 1024 * 1024) { onError("Rasm 4MB dan katta!"); continue; }
      readers.push(new Promise(resolve => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.readAsDataURL(file);
      }));
    }
    Promise.all(readers).then(results => {
      onChange([...images, ...results].slice(0, maxImages));
    });
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {/* Thumbnails row */}
      <div className="flex flex-wrap gap-2">
        {images.map((src, idx) => (
          <div key={idx} className="relative group/thumb">
            <img
              src={src}
              referrerPolicy="no-referrer"
              alt=""
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = ''; }}
              className="h-16 w-20 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
            />
            {idx === 0 && (
              <span className="absolute bottom-0.5 left-0.5 text-[8px] font-black bg-amber-500 text-white px-1 rounded leading-tight">ASOSIY</span>
            )}
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-red-700"
            >
              <X className="h-2.5 w-2.5 stroke-[3]" />
            </button>
          </div>
        ))}

        {/* Add button */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-16 w-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-amber-500 gap-1"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[9px] font-bold">Rasm qo'sh</span>
          </button>
        )}
      </div>

      {/* Hidden multi-file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* URL paste field */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Yoki rasm URL manzilini yozing va Enter bosing"
          className="flex-1 p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 font-medium"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const val = (e.target as HTMLInputElement).value.trim();
              if (val && images.length < maxImages) {
                onChange([...images, val]);
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
        />
        <span className="text-[9px] text-zinc-400 font-bold shrink-0">Enter ↵</span>
      </div>

      {images.length === 0 && (
        <p className="text-[10px] text-zinc-400 text-center">Hali rasm qo'shilmagan</p>
      )}
    </div>
  );
}
