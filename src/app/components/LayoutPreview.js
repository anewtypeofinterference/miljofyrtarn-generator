'use client';

import React, { useLayoutEffect, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { polygonHull } from 'd3-polygon';
import ClipperLib from 'clipper-lib';
import { debounce } from 'lodash';

export default function LayoutPreview({
  format,
  backgroundColor,
  hullColor,
  items,
  preset,
  onUpdateDimensions,
  onUpdateItems,
}) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const itemRefs = useRef({});
  const [hullPath, setHullPath] = useState('');

  const [zoom, setZoom] = useState(1);

  const MARGIN = 20;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(0.1, z - 0.1));

  useEffect(() => {
    if (!onUpdateItems) return;
    
    if (hullColor !== '#FFFFFF') {
      const updated = items.filter(item => item.type !== 'logo');
      if (updated.length !== items.length) {
        onUpdateItems(updated); // triggers removal from parent
      }
    }
  }, [hullColor, items, onUpdateItems]);  

  // --------------
  // Presets and filtered items
  // --------------
  const presets = {
    default: {},
    preset1: {
      '50x70cm': {
        width: 500,
        height: 700,
        overskrift1: { x: 136, y: 175, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 200, y: 260, fontSize: '18px' },
        bilde: { x: 20, y: 450, maxWidth: '285px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      A4: {
        width: 595,
        height: 842,
        overskrift1: { x: 231, y: 175, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 295, y: 260, fontSize: '18px' },
        bilde: { x: 20, y: 525, maxWidth: '385px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1080x1080': {
        width: 540,
        height: 540,
        overskrift1: { x: 176, y: 115, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 240, y: 190, fontSize: '18px' },
        bilde: { x: 20, y: 330, maxWidth: '225px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1080x1920': {
        width: 540,
        height: 960,
        overskrift1: { x: 176, y: 200, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 240, y: 285, fontSize: '18px' },
        bilde: { x: 20, y: 665, maxWidth: '350px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1080x1350': {
        width: 540,
        height: 675,
        overskrift1: { x: 176, y: 160, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 240, y: 245, fontSize: '18px' },
        bilde: { x: 20, y: 410, maxWidth: '300px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1920x1080': {
        width: 960,
        height: 540,
        overskrift1: { x: 596, y: 110, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 660, y: 205, fontSize: '18px' },
        bilde: { x: 20, y: 215, maxWidth: '400px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
    },
    preset2: {
      '50x70cm': {
        width: 500,
        height: 700,
        overskrift1: { x: 20, y: 20, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 565, fontSize: '18px' },
        bilde: { x: 96, y: 175, maxWidth: '345px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      A4: {
        width: 595,
        height: 842,
        overskrift1: { x: 20, y: 20, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 705, fontSize: '18px' },
        bilde: { x: 190, y: 215, maxWidth: '345px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1080x1080': {
        width: 540,
        height: 540,
        overskrift1: { x: 20, y: 20, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 405, fontSize: '18px' },
        bilde: { x: 205, y: 170, maxWidth: '275px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1080x1920': {
        width: 540,
        height: 960,
        overskrift1: { x: 20, y: 20, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 820, fontSize: '18px' },
        bilde: { x: 130, y: 225, maxWidth: '350px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1080x1350': {
        width: 540,
        height: 675,
        overskrift1: { x: 20, y: 20, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 530, fontSize: '18px' },
        bilde: { x: 130, y: 210, maxWidth: '350px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1920x1080': {
        width: 960,
        height: 540,
        overskrift1: { x: 20, y: 20, fontSize: '48px' },
        overskrift2: { x: 20, y: 250, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 405, fontSize: '18px' },
        bilde: { x: 555, y: 140, maxWidth: '345px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
    },
    preset3: {
      '50x70cm': {
        width: 500,
        height: 700,
        overskrift1: { x: 140, y: 150, fontSize: '48px' },
        overskrift2: { x: 270, y: 275, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 400, fontSize: '18px' },
        bilde: { x: 20, y: 450, maxWidth: '250px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      A4: {
        width: 595,
        height: 842,
        overskrift1: { x: 140, y: 150, fontSize: '48px' },
        overskrift2: { x: 350, y: 325, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 450, fontSize: '18px' },
        bilde: { x: 20, y: 450, maxWidth: '250px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1080x1080': {
        width: 540,
        height: 540,
        overskrift1: { x: 140, y: 100, fontSize: '48px' },
        overskrift2: { x: 290, y: 210, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 300, fontSize: '18px' },
        bilde: { x: 20, y: 450, maxWidth: '250px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1080x1920': {
        width: 540,
        height: 960,
        overskrift1: { x: 140, y: 300, fontSize: '48px' },
        overskrift2: { x: 290, y: 410, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 500, fontSize: '18px' },
        bilde: { x: 20, y: 450, maxWidth: '250px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1080x1350': {
        width: 540,
        height: 675,
        overskrift1: { x: 140, y: 150, fontSize: '48px' },
        overskrift2: { x: 290, y: 260, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 350, fontSize: '18px' },
        bilde: { x: 20, y: 450, maxWidth: '250px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
      '1920x1080': {
        width: 960,
        height: 540,
        overskrift1: { x: 380, y: 100, fontSize: '48px' },
        overskrift2: { x: 700, y: 210, fontSize: '48px' },
        overskrift3: { x: 20, y: 300, fontSize: '48px' },
        tekst: { x: 20, y: 300, fontSize: '18px' },
        bilde: { x: 20, y: 450, maxWidth: '250px', maxHeight: '250px' },
        logo: { x: 20, y: 20, width: '88px' },
      },
    },
  };

  // Exclude any background image items from the filtered items to be rendered as overlays
  const filteredItems = items
    .filter((item) => item.type !== 'bakgrunnsbilde')
    .map((item, index) => {
      if (item.type === 'overskrift') {
        const typeIndex = items.filter((el) => el.type === 'overskrift').indexOf(item);
        return { ...item, presetStyles: (presets[preset]?.[format]?.[`overskrift${typeIndex + 1}`]) || { x: 0, y: 0, fontSize: '16px' } };
      }
      return { ...item, presetStyles: (presets[preset]?.[format]?.[item.type]) || { x: 0, y: 0, fontSize: '16px' } };
    });

  // -------------------------------
  // Hull logic (unchanged)
  // -------------------------------
  function getRoundedHullPath(hullPoints, offsetPx = 6) {
    if (!hullPoints || hullPoints.length < 3) return '';
    const polygon = hullPoints.map(([x, y]) => ({ X: x, Y: y }));
    const scale = 100;
    const scaledPolygon = polygon.map((pt) => ({
      X: Math.round(pt.X * scale),
      Y: Math.round(pt.Y * scale),
    }));

    const co = new ClipperLib.ClipperOffset(2, 0.1);
    co.AddPath(scaledPolygon, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);

    const offsetScaled = Math.round(offsetPx * scale);
    const solution = [];
    co.Execute(solution, offsetScaled);

    if (solution.length === 0 || solution[0].length === 0) return '';
    const outPoly = solution[0];
    const finalPoints = outPoly.map((pt) => [pt.X / scale, pt.Y / scale]);

    let d = `M${finalPoints[0][0]},${finalPoints[0][1]}`;
    for (let i = 1; i < finalPoints.length; i++) {
      d += ` L${finalPoints[i][0]},${finalPoints[i][1]}`;
    }
    d += 'Z';
    return d;
  }

  const recalculateHull = useCallback(() => {
    const allCorners = [];
    if (!innerRef.current) {
      setHullPath('');
      return;
    }

    const innerRect = innerRef.current.getBoundingClientRect();

    items.forEach((item) => {
      const ref = itemRefs.current[item.id];
      if (ref?.current) {
        const rect = ref.current.getBoundingClientRect();
        const x = (rect.left - innerRect.left) / zoom;
        const y = (rect.top - innerRect.top) / zoom;
        const w = rect.width / zoom;
        const h = rect.height / zoom;

        allCorners.push(
          [x, y],
          [x + w, y],
          [x + w, y + h],
          [x, y + h]
        );
      }
    });

    if (allCorners.length >= 3) {
      const hullPoints = polygonHull(allCorners);
      if (hullPoints) {
        setHullPath(getRoundedHullPath(hullPoints, 16));
      } else {
        setHullPath('');
      }
    } else {
      setHullPath('');
    }
  }, [items, zoom]);

  const debouncedRecalculateHull = useCallback(debounce(recalculateHull, 10), [
    recalculateHull,
  ]);

  useLayoutEffect(() => {
    recalculateHull();
  }, [items, recalculateHull]);

  items.forEach((item) => {
    if (!itemRefs.current[item.id]) {
      itemRefs.current[item.id] = React.createRef();
    }
  });

  useLayoutEffect(() => {
    if (onUpdateDimensions) {
      const { width, height } =
        presets[preset]?.[format] || { width: 500, height: 700 };
      onUpdateDimensions({ width, height });
    }
    recalculateHull();
  }, [preset, format, onUpdateDimensions, recalculateHull]);

  const { width, height } =
    presets[preset]?.[format] || { width: 500, height: 700 };

  // Find background image item (if any)
  const bgImageItem = items.find(item => item.type === 'bakgrunnsbilde' && item.value);

  // Drag behavior (unchanged)
  const applyDragBehavior = useCallback(() => {
    filteredItems.forEach((item) => {
      const ref = d3.select(itemRefs.current[item.id].current);
      ref.call(
        d3
          .drag()
          .on('start', () => {
            ref.raise().classed('dragging', true);
          })
          .on('drag', (event) => {
            const dx = event.dx;
            const dy = event.dy;

            const element = ref.node();
            const parent = innerRef.current;

            const currentLeft = parseFloat(ref.style('left'));
            const currentTop = parseFloat(ref.style('top'));

            const elementWidth = element.offsetWidth;
            const elementHeight = element.offsetHeight;
            const parentWidth = parent.offsetWidth;
            const parentHeight = parent.offsetHeight;

            let newLeft = currentLeft + dx;
            let newTop = currentTop + dy;

            newLeft = Math.max(MARGIN, Math.min(newLeft, parentWidth - elementWidth - MARGIN));
            newTop = Math.max(MARGIN, Math.min(newTop, parentHeight - elementHeight - MARGIN));

            ref.style('left', `${newLeft}px`);
            ref.style('top', `${newTop}px`);

            recalculateHull();
          })
          .on('end', () => {
            ref.classed('dragging', false);

            const updatedX = parseFloat(ref.style('left'));
            const updatedY = parseFloat(ref.style('top'));

            const updatedItems = items.map((i) => {
              if (i.id === item.id) {
                return {
                  ...i,
                  presetStyles: { ...i.presetStyles, x: updatedX, y: updatedY },
                };
              }
              return i;
            });
            if (onUpdateItems) {
              onUpdateItems(updatedItems);
            }
          })
      );
    });
  }, [filteredItems, items, onUpdateItems, recalculateHull]);

  useLayoutEffect(() => {
    applyDragBehavior();
  }, [filteredItems, applyDragBehavior]);

  const handleResize = (itemId, event, direction) => {
    const ref = itemRefs.current[itemId]?.current;
    if (ref) {
      const parent = innerRef.current.getBoundingClientRect();
      const itemRect = ref.getBoundingClientRect();

      let newWidth = itemRect.width;
      let newHeight = itemRect.height;

      const dx = event.movementX;
      const dy = event.movementY;

      if (direction.includes('right')) {
        const currentX = itemRect.left - parent.left;
        const maxAvailableWidth = parent.width - currentX;
        newWidth = Math.min(
          itemRect.width + dx,
          maxAvailableWidth
        );
      }
      if (direction.includes('bottom')) {
        const currentY = itemRect.top - parent.top;
        const maxAvailableHeight = parent.height - currentY;
        newHeight = Math.min(
          itemRect.height + dy,
          maxAvailableHeight
        );
      }

      const updatedItems = items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            presetStyles: {
              ...item.presetStyles,
              maxWidth: `${newWidth}px`,
              maxHeight: `${newHeight}px`,
            },
          };
        }
        return item;
      });
      if (onUpdateItems) {
        onUpdateItems(updatedItems);
      }
      debouncedRecalculateHull();
    }
    clampImageInsideLayout(itemId);
  };

  const clampImageInsideLayout = useCallback((itemId) => {
    const ref = itemRefs.current[itemId]?.current;
    if (!ref || !innerRef.current) return;

    const parentRect = innerRef.current.getBoundingClientRect();
    const itemRect = ref.getBoundingClientRect();

    let newLeft = parseFloat(ref.style.left) || 0;
    let newTop = parseFloat(ref.style.top) || 0;

    // Calculate overflow: right edge should not exceed parentWidth - MARGIN
    const maxRight = parentRect.width - MARGIN;
    const overflowRight = (newLeft + itemRect.width) - maxRight;
    if (overflowRight > 0) {
      newLeft = Math.max(MARGIN, newLeft - overflowRight);
    }
    
    const maxBottom = parentRect.height - MARGIN;
    const overflowBottom = (newTop + itemRect.height) - maxBottom;
    if (overflowBottom > 0) {
      newTop = Math.max(MARGIN, newTop - overflowBottom);
    }

    newLeft = Math.max(MARGIN, newLeft);
    newTop = Math.max(MARGIN, newTop);

    ref.style.left = `${newLeft}px`;
    ref.style.top = `${newTop}px`;

    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          presetStyles: { ...item.presetStyles, x: newLeft, y: newTop },
        };
      }
      return item;
    });
    if (onUpdateItems) onUpdateItems(updatedItems);
  }, [items, onUpdateItems]);

  function clampImageWidth(item, x, innerWidth, userChosenWidthStr) {
    const userChosenWidth = parseInt(userChosenWidthStr, 10) || 0;
    const maxAvailable = (innerWidth - MARGIN) - x;
    if (maxAvailable < 0) return "0px"; 
    const clamped = Math.min(userChosenWidth, maxAvailable);
    return clamped + "px";
  }

  // Track image sizes to detect when they change (not positions)
  const imageSizes = useMemo(() => {
    return items
      .filter(item => item.type === 'bilde' && item.value)
      .map(item => `${item.id}:${item.value}`)
      .join('|');
  }, [items]);

  // Clamp images when their size changes via slider
  useLayoutEffect(() => {
    // Only run if imageSizes actually exists
    if (!imageSizes) return;
    
    const imageItems = items.filter(item => item.type === 'bilde' && item.value);
    imageItems.forEach(item => {
      const ref = itemRefs.current[item.id]?.current;
      if (ref && innerRef.current) {
        // Use requestAnimationFrame to ensure DOM has been updated with new image width
        requestAnimationFrame(() => {
          clampImageInsideLayout(item.id);
        });
      }
    });
    // Deliberately omitting items from dependency array - we only want to run when imageSizes changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSizes, clampImageInsideLayout]);

  return (
    <div>
      <div className="absolute bottom-0 right-0 flex flex-col items-center gap-2 bg-white p-5 rounded-lg select-none">
        <button onClick={handleZoomIn} className="w-9 h-9 bg-black/5 rounded-md hover:bg-black/10 transition-colors duration-200">+</button>
        <div className="font-medium flex items-center justify-center w-9 h-12 select-none">
          <span>{(zoom * 100).toFixed(0)}%</span>
        </div>
        <button onClick={handleZoomOut} className="w-9 h-9 bg-black/5 rounded-md hover:bg-black/10 transition-colors duration-200 select-none">–</button>
      </div>
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          ref={outerRef}
          id="layout-preview"
          style={{
            position: 'relative',
            width,
            height,
            backgroundColor,
            padding: MARGIN,
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          {/* Render background image from items (if available) */}
          {bgImageItem && (
            <img
              src={bgImageItem.value}
              alt="Background"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          )}
          <div
            ref={innerRef}
            style={{
              position: 'relative',
              width: width - 2 * MARGIN,
              height: height - 2 * MARGIN,
            }}
          >
            {filteredItems.map((item) => {
              const { x, y, fontSize } = item.presetStyles;
              let presetImageWidth = item.presetStyles.maxWidth || '250px';
              let dynamicWidth = presetImageWidth;
              let dynamicHeight = 'auto';

              if (item.type === 'bilde' && item.value && item.value.includes('|')) {
                const splitted = item.value.split('|');
                const w = splitted[1]; 
                dynamicWidth = `${w}px`;
              }
              const innerWidth = width - 2 * MARGIN;
              const maxWidth = (innerWidth - MARGIN) - x;

              return (
                <div
                  key={item.id}
                  ref={itemRefs.current[item.id]}
                  className="select-none hover:after:visible after:invisible after:content-[''] after:rounded-lg after:absolute after:-top-[6px] after:-left-[6px] after:w-[calc(100%+12px)] after:h-[calc(100%+12px)] after:bg-black/10"
                  style={{
                    position: 'absolute',
                    top: y,
                    left: x,
                    maxWidth: `${maxWidth}px`,
                    cursor: 'grab',
                    zIndex: 3,
                  }}
                >
                  {item.type === 'overskrift' && (
                    <div
                      className="overskrift"
                      style={{
                        margin: 0,
                        fontSize,
                        fontFamily: '"MatterSemibold", sans-serif',
                        lineHeight: '1.1',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        maxWidth: '350px',
                      }}
                    >
                      {item.value}
                    </div>
                  )}
                  {item.type === 'tekst' && (
                    <div
                      className="tekst"
                      style={{
                        margin: 0,
                        fontSize,
                        fontFamily: '"MatterMedium", sans-serif',
                        lineHeight: '1.4',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        maxWidth: '240px',
                      }}
                    >
                      {item.value}
                    </div>
                  )}
                  {item.type === 'bilde' && item.value && (
                    <img
                      src={
                        item.value.includes('|')
                          ? item.value.split('|')[0]
                          : item.value
                      }
                      alt=""
                      onLoad={() => {
                        debouncedRecalculateHull();
                        clampImageInsideLayout(item.id);
                      }}
                      style={{
                        width: clampImageWidth(item, x, width - 2 * MARGIN, dynamicWidth),
                        borderRadius: '8px',
                        cursor: 'grab',
                      }}
                    />
                  )}
                  {item.type === 'logo' && hullColor === '#FFFFFF' && (
                    <svg style={{ width: item.presetStyles.width, cursor: 'grab', }} viewBox="0 0 94 82" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M90.6905 67.1905C90.4365 67.0443 90.2356 66.8448 90.0925 66.5896C89.9471 66.3344 89.8755 66.0467 89.8755 65.7265C89.8755 65.4063 89.9471 65.121 90.0925 64.8681C90.238 64.6152 90.4365 64.4156 90.6905 64.2672C90.9444 64.1187 91.2307 64.0444 91.5493 64.0444C91.8679 64.0444 92.1519 64.1187 92.4035 64.2672C92.6552 64.4156 92.8537 64.6152 93.0015 64.8681C93.1492 65.121 93.2231 65.4063 93.2231 65.7265C93.2231 66.0467 93.1492 66.3344 93.0015 66.5896C92.8537 66.8448 92.6529 67.0467 92.3989 67.1905C92.1449 67.3367 91.861 67.4086 91.5493 67.4086C91.2376 67.4086 90.9444 67.3367 90.6905 67.1905ZM92.2396 66.9167C92.4451 66.7984 92.6044 66.6337 92.7198 66.4249C92.8352 66.216 92.893 65.9794 92.893 65.7195C92.893 65.4597 92.8352 65.2393 92.7198 65.0305C92.6044 64.8217 92.4428 64.6569 92.235 64.5386C92.0272 64.4203 91.7986 64.36 91.5493 64.36C91.3 64.36 91.0645 64.4203 90.859 64.5386C90.6535 64.6569 90.4942 64.8217 90.3788 65.0305C90.2633 65.2393 90.2056 65.4713 90.2056 65.7265C90.2056 65.9817 90.2633 66.2137 90.3788 66.4225C90.4942 66.6314 90.6558 66.7961 90.8636 66.9144C91.0714 67.0327 91.3 67.0931 91.5493 67.0931C91.7986 67.0931 92.0341 67.0327 92.2396 66.9144V66.9167ZM90.9513 64.8472H91.6278C91.7963 64.8472 91.9279 64.8959 92.0226 64.991C92.1172 65.0862 92.1657 65.2138 92.1657 65.3692C92.1657 65.469 92.1403 65.5571 92.0918 65.6383C92.0434 65.7195 91.9741 65.7776 91.8887 65.8124L92.3735 66.6058H91.9926L91.5585 65.882H91.2722V66.6058H90.9513V64.8449V64.8472ZM91.7709 65.5409C91.8194 65.4968 91.8448 65.4411 91.8448 65.3715C91.8448 65.295 91.8194 65.237 91.7709 65.1929C91.7224 65.1488 91.6555 65.1279 91.5747 65.1279H91.2722V65.6082H91.5747C91.6555 65.6082 91.7201 65.5873 91.7709 65.5432V65.5409Z" fill="#002969"/>
                      <path d="M84.6791 78.4757V69.5965H86.908V70.7593C87.0601 70.5361 87.2707 70.3247 87.5398 70.125C87.8206 69.9254 88.1482 69.7668 88.5226 69.6494C88.9087 69.5202 89.33 69.4556 89.7863 69.4556C90.4181 69.4556 90.9797 69.5906 91.4711 69.8608C91.9625 70.1192 92.3486 70.495 92.6295 70.9883C92.922 71.4698 93.0682 72.063 93.0682 72.7677V78.4757H90.8393V73.2433C90.8393 72.8557 90.7691 72.5269 90.6287 72.2568C90.4883 71.9866 90.2894 71.7811 90.032 71.6401C89.7746 71.4875 89.4762 71.4111 89.1369 71.4111C88.6689 71.4111 88.2652 71.5403 87.9259 71.7987C87.5983 72.0453 87.3468 72.4094 87.1713 72.891C86.9957 73.3608 86.908 73.9363 86.908 74.6175V78.4757H84.6791Z" fill="#002969"/>
                      <path d="M77.6691 78.4757V69.5965H79.898V70.7945C80.0618 70.5126 80.2725 70.2718 80.5299 70.0722C80.7873 69.8608 81.0798 69.7081 81.4074 69.6141C81.7467 69.5084 82.1035 69.4556 82.478 69.4556C82.6652 69.4556 82.8582 69.4732 83.0571 69.5084C83.256 69.5319 83.4257 69.573 83.5661 69.6317L83.4081 71.7458C83.2443 71.6636 83.063 71.6108 82.8641 71.5873C82.6769 71.5638 82.4838 71.5521 82.2849 71.5521C81.969 71.5521 81.6648 71.6225 81.3723 71.7635C81.0915 71.9044 80.8341 72.1158 80.6001 72.3977C80.3778 72.6796 80.2022 73.0495 80.0735 73.5076C79.9565 73.9539 79.898 74.4883 79.898 75.1108V78.4757H77.6691Z" fill="#002969"/>
                      <path d="M71.065 78.6167C70.4449 78.6167 69.9067 78.5052 69.4504 78.282C68.9941 78.0471 68.6372 77.73 68.3798 77.3306C68.1341 76.9313 68.0112 76.4909 68.0112 76.0093C68.0112 75.1285 68.3154 74.4531 68.9239 73.9833C69.544 73.5018 70.5268 73.1905 71.8723 73.0496L73.7678 72.8558V74.459L71.9601 74.688C71.5506 74.735 71.2113 74.8113 70.9422 74.917C70.6848 75.011 70.4917 75.1402 70.363 75.3046C70.246 75.4691 70.1875 75.6746 70.1875 75.9212C70.1875 76.2384 70.3045 76.4909 70.5385 76.6788C70.7842 76.855 71.106 76.9431 71.5038 76.9431C71.925 76.9431 72.2936 76.8374 72.6095 76.6259C72.9254 76.4145 73.1652 76.1327 73.329 75.7803C73.5045 75.428 73.5923 75.0404 73.5923 74.6175V72.6796C73.5923 72.3625 73.5221 72.0982 73.3817 71.8868C73.2413 71.6637 73.0482 71.4934 72.8025 71.3759C72.5568 71.2467 72.2643 71.1821 71.925 71.1821C71.6091 71.1821 71.3283 71.235 71.0826 71.3407C70.8369 71.4464 70.638 71.6108 70.4859 71.834C70.3337 72.0571 70.2401 72.339 70.205 72.6796L68.0814 72.3625C68.1867 71.7753 68.4149 71.2643 68.7659 70.8298C69.1286 70.3952 69.5791 70.0605 70.1173 69.8256C70.6672 69.5789 71.2698 69.4556 71.925 69.4556C72.6855 69.4556 73.3583 69.5907 73.9433 69.8608C74.5283 70.131 74.9846 70.5303 75.3122 71.0588C75.6398 71.5756 75.8036 72.2157 75.8036 72.9791V78.4758H73.5923V77.3483C73.4636 77.5832 73.2705 77.8005 73.0131 78.0001C72.7674 78.188 72.4749 78.3407 72.1356 78.4582C71.7963 78.5639 71.4394 78.6167 71.065 78.6167ZM71.925 68.9271C71.3283 68.9271 70.8427 68.745 70.4683 68.3809C70.0939 68.0168 69.9067 67.5588 69.9067 67.0068C69.9067 66.6309 69.9886 66.3021 70.1524 66.0202C70.3279 65.7266 70.5678 65.4975 70.872 65.3331C71.1762 65.1569 71.5272 65.0688 71.925 65.0688C72.5334 65.0688 73.0248 65.2568 73.3992 65.6326C73.7853 65.9967 73.9784 66.4548 73.9784 67.0068C73.9784 67.3709 73.8906 67.6997 73.7151 67.9934C73.5513 68.287 73.3115 68.516 72.9956 68.6804C72.6914 68.8449 72.3345 68.9271 71.925 68.9271ZM71.9425 67.87C72.1999 67.87 72.4047 67.7819 72.5568 67.6058C72.7206 67.4296 72.8025 67.2241 72.8025 66.9892C72.8025 66.7543 72.7206 66.5546 72.5568 66.3902C72.4047 66.2257 72.1999 66.1435 71.9425 66.1435C71.6734 66.1435 71.457 66.2257 71.2932 66.3902C71.1411 66.5546 71.065 66.7543 71.065 66.9892C71.065 67.2241 71.1411 67.4296 71.2932 67.6058C71.457 67.7819 71.6734 67.87 71.9425 67.87Z" fill="#002969"/>
                      <path d="M65.7598 78.6166C65.1748 78.6166 64.6424 78.4991 64.1627 78.2642C63.6947 78.0293 63.3203 77.6828 63.0395 77.2248C62.7704 76.755 62.6358 76.1854 62.6358 75.5159V67.4294H64.8647V75.3221C64.8647 75.7684 64.97 76.109 65.1806 76.3439C65.403 76.5671 65.6955 76.6786 66.0582 76.6786C66.2103 76.6786 66.3565 76.661 66.4969 76.6258C66.649 76.5906 66.8011 76.5495 66.9532 76.5025L67.1112 78.3875C66.924 78.458 66.7075 78.5109 66.4618 78.5461C66.2278 78.5931 65.9938 78.6166 65.7598 78.6166ZM61.2142 71.411V69.5964H66.9532V71.411H61.2142Z" fill="#002969"/>
                      <path d="M55.5768 78.4757V69.5965H57.8058V70.7945C58.0047 70.4539 58.2445 70.1896 58.5253 70.0017C58.8178 69.8138 59.122 69.6787 59.438 69.5965C59.7539 69.5025 60.0405 69.4556 60.2979 69.4556C60.4266 69.4556 60.5319 69.4614 60.6138 69.4732C60.6957 69.4732 60.7601 69.4791 60.8069 69.4908L60.6665 71.6578C60.6197 71.646 60.5436 71.6343 60.4383 71.6225C60.3447 71.599 60.2394 71.5873 60.1224 71.5873C59.8065 71.5873 59.5082 71.6578 59.2273 71.7987C58.9582 71.9279 58.7125 72.1334 58.4902 72.4153C58.2796 72.6972 58.11 73.0672 57.9813 73.5252C57.8643 73.9833 57.8058 74.5353 57.8058 75.1813V78.4757H55.5768Z" fill="#002969"/>
                      <path d="M47.4269 81.6821L49.6734 76.3616L52.2357 69.5964H54.57L49.7611 81.6821H47.4269ZM49.2171 79.1804L45.3911 69.5964H47.7955L50.2525 76.0268L49.2171 79.1804Z" fill="#002969"/>
                      <path d="M40.7344 78.4758V68.8742C40.7344 68.1813 40.8748 67.5999 41.1556 67.1301C41.4364 66.6603 41.8108 66.308 42.2788 66.0731C42.7586 65.8382 43.2909 65.7207 43.8759 65.7207C44.1333 65.7207 44.3732 65.7383 44.5955 65.7736C44.8295 65.8088 45.0401 65.8675 45.2273 65.9497L45.0694 67.8348C44.8939 67.7643 44.7359 67.7174 44.5955 67.6939C44.4551 67.6586 44.3089 67.641 44.1567 67.641C43.9227 67.641 43.718 67.6939 43.5425 67.7996C43.367 67.9053 43.2266 68.0638 43.1213 68.2752C43.016 68.4749 42.9633 68.7216 42.9633 69.0152V78.4758H40.7344ZM39.3128 71.4112V69.5966H45.0694V71.4112H39.3128Z" fill="#002969"/>
                      <path d="M34.0276 78.6166C33.1383 78.6166 32.3427 78.4229 31.6407 78.0353C30.9387 77.6359 30.3888 77.0957 29.9909 76.4145C29.5931 75.7215 29.3942 74.9228 29.3942 74.0185C29.3942 73.349 29.5054 72.7383 29.7277 72.1863C29.9617 71.6342 30.2835 71.1527 30.693 70.7416C31.1142 70.3305 31.6056 70.0134 32.1672 69.7903C32.7405 69.5671 33.3606 69.4555 34.0276 69.4555C34.9285 69.4555 35.7241 69.6493 36.4144 70.0369C37.1164 70.4245 37.6664 70.9648 38.0642 71.6577C38.462 72.3389 38.6609 73.1317 38.6609 74.0361C38.6609 74.7056 38.5439 75.3222 38.3099 75.8859C38.0876 76.4379 37.7658 76.9195 37.3446 77.3306C36.9351 77.7416 36.4495 78.0588 35.8879 78.2819C35.3263 78.5051 34.7062 78.6166 34.0276 78.6166ZM34.0276 76.714C34.3786 76.714 34.7003 76.6494 34.9928 76.5202C35.2853 76.3792 35.5369 76.1913 35.7475 75.9564C35.9581 75.7215 36.1219 75.4396 36.2389 75.1108C36.3559 74.7819 36.4144 74.4178 36.4144 74.0185C36.4144 73.4899 36.3091 73.026 36.0985 72.6267C35.8996 72.2274 35.6247 71.9161 35.2736 71.693C34.9226 71.4698 34.5073 71.3582 34.0276 71.3582C33.6765 71.3582 33.3548 71.4228 33.0623 71.552C32.7698 71.6812 32.5182 71.8633 32.3076 72.0982C32.097 72.3331 31.9332 72.6149 31.8162 72.9438C31.6992 73.2727 31.6407 73.6309 31.6407 74.0185C31.6407 74.5587 31.7401 75.0285 31.939 75.4279C32.1497 75.8272 32.4363 76.1443 32.799 76.3792C33.1617 76.6024 33.5712 76.714 34.0276 76.714ZM30.7105 79.0219L29.6575 78.1057L37.4148 69.0327L38.4678 69.9664L30.7105 79.0219Z" fill="#002969"/>
                      <path d="M24.8792 81.8231C24.7388 81.8231 24.6042 81.8172 24.4755 81.8055C24.3351 81.7937 24.1947 81.7761 24.0543 81.7526L24.1245 79.8851C24.1947 79.8969 24.2766 79.9028 24.3702 79.9028C24.4521 79.9145 24.534 79.9204 24.6159 79.9204C24.8967 79.9204 25.1132 79.8558 25.2653 79.7266C25.4174 79.5974 25.5227 79.4095 25.5812 79.1628C25.6397 78.9279 25.669 78.646 25.669 78.3172V69.5965H27.8979V78.5991C27.8979 79.2803 27.7809 79.8617 27.5469 80.3432C27.3246 80.8247 26.9911 81.1888 26.5465 81.4355C26.1019 81.6939 25.5461 81.8231 24.8792 81.8231ZM25.669 71.4111V69.5965H27.8979V71.4111H25.669ZM26.7746 68.4161C26.3651 68.4161 26.0258 68.2869 25.7567 68.0286C25.4876 67.7584 25.3531 67.4237 25.3531 67.0244C25.3531 66.7542 25.4116 66.5193 25.5286 66.3197C25.6573 66.1082 25.8269 65.9438 26.0375 65.8264C26.2598 65.6972 26.5055 65.6326 26.7746 65.6326C27.1842 65.6326 27.5235 65.7676 27.7926 66.0378C28.0734 66.2962 28.2138 66.625 28.2138 67.0244C28.2138 67.2827 28.1494 67.5176 28.0207 67.7291C27.892 67.9405 27.7224 68.1108 27.5118 68.24C27.3012 68.3574 27.0555 68.4161 26.7746 68.4161Z" fill="#002969"/>
                      <path d="M21.1627 78.4757V66.0024H23.3916V78.4757H21.1627ZM21.1627 78.4757V76.661H23.3916V78.4757H21.1627ZM21.1627 67.817V66.0024H23.3916V67.817H21.1627Z" fill="#002969"/>
                      <path d="M16.6565 78.4757V69.5965H18.8854V78.4757H16.6565ZM16.6565 78.4757V76.6611H18.8854V78.4757H16.6565ZM16.6565 71.4111V69.5965H18.8854V71.4111H16.6565ZM17.7797 68.4161C17.3702 68.4161 17.0309 68.2869 16.7618 68.0286C16.4927 67.7584 16.3582 67.4237 16.3582 67.0244C16.3582 66.7542 16.4167 66.5193 16.5337 66.3197C16.6624 66.1082 16.832 65.9438 17.0426 65.8264C17.2649 65.6972 17.5106 65.6326 17.7797 65.6326C18.1893 65.6326 18.5286 65.7676 18.7977 66.0378C19.0785 66.2962 19.2189 66.625 19.2189 67.0244C19.2189 67.2827 19.1545 67.5176 19.0258 67.7291C18.8971 67.9405 18.7275 68.1108 18.5169 68.24C18.3063 68.3574 18.0606 68.4161 17.7797 68.4161Z" fill="#002969"/>
                      <path d="M0.499329 78.4756V66.1433H3.83392L6.5718 72.7323C6.75901 73.2021 6.91111 73.6249 7.02811 74.0007C7.15682 74.3766 7.25042 74.6761 7.30892 74.8992C7.37912 75.1224 7.41422 75.234 7.41422 75.234C7.41422 75.234 7.44347 75.1224 7.50198 74.8992C7.57218 74.6761 7.67163 74.3766 7.80033 74.0007C7.92904 73.6249 8.08699 73.2079 8.2742 72.7499L11.0121 66.1433H14.2589V78.4756H11.8721V72.0628C11.8721 71.546 11.8779 71.0938 11.8896 70.7062C11.9013 70.3069 11.913 69.9898 11.9247 69.7549C11.9364 69.52 11.9423 69.4026 11.9423 69.4026C11.9423 69.4026 11.9013 69.5141 11.8194 69.7373C11.7492 69.9487 11.6439 70.2423 11.5035 70.6182C11.3631 70.994 11.1993 71.4168 11.0121 71.8866L8.29175 78.4756H6.4665L3.74617 71.8866C3.55897 71.4168 3.39516 70.9999 3.25476 70.6358C3.12605 70.2599 3.02075 69.9663 2.93885 69.7549C2.86865 69.5317 2.83354 69.4202 2.83354 69.4202C2.83354 69.4202 2.83939 69.5376 2.85109 69.7725C2.8628 69.9957 2.86865 70.3069 2.86865 70.7062C2.88035 71.0938 2.8862 71.546 2.8862 72.0628V78.4756H0.499329Z" fill="#002969"/>
                      <rect x="0.499329" y="0.696289" width="92.5051" height="58.4118" rx="3.5392" fill="#00ACEB"/>
                      <path d="M63.4771 50.8133C74.9556 50.8133 84.2607 41.4622 84.2607 29.927C84.2607 18.3919 74.9556 9.04077 63.4771 9.04077C51.9986 9.04077 42.6935 18.3919 42.6935 29.927C42.6935 41.4622 51.9986 50.8133 63.4771 50.8133Z" fill="#002969"/>
                      <path d="M9.61163 11.8059L47.7128 43.5433L60.8265 9.20801L10.5835 9.263C9.25484 9.263 8.62444 10.9106 9.61163 11.8059Z" fill="white"/>
                      <path d="M60.8294 9.20801C53.4987 10.1605 46.9102 15.0218 44.0755 22.4437C41.2409 29.8655 42.9023 37.9076 47.7157 43.5455C55.0463 42.593 61.6349 37.7317 64.4695 30.3098C67.3041 22.888 65.6428 14.8459 60.8294 9.20801Z" fill="#1CC600"/>
                    </svg>
                  )}
                </div>
              );
            })}
            <svg
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}
            >
              {hullPath && <path d={hullPath} fill={hullColor} />}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
