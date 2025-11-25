// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Schema de validação com Zod
const registerSchema = z
  .object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    email: z.string().email('E-mail inválido.'),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres.')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'A senha deve conter letras maiúsculas, minúsculas e números.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async ( data: RegisterFormData) => { // ✅ CORREÇÃO: 'data' é o parâmetro
    setError(null);
    setLoading(true);

    try {
      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Salva dados adicionais no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name: data.name,
        email: data.email,
      });

      // Redireciona para o dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      let message = 'Erro ao criar conta. Tente novamente.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está em uso.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'E-mail inválido.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Cadastro desativado no momento.';
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
          <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-sm text-gray-500">
            Preencha seus dados para começar a usar o TaskFlow.
          </p>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              id="name"
              type="text"
              placeholder="Nome completo"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              {...register('name')}
              disabled={loading}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

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

          <div>
            <input
              id="password"
              type="password"
              placeholder="Senha"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              {...register('password')}
              disabled={loading}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirmar senha"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              {...register('confirmPassword')}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-emerald-600 hover:underline">
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}