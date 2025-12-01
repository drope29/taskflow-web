// components/AccessibilityToolbar.tsx
'use client';

import { useState } from 'react';
import { useAccessibility } from '@/hooks/useAccessibility';
import { Sun, Moon, Contrast, Eye, Type, Palette, Volume2, VolumeX } from 'lucide-react';

const AccessibilityToolbar = () => {
  const { theme, setTheme, fontSize, setFontSize, reducedMotion, setReducedMotion } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'default', name: 'Padrão', icon: Palette },
    { id: 'high-contrast', name: 'Alto Contraste', icon: Contrast },
    { id: 'dark', name: 'Escuro', icon: Moon },
    { id: 'dyslexia', name: 'Dislexia', icon: Eye },
  ];

  const fontSizes = [
    { id: 'normal', name: 'A', label: 'Normal' },
    { id: 'large', name: 'A+', label: 'Grande' },
    { id: 'xlarge', name: 'A++', label: 'Muito Grande' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        aria-label={isOpen ? 'Fechar barra de acessibilidade' : 'Abrir barra de acessibilidade'}
        aria-expanded={isOpen}
      >
        <Type size={20} />
      </button>

      {/* Painel de acessibilidade */}
      {isOpen && (
        <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Acessibilidade</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Fechar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Temas */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tema</h3>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded border ${
                      theme === t.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    aria-pressed={theme === t.id}
                    aria-label={`Ativar tema ${t.name}`}
                  >
                    <Icon size={16} />
                    <span className="text-xs mt-1">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tamanho da fonte */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</h3>
            <div className="flex gap-2">
              {fontSizes.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontSize(f.id as any)}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    fontSize === f.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-pressed={fontSize === f.id}
                  aria-label={`Definir tamanho da fonte para ${f.label}`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Redução de movimento */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="reduce-motion" className="text-sm font-medium text-gray-700">
                Reduzir movimentos
              </label>
              <p className="text-xs text-gray-500">Melhor para usuários com vestibulopatia</p>
            </div>
            <button
              id="reduce-motion"
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                reducedMotion ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
              aria-pressed={reducedMotion}
              aria-label={reducedMotion ? 'Desativar redução de movimentos' : 'Ativar redução de movimentos'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  reducedMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityToolbar;