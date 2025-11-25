// app/calendar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/types';
import FullCalendar from '@fullcalendar/react';
// avoid importing calendar core types directly to reduce build-time type-resolution issues
import type { ComponentType } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

// Tipagem para o evento do FullCalendar
interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    extendedProps?: {
        task: Task;
    };
}

export default function CalendarPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Redireciona se não autenticado
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Carrega tarefas com data de vencimento
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

    // Formata tarefas para eventos do FullCalendar
    const calendarEvents = tasks
        .filter(task => task.dueDate)
        .map(task => ({
            id: task.id,
            title: task.title,
            date: task.dueDate, // Formato ISO aceito pelo FullCalendar
            extendedProps: {
                task,
            },
        })) as CalendarEvent[];

    // Fecha o modal
    const closeModal = () => {
        setSelectedTask(null);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600">Carregando calendário...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Meu Calendário</h1>
                <Link
                    href="/dashboard"
                    className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                >
                    ← Voltar ao Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* FullCalendar's type definitions aren't always seen as a JSX component by TS;
                    coerce its type to a React component for proper JSX typing. */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(() => {
                    const FullCalendarComponent = FullCalendar as unknown as ComponentType<any>;
                    return (
                        <FullCalendarComponent
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={calendarEvents}
                            locale="pt-br"
                            height="auto"
                            eventClick={(info: any) => {
                                const task = info.event.extendedProps?.task as Task;
                                setSelectedTask(task);
                            }}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,dayGridWeek,dayGridDay',
                            }}
                            buttonText={{
                                today: 'Hoje',
                            }}
                        />
                    );
                })()}
                
            </div>

            {/* Modal de Detalhes da Tarefa */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{selectedTask.title}</h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {selectedTask.description && (
                                <p className="text-gray-700 mb-4">{selectedTask.description}</p>
                            )}

                            {selectedTask.dueDate && (
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Vencimento:</strong> {new Date(selectedTask.dueDate).toLocaleDateString('pt-BR')}
                                </p>
                            )}

                            <p className="text-sm text-gray-600 mb-4">
                                <strong>Prioridade:</strong>{' '}
                                <span
                                    className={`px-2 py-1 rounded text-xs ${selectedTask.priority === 'high'
                                            ? 'bg-red-100 text-red-800'
                                            : selectedTask.priority === 'medium'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}
                                >
                                    {selectedTask.priority === 'high' ? 'Alta' : selectedTask.priority === 'medium' ? 'Média' : 'Baixa'}
                                </span>
                            </p>

                            {selectedTask.subtasks.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-medium text-gray-900 mb-2">Sub-tarefas:</h3>
                                    <ul className="space-y-1">
                                        {selectedTask.subtasks.map((st) => (
                                            <li key={st.id} className="flex items-start gap-2 text-sm">
                                                <span
                                                    className={`mt-1 w-2 h-2 rounded-full ${st.completed ? 'bg-emerald-500' : 'bg-gray-300'
                                                        }`}
                                                />
                                                <span className={st.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                                                    {st.title}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="px-6 pb-6 flex justify-end">
                            <Link
                                href={`/tasks`}
                                onClick={closeModal}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
                            >
                                Editar Tarefa
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}