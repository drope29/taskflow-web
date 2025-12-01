'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { X, Calendar, Type, Contrast, Sun, Moon } from 'lucide-react';

// ✅ Acessibilidade
import { useAccessibility } from '@/hooks/useAccessibility';

// Tipagem para o evento do FullCalendar
interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
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

    // ✅ Acessibilidade
    const { theme, fontSize, reducedMotion } = useAccessibility();

    // Redireciona se não autenticado
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Carrega tarefas com data de vencimento
    const fetchTasks = useCallback(async () => {
        if (!user) return;
        setLoading(true);
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
    }, [user]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // ✅ Cores por tema e prioridade
    const getPriorityColors = (priority: string) => {
        switch (theme) {
            case 'high-contrast':
                return {
                    high: { bg: '#FF0000', text: '#000000', border: '#FF0000' }, // vermelho + preto
                    medium: { bg: '#FFFF00', text: '#000000', border: '#FFFF00' }, // amarelo + preto
                    low: { bg: '#00FF00', text: '#000000', border: '#00FF00' }, // verde + preto
                };
            case 'dark':
                return {
                    high: { bg: '#EF4444', text: '#FFFFFF', border: '#B91C1C' }, // red-500
                    medium: { bg: '#F59E0B', text: '#FFFFFF', border: '#B45309' }, // amber-500
                    low: { bg: '#10B981', text: '#FFFFFF', border: '#059669' }, // emerald-500
                };
            case 'dyslexia':
                return {
                    high: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' }, // red-100
                    medium: { bg: '#FEF9C3', text: '#B45309', border: '#FDE68A' }, // amber-100
                    low: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' }, // emerald-50
                };
            default:
                return {
                    high: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
                    medium: { bg: '#FEF9C3', text: '#B45309', border: '#FDE68A' },
                    low: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
                };
        }
    };

    // Formata tarefas para eventos do FullCalendar com cores acessíveis
    const calendarEvents = tasks
        .filter(task => task.dueDate)
        .map(task => {
            const colors = getPriorityColors(task.priority);
            const color = colors[task.priority as 'high' | 'medium' | 'low'] || colors.low;
            
            return {
                id: task.id,
                title: task.title,
                date: task.dueDate,
                backgroundColor: color.bg,
                textColor: color.text,
                borderColor: color.border,
                extendedProps: {
                    task,
                },
                // ✅ Acessibilidade para eventos
                classNames: ['focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2'],
                ariaLabel: `${task.title}, prioridade ${task.priority}, vence em ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'sem data'}`,
            };
        }) as CalendarEvent[];

    // Fecha o modal
    const closeModal = () => {
        setSelectedTask(null);
    };

    // ✅ Funções de estilo acessível
    const getThemeClasses = () => {
        switch (theme) {
            case 'high-contrast': return 'bg-black text-white';
            case 'dark': return 'bg-gray-900 text-gray-100';
            case 'dyslexia': return 'bg-amber-50 text-gray-800';
            default: return 'bg-gray-50 text-gray-900';
        }
    };

    const getCardClasses = () => {
        switch (theme) {
            case 'high-contrast': return 'bg-white text-black border-yellow-400';
            case 'dark': return 'bg-gray-800 text-gray-100 border-gray-700';
            case 'dyslexia': return 'bg-white text-gray-800 border-amber-200';
            default: return 'bg-white text-gray-900 border-gray-200';
        }
    };

    const getButtonClasses = (type: 'primary' | 'secondary' | 'danger' | 'outline') => {
        const base = 'px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2';
        
        if (theme === 'high-contrast') {
            switch (type) {
                case 'primary': return `${base} bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-500 focus:ring-offset-black`;
                case 'secondary': return `${base} bg-gray-300 text-black hover:bg-gray-400 focus:ring-gray-500 focus:ring-offset-black`;
                case 'danger': return `${base} bg-red-400 text-black hover:bg-red-500 focus:ring-red-500 focus:ring-offset-black`;
                case 'outline': return `${base} border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus:ring-yellow-500 focus:ring-offset-black`;
            }
        } else if (theme === 'dark') {
            switch (type) {
                case 'primary': return `${base} bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900`;
                case 'secondary': return `${base} bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500 focus:ring-offset-gray-900`;
                case 'danger': return `${base} bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 focus:ring-offset-gray-900`;
                case 'outline': return `${base} border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-900`;
            }
        } else if (theme === 'dyslexia') {
            switch (type) {
                case 'primary': return `${base} bg-amber-600 text-white hover:bg-amber-500 focus:ring-amber-500`;
                case 'secondary': return `${base} bg-amber-200 text-amber-800 hover:bg-amber-300 focus:ring-amber-400`;
                case 'danger': return `${base} bg-red-500 text-white hover:bg-red-600 focus:ring-red-500`;
                case 'outline': return `${base} border-amber-300 text-amber-700 hover:bg-amber-100 focus:ring-amber-400`;
            }
        } else {
            switch (type) {
                case 'primary': return `${base} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500`;
                case 'secondary': return `${base} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500`;
                case 'danger': return `${base} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
                case 'outline': return `${base} border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-500`;
            }
        }
    };

    const getTextClasses = () => {
        switch (theme) {
            case 'high-contrast': return 'text-white';
            case 'dark': return 'text-gray-100';
            case 'dyslexia': return 'text-gray-800';
            default: return 'text-gray-900';
        }
    };

    const getSecondaryTextClasses = () => {
        switch (theme) {
            case 'high-contrast': return 'text-gray-300';
            case 'dark': return 'text-gray-400';
            case 'dyslexia': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const fontSizeClasses = {
        normal: '',
        large: 'text-lg',
        xlarge: 'text-xl',
    };

    if (authLoading || loading) {
        return (
            <div 
                className={`min-h-screen flex items-center justify-center ${getThemeClasses()}`}
                role="status"
                aria-live="polite"
            >
                <div className="flex flex-col items-center">
                    <div 
                        className={`w-8 h-8 border-4 border-t-transparent rounded-full ${
                            theme === 'high-contrast' 
                                ? 'border-yellow-400' 
                                : 'border-emerald-500'
                        } ${
                            reducedMotion ? '' : 'animate-spin'
                        }`}
                        aria-hidden="true"
                    />
                    <span className={`mt-4 ${fontSizeClasses[fontSize]} ${getTextClasses()}`}>
                        Carregando calendário...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`min-h-screen p-4 md:p-6 transition-colors duration-300 ${getThemeClasses()} ${fontSizeClasses[fontSize]}`}
            role="main"
            aria-label="Calendário de tarefas"
        >
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${getTextClasses()}`}>
                        <Calendar className="inline mr-2 h-6 w-6" aria-hidden="true" />
                        Meu Calendário
                    </h1>
                    <p className={`${getSecondaryTextClasses()}`}>
                        Visualize suas tarefas por data de vencimento.
                    </p>
                </div>
                <Link
                    href="/dashboard"
                    className={getButtonClasses('outline')}
                    aria-label="Voltar ao Dashboard"
                >
                    ← Voltar ao Dashboard
                </Link>
            </div>

            <div className={`rounded-lg shadow overflow-hidden ${getCardClasses()}`} role="region" aria-label="Calendário mensal">
                {/* FullCalendar com acessibilidade */}
                {(() => {
                    const FullCalendarComponent = FullCalendar as any;
                    return (
                        <FullCalendarComponent
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={calendarEvents}
                            locale="pt-br"
                            height="auto"
                            // ✅ Acessibilidade para FullCalendar
                            themeSystem="standard"
                            firstDay={1} // Segunda-feira primeiro (BR)
                            weekNumbers={theme !== 'high-contrast'} // Desativa em alto contraste
                            weekNumberClassNames={['text-xs', theme === 'high-contrast' ? 'text-yellow-400' : 'text-gray-400']}
                            // ✅ Eventos acessíveis
                            eventClick={(info: any) => {
                                const task = info.event.extendedProps?.task as Task;
                                setSelectedTask(task);
                                // ✅ Anúncio para leitores de tela
                                if (typeof window !== 'undefined') {
                                    const announcement = document.getElementById('a11y-announcement');
                                    if (announcement) {
                                        announcement.textContent = `Tarefa selecionada: ${task.title}`;
                                    }
                                }
                            }}
                            // ✅ Navegação por teclado
                            handleWindowResize={true}
                            // ✅ Toolbar acessível
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,dayGridWeek,dayGridDay',
                            }}
                            buttonText={{
                                today: 'Hoje',
                                month: 'Mês',
                                week: 'Semana',
                                day: 'Dia',
                                prev: 'Anterior',
                                next: 'Próximo',
                            }}
                            // ✅ Estilos acessíveis
                            dayHeaderClassNames={['font-medium', theme === 'high-contrast' ? 'text-yellow-300' : 'text-gray-700']}
                            dayCellClassNames={['focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2']}
                        />
                    );
                })()}
            </div>

            {/* ✅ Região de anúncio para leitores de tela */}
            <div 
                id="a11y-announcement" 
                aria-live="polite" 
                className="sr-only"
            ></div>

            {/* Modal de Detalhes da Tarefa */}
            {selectedTask && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') closeModal();
                    }}
                >
                    <div 
                        className={`rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto ${getCardClasses()}`}
                        role="document"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 
                                    id="modal-title" 
                                    className={`text-xl font-bold ${getTextClasses()}`}
                                >
                                    {selectedTask.title}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className={`p-1 rounded ${
                                        theme === 'high-contrast'
                                            ? 'text-yellow-300 hover:bg-yellow-400 hover:text-black'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                    aria-label="Fechar detalhes da tarefa"
                                >
                                    <X size={24} aria-hidden="true" />
                                </button>
                            </div>

                            {selectedTask.description && (
                                <p 
                                    id="modal-description"
                                    className={`${getSecondaryTextClasses()} mb-4`}
                                >
                                    {selectedTask.description}
                                </p>
                            )}

                            {selectedTask.dueDate && (
                                <p className={`text-sm ${getSecondaryTextClasses()} mb-2`}>
                                    <strong className={`${getTextClasses()}`}>Vencimento:</strong>{' '}
                                    <time dateTime={selectedTask.dueDate}>
                                        {new Date(selectedTask.dueDate).toLocaleDateString('pt-BR')}
                                    </time>
                                </p>
                            )}

                            <p className={`text-sm ${getSecondaryTextClasses()} mb-4`}>
                                <strong className={`${getTextClasses()}`}>Prioridade:</strong>{' '}
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                        selectedTask.priority === 'high'
                                            ? theme === 'high-contrast'
                                                ? 'bg-red-500 text-black'
                                                : 'bg-red-100 text-red-800'
                                            : selectedTask.priority === 'medium'
                                                ? theme === 'high-contrast'
                                                    ? 'bg-yellow-500 text-black'
                                                    : 'bg-amber-100 text-amber-900'
                                                : theme === 'high-contrast'
                                                    ? 'bg-emerald-500 text-black'
                                                    : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                    aria-label={`Prioridade: ${selectedTask.priority === 'high' ? 'alta' : selectedTask.priority === 'medium' ? 'média' : 'baixa'}`}
                                >
                                    {selectedTask.priority === 'high' ? 'Alta' : selectedTask.priority === 'medium' ? 'Média' : 'Baixa'}
                                </span>
                            </p>

                            {selectedTask.subtasks.length > 0 && (
                                <div className="mt-4">
                                    <h3 className={`font-medium ${getTextClasses()} mb-2`}>Sub-tarefas:</h3>
                                    <ul 
                                        className="space-y-2"
                                        role="list"
                                        aria-label="Lista de sub-tarefas"
                                    >
                                        {selectedTask.subtasks.map((st) => (
                                            <li 
                                                key={st.id} 
                                                className="flex items-start gap-3"
                                                role="listitem"
                                            >
                                                <span
                                                    className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 ${
                                                        st.completed 
                                                            ? theme === 'high-contrast'
                                                                ? 'bg-yellow-400'
                                                                : 'bg-emerald-500'
                                                            : theme === 'high-contrast'
                                                                ? 'bg-gray-500'
                                                                : 'bg-gray-300'
                                                    }`}
                                                    role="img"
                                                    aria-label={st.completed ? 'Concluída' : 'Pendente'}
                                                />
                                                <span 
                                                    className={`${
                                                        st.completed 
                                                            ? theme === 'high-contrast'
                                                                ? 'text-gray-300 line-through'
                                                                : 'text-gray-500 line-through'
                                                            : getTextClasses()
                                                    }`}
                                                >
                                                    {st.title}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="px-6 pb-6 flex flex-wrap gap-3">
                            <Link
                                href={`/tasks`}
                                onClick={closeModal}
                                className={getButtonClasses('primary')}
                                aria-label={`Editar tarefa: ${selectedTask.title}`}
                            >
                                <Edit3 size={16} className="mr-1" aria-hidden="true" />
                                Editar Tarefa
                            </Link>
                            <button
                                onClick={closeModal}
                                className={getButtonClasses('secondary')}
                                aria-label="Fechar detalhes"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Botão de acessibilidade flutuante */}
            <button
                onClick={() => {
                    // Simula atalho Ctrl+K
                    const event = new KeyboardEvent('keydown', {
                        key: 'k',
                        ctrlKey: true,
                        bubbles: true
                    });
                    document.dispatchEvent(event);
                }}
                className="fixed bottom-4 right-4 z-40 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                aria-label="Configurações de acessibilidade (Ctrl+K)"
                title="Acessibilidade"
            >
                <Type size={20} aria-hidden="true" />
                <span className="sr-only">Acessibilidade</span>
            </button>
        </div>
    );
}

// ✅ Import necessário para o ícone de edição
import { Edit3 } from 'lucide-react';