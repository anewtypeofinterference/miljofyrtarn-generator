'use client';

import { useCallback } from 'react';
import ColorSwatch from './ColorSwatch';

export default function Sidebar({
  format,
  setFormat,
  preset,
  setPreset,
  backgroundColor,
  setBackgroundColor,
  hullColor,
  setHullColor,
  items,
  addItem,
  updateItem,
  removeItem,
  availableFormats,
  backgroundColors,
  hullColors,
}) {
  // Modified to handle both "bilde" and "bakgrunnsbilde" types
  const handleFileChange = useCallback(
    (e, itemId) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const base64 = reader.result.toString();
            const item = items.find((i) => i.id === itemId);
            if (item && item.type === 'bakgrunnsbilde') {
              // For background image, store the raw base64 string.
              updateItem(itemId, base64);
            } else {
              // For normal images, include a default width (for resizing)
              const defaultWidth = 600; 
              updateItem(itemId, `${base64}|${defaultWidth}`);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [items, updateItem]
  );

  const handleRemoveImage = useCallback(
    (itemId) => {
      updateItem(itemId, '');
    },
    [updateItem]
  );

  const handleImageSizeChange = (itemId, newWidth) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const parts = item.value.split('|');
    const base64 = parts[0] || '';
    const updatedValue = `${base64}|${newWidth}`;
    updateItem(itemId, updatedValue);
  };

  const headingCount = items.filter((item) => item.type === 'overskrift').length;
  const textCount = items.filter((item) => item.type === 'tekst').length;
  const imageCount = items.filter((item) => item.type === 'bilde').length;
  const backgroundImageCount = items.filter((item) => item.type === 'bakgrunnsbilde').length;

  return (
    <div className="bg-white p-7 rounded-lg overflow-y-auto flex flex-col flex-1 gap-7">

      <div className="w-full">
        <label className="text-lg font-medium block mb-3">Velg format</label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="text-sm w-full py-2 px-3 bg-black/5 rounded-md hover:bg-black/10 transition-colors duration-200 cursor-pointer outline-none select-none"
        >
          {availableFormats.map((fmt) => (
            <option key={fmt} value={fmt}>
              {fmt}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full">
        <label className="text-lg font-medium block mb-3">Velg stil</label>
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
          className="text-sm w-full py-2 px-3 bg-black/5 rounded-md hover:bg-black/10 transition-colors duration-200 cursor-pointer outline-none select-none"
        >
          <option value="preset1">Stil 1</option>
          <option value="preset2">Stil 2</option>
          <option value="preset3">Stil 3</option>
        </select>
      </div>

      <div className="w-full">
        <h2 className="text-lg font-medium mb-3">Velg innhold</h2>
        {items.map((item) => (
          <div key={item.id} className="mb-2 bg-black/5 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <label className="font-medium">
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </label>
              <button
                className="text-xs bg-white py-0.5 px-1 rounded-md select-none hover:bg-white/50 transition-colors duration-200"
                onClick={() => removeItem(item.id)}
              >
                Fjern
              </button>
            </div>
            {item.type === 'overskrift' ? (
              <textarea
                value={item.value}
                rows={1}
                onChange={(e) => updateItem(item.id, e.target.value)}
                className="text-sm mt-4 w-full py-2 px-3 bg-white resize-none rounded-md outline-none"
                placeholder="En kort overskrift"
              />
            ) : item.type === 'tekst' ? (
              <textarea
                value={item.value}
                rows={3}
                onChange={(e) => updateItem(item.id, e.target.value)}
                className="text-sm mt-4 w-full py-2 px-3 bg-white resize-none rounded-md outline-none"
                placeholder="En lengre tekst"
              />
            ) : item.type === 'logo' ? (
              <div className="mt-3 text-black/50 text-xs w-4/5">
                Merk at logo kun vises når lyskjegle har hvit bakgrunnfarge.
              </div>
            ) : item.type === 'bakgrunnsbilde' ? (
              <div className="mt-4">
                {!item.value ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, item.id)}
                    className="file-input"
                  />
                ) : (
                  <div className="relative w-full">
                    <img
                      src={item.value}
                      alt="Bakgrunnsbilde"
                      className="w-full rounded-md object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(item.id)}
                      className="absolute top-2 right-2 text-xs bg-white py-0.5 px-1 rounded-md"
                    >
                      Fjern
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4">
                {!item.value ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, item.id)}
                    className="file-input"
                  />
                ) : (
                  <div className="mt-4">
                    {(() => {
                      const [base64Part] = item.value.split('|');
                      return (
                        <div className="relative w-fit">
                          <img
                            src={base64Part}
                            alt="thumbnail"
                            className="border rounded-md w-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveImage(item.id)}
                            className="absolute top-2 right-2 text-xs bg-white py-0.5 px-1 rounded-md select-none"
                          >
                            Fjern
                          </button>
                        </div>
                      );
                    })()}
                    <div className="mt-5 mb-2">
                      <label>Bildestørrelse</label>
                      <input
                        type="range"
                        min="50"
                        max="400"
                        value={parseInt(item.value.split('|')[1] || '250', 10)}
                        onChange={(e) => handleImageSizeChange(item.id, e.target.value)}
                        className="slider w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div className="mt-4 flex flex-wrap gap-2">
          {!items.some((item) => item.type === 'logo') && (
            <button
              onClick={() => addItem('logo')}
              disabled={hullColor !== '#FFFFFF'}
              className={
                `text-sm py-2 px-3 rounded-md transition-colors duration-200 ${
                  hullColor !== '#FFFFFF'
                    ? 'bg-black/5 text-black/30 cursor-not-allowed'
                    : 'bg-black/5 hover:bg-black/10'
                }`
              }
            >
              Logo
            </button>
          )}
          {headingCount < 3 && (
            <button onClick={() => addItem('overskrift')} className="text-sm py-2 px-3 bg-black/5 rounded-md hover:bg-black/10 transition-colors duration-200">
              Overskrift
            </button>
          )}
          {textCount < 1 && (
            <button onClick={() => addItem('tekst')} className="text-sm py-2 px-3 bg-black/5 rounded-md hover:bg-black/10 transition-colors duration-200">
              Tekst
            </button>
          )}
          {imageCount < 1 && (
            <button onClick={() => addItem('bilde')} className="text-sm py-2 px-3 bg-black/5 rounded-md hover:bg-black/10 transition-colors duration-200">
              Bilde
            </button>
          )}
          {backgroundImageCount < 1 && (
            <button onClick={() => addItem('bakgrunnsbilde')} className="text-sm py-2 px-3 bg-black/5 rounded-md hover:bg-black/10 transition-colors duration-200">
              Bakgrunnsbilde
            </button>
          )}
        </div>
      </div>

      <div className="w-full">
        <h2 className="text-lg font-medium mb-3">Velg farger</h2>
        <div className="mb-3">
          <label className="text-sm block mb-3">Lyskjegle</label>
          <div className="flex flex-wrap gap-1">
            {hullColors.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                isSelected={color === hullColor}
                onClick={() => setHullColor(color)}
              />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="text-sm block mb-3">Bakgrunn</label>
          <div className="flex flex-wrap gap-1">
            {backgroundColors.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                isSelected={color === backgroundColor}
                onClick={() => setBackgroundColor(color)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
