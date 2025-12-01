'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

// ✅ Acessibilidade
import { useAccessibility } from '@/hooks/useAccessibility';
import { useEffect, useState } from 'react';
import { Type, Contrast, Sun, Moon } from 'lucide-react';

export default function Home() {
  // ✅ Hooks de acessibilidade
  const { theme, fontSize, reducedMotion } = useAccessibility();
  const [mounted, setMounted] = useState(false);

  // Evita hidratação desigual
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // ✅ Funções de estilo acessível
  const getPageBgClasses = () => {
    switch (theme) {
      case 'high-contrast':
        return 'bg-black';
      case 'dark':
        return 'bg-gradient-to-b from-gray-900 to-gray-800';
      case 'dyslexia':
        return 'bg-gradient-to-b from-amber-50 to-white';
      default:
        return 'bg-gradient-to-b from-emerald-50 to-white';
    }
  };

  const getTextClasses = () => {
    switch (theme) {
      case 'high-contrast':
        return 'text-white';
      case 'dark':
        return 'text-gray-100';
      case 'dyslexia':
        return 'text-gray-800';
      default:
        return 'text-gray-900';
    }
  };

  const getSecondaryTextClasses = () => {
    switch (theme) {
      case 'high-contrast':
        return 'text-gray-300';
      case 'dark':
        return 'text-gray-300';
      case 'dyslexia':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getButtonClasses = () => {
    switch (theme) {
      case 'high-contrast':
        return 'bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-500 focus:ring-offset-black';
      case 'dark':
        return 'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900';
      case 'dyslexia':
        return 'bg-amber-600 text-white hover:bg-amber-500 focus:ring-amber-500';
      default:
        return 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500';
    }
  };

  const getHighlightClasses = () => {
    switch (theme) {
      case 'high-contrast':
        return 'text-yellow-300';
      case 'dark':
        return 'text-emerald-400';
      case 'dyslexia':
        return 'text-amber-700';
      default:
        return 'text-emerald-600';
    }
  };

  const fontSizeClasses = {
    normal: 'text-4xl md:text-6xl',
    large: 'text-5xl md:text-7xl',
    xlarge: 'text-6xl md:text-8xl',
  };

  const fontSizeClassesP = {
    normal: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl',
  };

  return (
    <>
      <Header />

      <main 
        className={`min-h-screen transition-colors duration-300 ${getPageBgClasses()}`}
        role="main"
        aria-label="Página inicial do TaskFlow - Gerenciamento de tarefas acessível"
      >
        <div className={`container mx-auto px-4 py-16 md:py-28 flex flex-col items-center text-center transition-all duration-300 ${fontSize === 'large' ? 'py-20 md:py-32' : fontSize === 'xlarge' ? 'py-24 md:py-36' : ''}`}>
          <h1 
            className={`font-bold max-w-3xl transition-all ${fontSizeClasses[fontSize]} ${getTextClasses()}`}
            id="main-heading"
          >
            Gerencie Suas Tarefas com{' '}
            <span className={`transition-colors ${getHighlightClasses()}`}>TaskFlow</span>
          </h1>
          
          <p 
            className={`mt-6 max-w-2xl transition-all ${fontSizeClassesP[fontSize]} ${getSecondaryTextClasses()}`}
            id="main-description"
          >
            Uma plataforma intuitiva, acessível e poderosa para organizar seu dia a dia, com Kanban, calendário, metas e muito mais.
          </p>

          {/* Call to Action */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/login" 
              className="inline-block"
              aria-label="Começar a usar o TaskFlow - clique para criar sua conta gratuita"
            >
              <button 
                className={`px-8 py-3 font-semibold rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonClasses()}`}
              >
                Começar Agora
              </button>
            </Link>
            
            {/* ✅ Botão de acessibilidade rápido */}
            <button
              onClick={() => {
                // Simula atalho Ctrl+K para abrir configurações
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  ctrlKey: true,
                  bubbles: true
                });
                document.dispatchEvent(event);
              }}
              className={`px-8 py-3 font-semibold rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme === 'high-contrast'
                  ? 'border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus:ring-yellow-500 focus:ring-offset-black'
                  : theme === 'dark'
                    ? 'border-2 border-gray-400 text-gray-300 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-900'
                    : theme === 'dyslexia'
                      ? 'border-2 border-amber-500 text-amber-700 hover:bg-amber-100 focus:ring-amber-500'
                      : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
              }`}
              aria-label="Configurações de acessibilidade (Ctrl+K)"
            >
              <Type className="inline mr-2 h-5 w-5" aria-hidden="true" />
              Acessibilidade
            </button>
          </div>

          {/* ✅ Seção de recursos de acessibilidade */}
          <div className="mt-16 max-w-4xl w-full">
            <h2 className={`text-2xl font-bold mb-8 ${getTextClasses()}`}>
              <Contrast className="inline mr-2 h-6 w-6" aria-hidden="true" />
              Acessibilidade Inclusiva
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* VLibras */}
              <div className={`p-6 rounded-xl ${
                theme === 'high-contrast' 
                  ? 'bg-black border-2 border-yellow-400' 
                  : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : theme === 'dyslexia'
                      ? 'bg-white border-amber-200'
                      : 'bg-white border-gray-200'
              }`}>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className={`font-bold text-lg mb-2 ${getTextClasses()}`}>Libras</h3>
                <p className={getSecondaryTextClasses()}>
                  Tradução em tempo real para Língua Brasileira de Sinais com o widget VLibras.
                </p>
              </div>

              {/* Temas */}
              <div className={`p-6 rounded-xl ${
                theme === 'high-contrast' 
                  ? 'bg-black border-2 border-yellow-400' 
                  : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : theme === 'dyslexia'
                      ? 'bg-white border-amber-200'
                      : 'bg-white border-gray-200'
              }`}>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <Sun className="h-6 w-6 text-amber-600" aria-hidden="true" />
                </div>
                <h3 className={`font-bold text-lg mb-2 ${getTextClasses()}`}>Temas Adaptáveis</h3>
                <p className={getSecondaryTextClasses()}>
                  Escolha entre padrão, escuro, alto contraste e tema para dislexia.
                </p>
              </div>

              {/* Teclado */}
              <div className={`p-6 rounded-xl ${
                theme === 'high-contrast' 
                  ? 'bg-black border-2 border-yellow-400' 
                  : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : theme === 'dyslexia'
                      ? 'bg-white border-amber-200'
                      : 'bg-white border-gray-200'
              }`}>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={`font-bold text-lg mb-2 ${getTextClasses()}`}>Navegação por Teclado</h3>
                <p className={getSecondaryTextClasses()}>
                  Controle total com teclado: Tab, Enter, Espaço e atalhos personalizados.
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Aviso de conformidade */}
          <div className="mt-16 max-w-3xl w-full">
            <div className={`p-6 rounded-xl border-l-4 ${
              theme === 'high-contrast'
                ? 'bg-black border-yellow-400'
                : theme === 'dark'
                  ? 'bg-gray-800 border-emerald-500'
                  : theme === 'dyslexia'
                    ? 'bg-amber-50 border-amber-400'
                    : 'bg-emerald-50 border-emerald-500'
            }`}>
              <h3 className={`font-bold text-xl mb-3 ${getTextClasses()}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Conformidade com WCAG 2.1
              </h3>
              <p className={getSecondaryTextClasses()}>
                Nosso sistema atende aos critérios de acessibilidade AA, garantindo inclusão para pessoas com deficiência visual, auditiva, motora e cognitiva.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  theme === 'high-contrast'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>VLibras</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  theme === 'high-contrast'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>Temas</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  theme === 'high-contrast'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>Teclado</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  theme === 'high-contrast'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>Leitor de Tela</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}