'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      let message = 'E-mail ou senha inválidos.';
      if (err.code === 'auth/user-not-found') {
        message = 'Nenhuma conta encontrada com este e-mail.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Senha incorreta.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'E-mail inválido.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
        {/* Botão Voltar */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Link>

        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Entrar no TaskFlow</h1>
          <p className="text-sm text-gray-500">
            Use suas credenciações para acessar sua conta.
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo de e-mail */}
          <div>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              {...register('email')}
              disabled={loading}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Campo de senha */}
          <div>
            <input
              id="password"
              type="password"
              placeholder="Sua senha"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              {...register('password')}
              disabled={loading}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Botão de login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Link para cadastro */}
        <div className="text-center text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link href="/register" className="text-emerald-600 font-medium hover:underline">
            Crie uma agora
          </Link>
        </div>
      </div>
    </div>
  );
}