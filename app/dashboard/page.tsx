'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Task } from '@/types';

import {
  Card,
  Metric,
  Text,
  Title,
  Grid,
  ProgressBar,
  BadgeDelta,
  AreaChart,
  BarChart,
} from '@tremor/react';

import {
  startOfWeek,
  isWithinInterval,
  isBefore,
  isSameDay,
  addDays,
  format,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { LogOut, Plus, Contrast, Sun, Moon, Type } from 'lucide-react';
import Link from 'next/link';

// ✅ Hook de acessibilidade
import { useAccessibility } from '@/hooks/useAccessibility';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // ✅ Acessibilidade
  const { theme, fontSize, reducedMotion } = useAccessibility();

  // 🔁 Redireciona se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // 🔁 Carrega tarefas em tempo real
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksList = snapshot.docs.map((doc) => {
          const data = doc.data();
          const dueDate =
            data.dueDate instanceof Timestamp
              ? data.dueDate.toDate()
              : data.dueDate
                ? new Date(data.dueDate)
                : null;

          return {
            id: doc.id,
            ...data,
            dueDate,
          } as unknown as Task;
        });
        setTasks(tasksList);
        if (initialLoad) {
          setInitialLoad(false);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Erro ao escutar tarefas:', err);
        if (initialLoad) {
          setInitialLoad(false);
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [user, initialLoad]);

  // 🔐 Logout seguro
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  }, [router]);

  // 🚧 Loading inicial
  if (authLoading || (initialLoad && loading)) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center">
          <div 
            className={`w-10 h-10 border-t-4 ${
              theme === 'high-contrast' ? 'border-white' : 'border-emerald-500'
            } border-solid rounded-full ${
              reducedMotion ? '' : 'animate-spin'
            } mb-3`}
            aria-hidden="true"
          />
          <div className="text-lg">
            <span className="sr-only">Carregando </span>
            <span 
              className={theme === 'high-contrast' ? 'text-white' : 'text-gray-700'}
            >
              Carregando dashboard...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Métricas ---
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;

  const today = new Date();
  const overdueTasks = tasks.filter((t) =>
    t.status !== 'done' && t.dueDate && isBefore(t.dueDate, today)
  ).length;

  const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
  const completedThisWeek = tasks.filter((t) =>
    t.status === 'done' &&
    t.dueDate &&
    isWithinInterval(t.dueDate, { start: startOfThisWeek, end: today })
  ).length;

  // --- Gráfico 1: últimos 7 dias ---
  const last7Days = Array.from({ length: 7 }, (_, i) => addDays(startOfThisWeek, i));
  const areaChartData = last7Days.map((day) => {
    const completed = tasks.filter(
      (t) => t.status === 'done' && t.dueDate && isSameDay(t.dueDate, day)
    ).length;

    const overdueThatDay = tasks.filter(
      (t) =>
        t.status !== 'done' &&
        t.dueDate &&
        isSameDay(t.dueDate, day) &&
        isBefore(t.dueDate, today)
    ).length;

    return {
      dia: format(day, 'dd/MM', { locale: ptBR }),
      Concluídas: completed,
      Vencidas: overdueThatDay,
    };
  });

  // --- Gráfico 2: comparação geral ---
  const barChartData = [
    {
      name: 'Tarefas',
      Pendentes: pendingTasks,
      Concluídas: completedThisWeek,
      Vencidas: overdueTasks,
    },
  ];

  // ✅ Classes dinâmicas de acessibilidade
  const getThemeClasses = () => {
    switch (theme) {
      case 'high-contrast':
        return 'bg-black text-white';
      case 'dark':
        return 'bg-gray-900 text-gray-100';
      case 'dyslexia':
        return 'bg-amber-50 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getCardClasses = () => {
    switch (theme) {
      case 'high-contrast':
        return 'bg-white text-black border-white';
      case 'dark':
        return 'bg-gray-800 text-gray-100 border-gray-700';
      case 'dyslexia':
        return 'bg-white text-gray-800 border-amber-200';
      default:
        return 'bg-white text-gray-900 border-gray-300';
    }
  };

  const getButtonClasses = () => {
    switch (theme) {
      case 'high-contrast':
        return 'bg-yellow-400 text-black hover:bg-yellow-500';
      case 'dark':
        return 'bg-emerald-700 text-white hover:bg-emerald-600';
      case 'dyslexia':
        return 'bg-amber-600 text-white hover:bg-amber-500';
      default:
        return 'bg-emerald-600 text-white hover:bg-emerald-700';
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
        return 'text-gray-400';
      case 'dyslexia':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  // ✅ Classes de fonte
  const fontSizeClasses = {
    normal: '',
    large: 'text-lg',
    xlarge: 'text-xl',
  };

  return (
    <div 
      className={`min-h-screen p-4 md:p-6 transition-colors duration-300 ${
        getThemeClasses()
      } ${fontSizeClasses[fontSize]}`}
      // ✅ ARIA landmarks
      role="main"
      aria-label="Painel de controle do usuário"
    >
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${getTextClasses()}`}>
            Olá, <span className="not-sr-only">{user?.displayName || 'usuário'}</span>!
          </h1>
          <p className={`${getSecondaryTextClasses()}`}>
            Aqui está o resumo das suas tarefas.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/tasks"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              getButtonClasses()
            } ${
              theme === 'high-contrast' 
                ? 'focus:ring-yellow-500 focus:ring-offset-black' 
                : theme === 'dark' 
                  ? 'focus:ring-emerald-500 focus:ring-offset-gray-900'
                  : 'focus:ring-emerald-500'
            }`}
            aria-label="Criar nova tarefa"
            // ✅ Atalho de teclado (sugerido)
            title="Atalho: Ctrl+T"
          >
            <Plus size={16} aria-hidden="true" />
            Nova Tarefa
          </Link>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              theme === 'high-contrast'
                ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus:ring-yellow-500 focus:ring-offset-black'
                : theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-900'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
            }`}
            aria-label="Sair da conta"
          >
            <LogOut size={16} aria-hidden="true" />
            Sair
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total pendentes */}
        <Card 
          className={`h-full flex flex-col justify-between rounded ${getCardClasses()}`}
          aria-labelledby="metric-pending"
        >
          <div>
            <Text 
              id="metric-pending" 
              className="font-medium"
              style={{ color: theme === 'high-contrast' ? '#000' : undefined }}
            >
              Pendentes
            </Text>
            <Metric 
              className={getTextClasses()}
              aria-label={`${pendingTasks} tarefas pendentes`}
            >
              {pendingTasks}
            </Metric>
          </div>
          <ProgressBar
            value={(pendingTasks / (totalTasks || 1)) * 100}
            color="amber"
            className="mt-2"
            aria-label={`Progresso de tarefas pendentes: ${Math.round(
              (pendingTasks / (totalTasks || 1)) * 100
            )}%`}
          />
        </Card>

        {/* Concluídas na semana */}
        <Card 
          className={`h-full flex flex-col justify-between rounded ${getCardClasses()}`}
          aria-labelledby="metric-completed"
        >
          <div className="flex items-center justify-between">
            <div>
              <Text 
                id="metric-completed" 
                className="font-medium"
                style={{ color: theme === 'high-contrast' ? '#000' : undefined }}
              >
                Concluídas (Semana)
              </Text>
              <Metric 
                className={getTextClasses()}
                aria-label={`${completedThisWeek} tarefas concluídas esta semana`}
              >
                {completedThisWeek}
              </Metric>
            </div>
            <BadgeDelta 
              deltaType="increase" 
              className="bg-transparent [&>svg]:text-current"
              aria-label={`Aumento de ${completedThisWeek} tarefas concluídas`}
            >
              +{completedThisWeek}
            </BadgeDelta>
          </div>
        </Card>

        {/* Vencidas */}
        <Card 
          className={`h-full flex flex-col justify-between rounded ${getCardClasses()}`}
          aria-labelledby="metric-overdue"
        >
          <div className="flex items-center justify-between">
            <div>
              <Text 
                id="metric-overdue" 
                className="font-medium"
                style={{ color: theme === 'high-contrast' ? '#000' : undefined }}
              >
                Vencidas
              </Text>
              <Metric 
                className={getTextClasses()}
                aria-label={`${overdueTasks} tarefas vencidas`}
              >
                {overdueTasks}
              </Metric>
            </div>
            {overdueTasks > 0 && (
              <BadgeDelta 
                deltaType="decrease" 
                className="bg-transparent [&>svg]:text-current"
                aria-label={`Alerta: ${overdueTasks} tarefas vencidas`}
              >
                -{overdueTasks}
              </BadgeDelta>
            )}
          </div>
        </Card>
      </div>

      {/* Gráfico 1: atividade dos últimos 7 dias */}
      <Card className={getCardClasses()}>
        <Title className={getTextClasses()}>Atividade dos Últimos 7 Dias</Title>
        <AreaChart
          className="mt-6 h-72"
          data={areaChartData}
          index="dia"
          categories={['Concluídas', 'Vencidas']}
          colors={['emerald', 'rose']}
          showLegend
          showYAxis
          showXAxis
          showGridLines
          curveType="natural"
          valueFormatter={(v) => `${v} tarefas`}
          yAxisWidth={100}
          // ✅ Acessibilidade para gráficos
          aria-label="Gráfico de área mostrando tarefas concluídas e vencidas nos últimos 7 dias"
          role="img"
        />
      </Card>

      {/* Gráfico 2: comparação geral */}
      <Card className={`mt-6 ${getCardClasses()}`}>
        <Title className={getTextClasses()}>Visão Geral</Title>
        <BarChart
          className="mt-6 h-72"
          data={barChartData}
          index="name"
          categories={['Pendentes', 'Concluídas', 'Vencidas']}
          colors={['amber', 'emerald', 'rose']}
          showAnimation={!reducedMotion}
          yAxisWidth={60}
          aria-label="Gráfico de barras comparando tarefas pendentes, concluídas e vencidas"
          role="img"
        />
      </Card>

      {/* Acesso rápido */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Navegação rápida">
        <Link
          href="/tasks"
          className={`p-4 rounded-lg shadow text-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            theme === 'high-contrast'
              ? 'bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-500 focus:ring-offset-black'
              : theme === 'dark'
                ? 'bg-emerald-700 text-white hover:bg-emerald-600 focus:ring-emerald-500 focus:ring-offset-gray-900'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
          }`}
          aria-label="Ir para Lista de Tarefas"
        >
          <div className="font-medium">Lista de Tarefas</div>
        </Link>

        <Link
          href="/kanban"
          className={`p-4 rounded-lg shadow text-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            theme === 'high-contrast'
              ? 'bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-500 focus:ring-offset-black'
              : theme === 'dark'
                ? 'bg-emerald-700 text-white hover:bg-emerald-600 focus:ring-emerald-500 focus:ring-offset-gray-900'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
          }`}
          aria-label="Ir para Quadro Kanban"
        >
          <div className="font-medium">Quadro Kanban</div>
        </Link>

        <Link
          href="/calendar"
          className={`p-4 rounded-lg shadow text-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            theme === 'high-contrast'
              ? 'bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-500 focus:ring-offset-black'
              : theme === 'dark'
                ? 'bg-emerald-700 text-white hover:bg-emerald-600 focus:ring-emerald-500 focus:ring-offset-gray-900'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
          }`}
          aria-label="Ir para Calendário"
        >
          <div className="font-medium">Calendário</div>
        </Link>
      </div>

      {/* ✅ Botão de acessibilidade flutuante (alternativa leve) */}
      <button
        onClick={() => {
          // Abre barra de acessibilidade ou vai para /acessibilidade
          router.push('/acessibilidade');
        }}
        className="fixed bottom-4 right-4 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        aria-label="Configurações de acessibilidade"
        title="Acessibilidade"
      >
        <Type size={20} aria-hidden="true" />
        <span className="sr-only">Acessibilidade</span>
      </button>
    </div>
  );
}