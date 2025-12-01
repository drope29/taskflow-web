'use client';

import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-emerald-600">
          TaskFlow
        </Link>

        {/* Botão de login (ícone) */}
        <Link href="/login" className="text-gray-700 hover:text-emerald-600">
          <LogIn size={24} />
        </Link>

        {/* Menu mobile (hambúrguer) */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-0.5 bg-gray-700 mb-1.5"></div>
          <div className="w-6 h-0.5 bg-gray-700 mb-1.5"></div>
          <div className="w-4 h-0.5 bg-gray-700"></div>
        </button>
      </div>

      {/* Menu mobile aberto */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <Link href="/#features" className="text-gray-700 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>
              Recursos
            </Link>
            <Link href="/#about" className="text-gray-700 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>
              Sobre
            </Link>
            <Link href="/#contact" className="text-gray-700 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>
              Contato
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-emerald-600 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              <LogIn size={20} />
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}