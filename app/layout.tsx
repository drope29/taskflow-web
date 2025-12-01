// app/layout.tsx
import { Inter, Open_Sans } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { AccessibilityProvider } from '@/app/accessibility/theme-provider';
import AccessibilityToolbar from '@/components/AccessibilityToolbar';
import { VLibrasClient } from '../components/VlibrasClient'; // ✅ Importe aqui

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const openSans = Open_Sans({ 
  subsets: ['latin'],
  variable: '--font-open-sans',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'TaskFlow - Gerenciador de Tarefas Acessível',
  description: 'Sistema de gestão de tarefas com acessibilidade completa (VLibras, temas, etc.)',
  keywords: 'acessibilidade, vlibras, tarefas, gestão, wcag, deficiência auditiva',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${openSans.variable} font-sans`}>
        <AccessibilityProvider>
          {children}
          <AccessibilityToolbar />
        </AccessibilityProvider>
        
        {/* ✅ Agora funciona porque é um Client Component */}
        <VLibrasClient />
      </body>
    </html>
  );
}