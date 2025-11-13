import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

const ImagePreview = ({ imageUrl, itemName }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  if (!imageUrl) return null;

  const handleMouseEnter = (e) => {
    setShowPreview(true);
    setImageError(false);
    updatePosition(e);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  const handleMouseMove = (e) => {
    updatePosition(e);
  };

  const updatePosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.right + 10;
    const y = rect.top;
    setPreviewPosition({ x, y });
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="flex-shrink-0 text-blue-500 hover:text-blue-600 transition-all duration-150"
        title="Preview image"
      >
        <ImageIcon size={14} className="sm:w-4 sm:h-4" />
      </button>

      {showPreview && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${previewPosition.x}px`,
            top: `${previewPosition.y}px`,
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-200 overflow-hidden">
            {!imageError ? (
              <img
                src={imageUrl}
                alt={itemName}
                className="max-w-lg max-h-96 object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-slate-100 text-slate-500">
                <div className="text-center p-4">
                  <X size={32} className="mx-auto mb-2 text-red-400" />
                  <p className="text-sm">Failed to load image</p>
                </div>
              </div>
            )}
            {!imageError && (
              <div className="p-3 bg-slate-50 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-700 truncate">{itemName}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
