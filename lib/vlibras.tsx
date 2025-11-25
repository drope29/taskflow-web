'use client';

import { useEffect } from 'react';

export function VLibras() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    document.head.appendChild(script);

    const div = document.createElement('div');
    div.setAttribute('vw', 'true');
    div.setAttribute('class', 'vw-plugin');
    div.setAttribute('data-active', 'true');
    div.setAttribute('data-translation', 'true');
    div.setAttribute('data-keyboard-shortcut', 'true');
    document.body.appendChild(div);

    return () => {
      document.head.removeChild(script);
      const plugin = document.querySelector('.vw-plugin');
      if (plugin) document.body.removeChild(plugin);
    };
  }, []);

  return null;
}