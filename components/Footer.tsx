// components/layout/Footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">TaskFlow</h3>
            <p className="text-gray-400">Gerencie suas tarefas com inteligência e simplicidade.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-gray-400 hover:text-white">
              Privacidade
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white">
              Termos
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white">
              Contato
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} TaskFlow. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}