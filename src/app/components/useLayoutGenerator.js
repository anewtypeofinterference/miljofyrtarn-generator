'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const PRESET_DEFAULTS = {
  preset1: {
    backgroundColor: '#8bd1ff',
    hullColor: '#FFFFFF',
    items: [
      { id: uuidv4(), type: 'logo', value: '' },
      { id: uuidv4(), type: 'overskrift', value: 'Overskrift her' },
      { id: uuidv4(), type: 'tekst', value: 'En lengre tekst som går over et par linjer, og som beskriver innholdet som kommer her.' },
      { id: uuidv4(), type: 'bilde', value: 'placeholder-1.jpg' },
    ],
  },
  preset2: {
    backgroundColor: '#003827',
    hullColor: '#ffff85',
    items: [
      { id: uuidv4(), type: 'overskrift', value: 'Velkommen til seminar' },
      { id: uuidv4(), type: 'tekst', value: 'En lengre tekst som går over et par linjer, og som beskriver innholdet som kommer her.' },
      { id: uuidv4(), type: 'bilde', value: 'placeholder-2.jpg' },
    ],
  },
  preset3: {
    backgroundColor: '#003827',
    hullColor: '#1CC600',
    items: [
      { id: uuidv4(), type: 'overskrift', value: 'Grønn' },
      { id: uuidv4(), type: 'overskrift', value: 'Fremtid' },
      { id: uuidv4(), type: 'tekst', value: 'Miljøfyrtårns kriterier og indikatorer er kategorisert under ulike miljøtema. Nå endrer Miljøfyrtårn denne inndelingen.' },
    ],
  },
};

export function useLayoutGenerator() {
  const [format, setFormat] = useState('50x70cm');
  const [preset, setPreset] = useState('preset1');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [hullColor, setHullColor] = useState('#8BD1FF');
  const [items, setItems] = useState([]);

  const availableFormats = [
    '50x70cm',
    'A4',
    '1080x1080',
    '1080x1920',
    '1080x1350',
    '1920x1080',
  ];

  const backgroundColors = [
    'transparent',
    '#FFFFFF',
    '#8bd1ff',
    '#00aceb',
    '#002969',
    '#c1ff7e',
    '#1cc600',
    '#003827',
    '#ffff85',
    '#ffdadf',
    '#610000',
  ];
  
  const hullColors = [
    '#FFFFFF',
    '#8bd1ff',
    '#c1ff7e',
    '#1CC600',
    '#ffff85',
  ];

  useEffect(() => {
    const defaults = PRESET_DEFAULTS[preset];
    if (defaults) {
      setBackgroundColor(defaults.backgroundColor);
      setHullColor(defaults.hullColor);
      setItems(defaults.items);
    }
  }, [preset]);

  const addItem = (type) => {
    const defaultValues = {
      overskrift: 'Ny overskrift',
      tekst: 'Ny lengre tekst',
      logo: '',
      bilde: '',
      bakgrunnsbilde: '', // new type for background image
    };
    setItems((prev) => [
      ...prev,
      { id: uuidv4(), type, value: defaultValues[type] || '' },
    ]);
  };

  const updateItem = useCallback((id, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value } : item))
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
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
  };
}
