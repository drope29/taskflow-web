'use client';

import { useEffect } from 'react';

export function VLibras() {
  useEffect(() => {
    // Carrega o script do VLibras apenas no lado do cliente
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ VLibras carregado com sucesso');
    };
    script.onerror = () => {
      console.error('❌ Falha ao carregar o VLibras');
    };
    
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className="enable-vlibras"
      data-vlibras="true"
      data-translation="true"
      data-autorun="false"
      data-position="1"        // 1 = direita, 2 = esquerda
      data-opacity="0.9"
      data-accent-color="#10B981" // cor do seu branding (emerald-500)
      data-toolbox="true"
      data-keyboard="true"     // ✅ Atalho: Ctrl+Shift+L
      aria-live="polite"
      role="region"
      aria-label="Widget de Libras - Tradução em tempo real"
    ></div>
  );
}