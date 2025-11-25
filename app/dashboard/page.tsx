'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/types';
import {
    Card,
    Metric,
    Text,
    Title,
    Grid,
    ProgressBar,
    Flex,
    AreaChart,
    BadgeDelta,
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
import { LogIn, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Redireciona se não estiver autenticado
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Carrega tarefas do usuário
    useEffect(() => {
        if (!user) return;

        const fetchTasks = async () => {
            try {
                const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
                const snapshot = await getDocs(q);
                const tasksList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
                setTasks(tasksList);
            } catch (err) {
                console.error('Erro ao carregar tarefas:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-600 text-lg">Carregando dashboard...</div>
            </div>
        );
    }

    // Cálculo das métricas
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status !== 'done').length;
    const overdueTasks = tasks.filter(t =>
        t.status !== 'done' && t.dueDate && isBefore(new Date(t.dueDate), new Date())
    ).length;

    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Segunda-feira
    const completedThisWeek = tasks.filter(t =>
        t.status === 'done' &&
        t.dueDate &&
        isWithinInterval(new Date(t.dueDate), { start: startOfThisWeek, end: today })
    ).length;

    // Dados para gráfico: últimos 7 dias
    const last7Days = Array.from({ length: 7 }, (_, i) => addDays(startOfThisWeek, i));
    const chartData = last7Days.map(day => {
        const completed = tasks.filter(t =>
            t.status === 'done' && t.dueDate && isSameDay(new Date(t.dueDate), day)
        ).length;
        const overdue = tasks.filter(t =>
            t.status !== 'done' &&
            t.dueDate &&
            isBefore(new Date(t.dueDate), day) &&
            !isSameDay(new Date(t.dueDate), day)
        ).length;
        return {
            data: format(day, 'dd/MM', { locale: ptBR }),
            'Concluídas': completed,
            'Vencidas': overdue,
        };
    });

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.displayName || 'usuário'}!</h1>
                    <p className="text-gray-600">Aqui está o resumo das suas tarefas.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/tasks"
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                        <Plus size={16} />
                        Nova Tarefa
                    </Link>
                    <Link
                        href="/login"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <LogIn size={16} />
                        Sair
                    </Link>
                </div>
            </div>

            {/* Métricas principais */}
            <Grid numItemsSm={2} numItemsLg={3} className="gap-6 mb-8">
                <Card>
                    <Text>Total de Tarefas</Text>
                    <Metric>{totalTasks}</Metric>
                </Card>
                <Card>
                    <Text>Pendentes</Text>
                    <Metric>{pendingTasks}</Metric>
                    <ProgressBar value={pendingTasks} maxValue={totalTasks || 1} color="amber" className="mt-2" />
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <Text>Concluídas (semana)</Text>
                            <Metric>{completedThisWeek}</Metric>
                        </div>
                        <BadgeDelta deltaType="increase">+{completedThisWeek}</BadgeDelta>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <Text>Vencidas</Text>
                            <Metric>{overdueTasks}</Metric>
                        </div>
                        {overdueTasks > 0 && <BadgeDelta deltaType="decrease">-{overdueTasks}</BadgeDelta>}
                    </div>
                </Card>
            </Grid>

            {/* Gráfico de área */}
            <Card>
                <Title>Atividade nos Últimos 7 Dias</Title>
                <AreaChart
                    className="mt-6 h-72"
                    data={chartData}
                    index="data"
                    categories={['Concluídas', 'Vencidas']}
                    colors={['emerald', 'rose']}
                    showAnimation
                    valueFormatter={(value: number) => `${value} tarefas`}
                />
            </Card>

            {/* Acesso rápido às views */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    href="/tasks"
                    className="p-4 bg-white rounded-lg shadow border border-gray-200 text-center hover:bg-gray-50 transition"
                >
                    <div className="font-medium text-emerald-600">Lista de Tarefas</div>
                </Link>
                <Link
                    href="/kanban"
                    className="p-4 bg-white rounded-lg shadow border border-gray-200 text-center hover:bg-gray-50 transition"
                >
                    <div className="font-medium text-emerald-600">Quadro Kanban</div>
                </Link>
                <Link
                    href="/calendar"
                    className="p-4 bg-white rounded-lg shadow border border-gray-200 text-center hover:bg-gray-50 transition"
                >
                    <div className="font-medium text-emerald-600">Calendário</div>
                </Link>
            </div>
        </div>
    );
}