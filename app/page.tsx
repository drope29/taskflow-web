import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { VLibras } from '@/lib/vlibras';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-28 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 max-w-3xl">
            Gerencie Suas Tarefas com <span className="text-emerald-600">TaskFlow</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl">
            Uma plataforma intuitiva, acessível e poderosa para organizar seu dia a dia, com Kanban, calendário, metas e muito mais.
          </p>

          {/* Call to Action */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <button className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow hover:bg-emerald-700 transition-colors">
                Começar Agora
              </button>
            </Link>
            <Link href="/#features">
              <button className="px-8 py-3 bg-white text-emerald-600 border border-emerald-600 font-semibold rounded-lg shadow hover:bg-emerald-50 transition-colors">
                Conhecer Recursos
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      {/* Widget de Acessibilidade - VLibras (obrigatório) */}
      <VLibras />
    </>
  );
}