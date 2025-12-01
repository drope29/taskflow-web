'use client';

import { useEffect } from 'react';

export function VLibrasClient() {
  useEffect(() => {
    // Não inicializa duas vezes
    if ((window as any).__VLIBRAS_WIDGET__) return;

    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;

    script.onload = () => {
      try {
        new (window as any).VLibras.Widget('https://vlibras.gov.br/app');
        (window as any).__VLIBRAS_WIDGET__ = true;
      } catch (e) {
        console.error('Erro ao iniciar VLibras:', e);
      }
    };

    document.body.appendChild(script);
  }, []);

  return (
    <div data-vw="true">
      <div vw-access-button="true"></div>
      <div vw-plugin-wrapper="true">
        <div className="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  );
}
