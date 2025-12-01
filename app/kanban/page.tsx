'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/types';

// ✅ Dnd Kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

// ✅ Acessibilidade
import { useAccessibility } from '@/hooks/useAccessibility';
import { Card, Title, Text } from '@tremor/react';
import { Plus, GripVertical, Type } from 'lucide-react';
import Link from 'next/link';

type KanbanColumn = 'todo' | 'in-progress' | 'done';
type KanbanTask = Task & { columnId: KanbanColumn };

const COLUMN_TITLES: Record<KanbanColumn, string> = {
  todo: 'A Fazer',
  'in-progress': 'Fazendo',
  done: 'Concluído',
};

// ✅ Versão acessível das cores
const getThemeColors = (theme: string) => {
  switch (theme) {
    case 'high-contrast':
      return {
        todo: 'bg-black border-yellow-400',
        'in-progress': 'bg-black border-blue-400',
        done: 'bg-black border-emerald-400',
      };
    case 'dark':
      return {
        todo: 'bg-gray-800 border-gray-600',
        'in-progress': 'bg-gray-800 border-blue-500',
        done: 'bg-gray-800 border-emerald-500',
      };
    case 'dyslexia':
      return {
        todo: 'bg-amber-50 border-amber-200',
        'in-progress': 'bg-amber-50 border-blue-200',
        done: 'bg-amber-50 border-emerald-200',
      };
    default:
      return {
        todo: 'bg-gray-50 border-gray-200',
        'in-progress': 'bg-blue-50 border-blue-200',
        done: 'bg-emerald-50 border-emerald-200',
      };
  }
};

// ✅ Funções de estilo acessíveis
const getTextClasses = (theme: string) => {
  switch (theme) {
    case 'high-contrast': return 'text-white';
    case 'dark': return 'text-gray-100';
    case 'dyslexia': return 'text-gray-800';
    default: return 'text-gray-800';
  }
};

const getCardClasses = (theme: string) => {
  switch (theme) {
    case 'high-contrast': return 'bg-white text-black border-yellow-400';
    case 'dark': return 'bg-gray-800 text-gray-100 border-gray-700';
    case 'dyslexia': return 'bg-white text-gray-800 border-amber-200';
    default: return 'bg-white text-gray-800 border-gray-200';
  }
};

const getButtonClasses = (theme: string, type: 'primary' | 'outline' = 'outline') => {
  const base = 'px-3 py-1.5 rounded text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  if (theme === 'high-contrast') {
    return type === 'primary'
      ? `${base} bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-500 focus:ring-offset-black`
      : `${base} border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus:ring-yellow-500 focus:ring-offset-black`;
  } else if (theme === 'dark') {
    return type === 'primary'
      ? `${base} bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900`
      : `${base} border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-900`;
  } else if (theme === 'dyslexia') {
    return type === 'primary'
      ? `${base} bg-amber-600 text-white hover:bg-amber-500 focus:ring-amber-500`
      : `${base} border-amber-300 text-amber-700 hover:bg-amber-100 focus:ring-amber-400`;
  } else {
    return type === 'primary'
      ? `${base} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500`
      : `${base} border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-500`;
  }
};

// ✅ ✅ ✅ COMPONENTE DROPPABLE ACESSÍVEL
function KanbanColumnContainer({
  id,
  children,
  title,
  theme,
  taskCount,
}: {
  id: KanbanColumn;
  children: React.ReactNode;
  title: string;
  theme: string;
  taskCount: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const colors = getThemeColors(theme);
  const textColor = getTextClasses(theme);

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-0 ${colors[id]} rounded-xl p-4 transition-all ${
        isOver 
          ? theme === 'high-contrast'
            ? 'ring-4 ring-yellow-400 bg-yellow-900/20' 
            : 'ring-2 ring-emerald-400 bg-emerald-50'
          : ''
      }`}
      role="region"
      aria-label={`${title}, ${taskCount} tarefas`}
      aria-dropeffect="move"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-bold text-lg ${textColor}`}>
          {title}
        </h2>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          theme === 'high-contrast' 
            ? 'bg-yellow-400 text-black' 
            : 'bg-white text-gray-600'
        }`}>
          {taskCount}
        </span>
      </div>
      
      <div 
        className="space-y-3 min-h-[120px]"
        role="list"
        aria-label={`Tarefas em ${title}`}
      >
        {children}
        {taskCount === 0 && (
          <div 
            className={`text-center py-6 rounded-lg ${
              theme === 'high-contrast' 
                ? 'bg-black border-2 border-dashed border-yellow-400' 
                : 'bg-gray-100 border-2 border-dashed border-gray-300'
            }`}
            aria-label="Área vazia para soltar tarefas"
          >
            <div className="text-3xl mb-2" aria-hidden="true">⬇️</div>
            <p className={`text-sm ${theme === 'high-contrast' ? 'text-yellow-300' : 'text-gray-500'}`}>
              Solte tarefas aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ ✅ ✅ SORTABLE TASK ACESSÍVEL
function SortableTask({ task, theme }: { task: KanbanTask; theme: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const cardClasses = getCardClasses(theme);
  const textColor = getTextClasses(theme);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg shadow-sm p-4 mb-3 cursor-move transition-all ${
        isDragging 
          ? theme === 'high-contrast'
            ? 'ring-4 ring-yellow-400 scale-105 bg-yellow-400/10' 
            : 'ring-2 ring-emerald-500 scale-[1.02] bg-emerald-50'
          : ''
      } ${cardClasses}`}
      {...attributes}
      role="listitem"
      aria-label={`Tarefa: ${task.title}, prioridade ${task.priority}, status ${task.status}`}
      aria-grabbed={isDragging}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          (e.target as HTMLElement).focus();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <button
          {...listeners}
          className={`p-1.5 rounded ${
            theme === 'high-contrast'
              ? 'text-yellow-300 hover:bg-yellow-400 hover:text-black'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
          aria-label="Pressione para mover esta tarefa"
          title="Mover tarefa (arraste ou pressione Enter para ativar)"
        >
          <GripVertical size={18} aria-hidden="true" />
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${textColor} truncate`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`text-sm mt-1 line-clamp-2 ${
              theme === 'high-contrast' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          
          <div className="mt-3 flex flex-wrap gap-1.5">
            {/* Prioridade acessível */}
            <span 
              className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                task.priority === 'high'
                  ? theme === 'high-contrast'
                    ? 'bg-red-500 text-black'
                    : 'bg-red-100 text-red-800'
                  : task.priority === 'medium'
                    ? theme === 'high-contrast'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-amber-100 text-amber-900'
                    : theme === 'high-contrast'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-emerald-100 text-emerald-800'
              }`}
              aria-label={`Prioridade: ${task.priority === 'high' ? 'alta' : task.priority === 'medium' ? 'média' : 'baixa'}`}
            >
              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
            </span>

            {/* Status acessível */}
            <span 
              className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                task.status === 'done'
                  ? theme === 'high-contrast'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-emerald-100 text-emerald-800'
                  : theme === 'high-contrast'
                    ? 'bg-gray-500 text-black'
                    : 'bg-gray-100 text-gray-700'
              }`}
              aria-label={`Status: ${task.status === 'done' ? 'concluída' : 'pendente'}`}
            >
              {task.status === 'done' ? 'Concluída' : 'Pendente'}
            </span>

            {/* Data de vencimento */}
            {task.dueDate && (
              <span 
                className={`px-2 py-0.5 text-xs rounded-full ${
                  theme === 'high-contrast'
                    ? 'bg-blue-500 text-black'
                    : 'bg-blue-100 text-blue-800'
                }`}
                aria-label={`Vence em: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}`}
              >
                📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ PÁGINA PRINCIPAL COM ACESSIBILIDADE
export default function KanbanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // ✅ Acessibilidade
  const { theme, fontSize, reducedMotion } = useAccessibility();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragActiveTask, setDragActiveTask] = useState<KanbanTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event) => {
        // Suporte a teclado para DnD
        if (event.code === 'Space' || event.code === 'Enter') {
          return { x: 0, y: 0 };
        }
        return undefined;
      },
    })
  );

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const tasksList = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Task[];

      setTasks(tasksList);

      const kanbanTasks: KanbanTask[] = tasksList
        .filter((t) => t.inKanban === true)
        .map((t) => ({
          ...t,
          columnId:
            t.status === 'in-progress'
              ? 'in-progress'
              : t.status === 'done'
              ? 'done'
              : 'todo',
        }));

      const availableTasks = tasksList.filter((t) => t.inKanban !== true);

      setKanbanTasks(kanbanTasks);
      setAvailableTasks(availableTasks);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ✅ Atualização com acessibilidade
  const updateTaskColumn = async (taskId: string, newColumn: KanbanColumn) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const newStatus =
        newColumn === 'todo'
          ? 'todo'
          : newColumn === 'in-progress'
          ? 'in-progress'
          : 'done';

      await updateDoc(taskRef, {
        status: newStatus,
        inKanban: true,
      });

      setKanbanTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, columnId: newColumn, status: newStatus } : t
        )
      );

      // ✅ Anúncio para leitores de tela
      if (typeof window !== 'undefined') {
        const announcement = document.getElementById('a11y-announcement');
        if (announcement) {
          announcement.textContent = `Tarefa movida para ${COLUMN_TITLES[newColumn]}`;
          setTimeout(() => {
            if (announcement) announcement.textContent = '';
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
    }
  };

  const handleDragStart = (event: any) => {
    const taskId = event.active.id;
    const task = kanbanTasks.find((t) => t.id === taskId);
    if (task) {
      setDragActiveTask(task);
      
      // ✅ Anúncio para leitores de tela
      if (typeof window !== 'undefined') {
        const announcement = document.getElementById('a11y-announcement');
        if (announcement) {
          announcement.textContent = `Movendo tarefa: ${task.title}`;
        }
      }
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setDragActiveTask(null);

    if (!over) return;
    if (active.id === over.id) return;

    if (['todo', 'in-progress', 'done'].includes(over.id)) {
      const newColumn = over.id as KanbanColumn;
      const task = kanbanTasks.find((t) => t.id === active.id);
      if (task && task.columnId !== newColumn) {
        updateTaskColumn(active.id, newColumn);
      }
      return;
    }
  };

  const addToKanban = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        inKanban: true,
        status: 'todo',
      });

      const newKanbanTask: KanbanTask = {
        ...task,
        inKanban: true,
        columnId: 'todo',
        status: 'todo',
      };
      setKanbanTasks((prev) => {
        if (prev.some((t) => t.id === task.id)) return prev;
        return [...prev, newKanbanTask];
      });
      setAvailableTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      console.error('Erro ao adicionar tarefa ao Kanban:', err);
    }
  };

  // ✅ Classes de fonte
  const fontSizeClasses = {
    normal: '',
    large: 'text-lg',
    xlarge: 'text-xl',
  };

  const pageBgClasses = {
    'high-contrast': 'bg-black',
    dark: 'bg-gray-900',
    dyslexia: 'bg-amber-50',
    default: 'bg-gray-50',
  };

  if (authLoading || loading) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center ${pageBgClasses[theme as keyof typeof pageBgClasses]}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center">
          <div 
            className={`w-10 h-10 border-4 border-t-transparent rounded-full ${
              theme === 'high-contrast' 
                ? 'border-yellow-400' 
                : 'border-emerald-500'
            } ${
              reducedMotion ? '' : 'animate-spin'
            }`}
            aria-hidden="true"
          />
          <span className={`mt-4 ${fontSizeClasses[fontSize]} ${
            theme === 'high-contrast' ? 'text-white' : 'text-gray-700'
          }`}>
            Carregando quadro Kanban...
          </span>
        </div>
      </div>
    );
  }

  // Agrupa por coluna
  const columns: Record<KanbanColumn, KanbanTask[]> = {
    todo: kanbanTasks.filter((t) => t.columnId === 'todo'),
    'in-progress': kanbanTasks.filter((t) => t.columnId === 'in-progress'),
    done: kanbanTasks.filter((t) => t.columnId === 'done'),
  };

  return (
    <div 
      className={`min-h-screen p-4 md:p-6 transition-colors duration-300 ${
        pageBgClasses[theme as keyof typeof pageBgClasses]
      } ${fontSizeClasses[fontSize]}`}
      role="main"
      aria-label="Quadro Kanban de tarefas"
    >
      {/* ✅ Região de anúncio para leitores de tela */}
      <div 
        id="a11y-announcement" 
        aria-live="assertive" 
        className="sr-only"
        aria-atomic="true"
      ></div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${
            theme === 'high-contrast' ? 'text-white' : 'text-gray-900'
          }`}>
            Quadro Kanban
          </h1>
          <p className={`mt-1 ${
            theme === 'high-contrast' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Arraste tarefas entre as colunas ou adicione da lista lateral.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/tasks"
            className={getButtonClasses(theme, 'primary')}
            aria-label="Criar nova tarefa"
          >
            + Nova Tarefa
          </Link>
          <Link
            href="/dashboard"
            className={getButtonClasses(theme)}
            aria-label="Voltar ao Dashboard"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ✅ Lista lateral acessível */}
        <Card 
          className={`lg:order-last rounded-xl ${
            theme === 'high-contrast' 
              ? 'bg-black border-yellow-400 text-white' 
              : theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-100'
                : theme === 'dyslexia'
                  ? 'bg-amber-50 border-amber-200 text-gray-800'
                  : 'bg-white border-gray-200 text-gray-800'
          }`}
          aria-label="Tarefas disponíveis para adicionar ao quadro"
        >
          <div className="flex items-center justify-between mb-4">
            <Title className={getTextClasses(theme)}>Tarefas Disponíveis</Title>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              theme === 'high-contrast' 
                ? 'bg-yellow-400 text-black' 
                : 'bg-white text-gray-600'
            }`}>
              {availableTasks.length}
            </span>
          </div>
          
          {availableTasks.length === 0 ? (
            <Text className={theme === 'high-contrast' ? 'text-gray-300' : 'text-gray-500'}>
              Nenhuma tarefa disponível. Crie uma nova.
            </Text>
          ) : (
            <div 
              className="space-y-3 max-h-[600px] overflow-y-auto pr-1"
              role="list"
              aria-label="Lista de tarefas disponíveis"
            >
              {availableTasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-lg p-3 ${
                    theme === 'high-contrast' 
                      ? 'bg-black border-2 border-yellow-400' 
                      : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600'
                        : theme === 'dyslexia'
                          ? 'bg-white border-amber-100'
                          : 'bg-gray-100 border-gray-200'
                  }`}
                  role="listitem"
                  aria-label={`Tarefa: ${task.title}`}
                >
                  <h3 
                    className={`font-medium truncate ${
                      theme === 'high-contrast' ? 'text-yellow-300' : 'text-gray-800'
                    }`}
                  >
                    {task.title}
                  </h3>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => addToKanban(task)}
                      className={getButtonClasses(theme, 'primary')}
                      aria-label={`Adicionar tarefa "${task.title}" ao quadro Kanban`}
                    >
                      <Plus size={14} aria-hidden="true" className="mr-1" />
                      Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ✅ Quadro Kanban com DnD acessível */}
        <div className="lg:col-span-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(['todo', 'in-progress', 'done'] as KanbanColumn[]).map((colId) => (
                <KanbanColumnContainer
                  key={colId}
                  id={colId}
                  title={COLUMN_TITLES[colId]}
                  theme={theme}
                  taskCount={columns[colId].length}
                >
                  <SortableContext
                    items={columns[colId].map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columns[colId].map((task) => (
                      <SortableTask 
                        key={task.id} 
                        task={task} 
                        theme={theme} 
                      />
                    ))}
                  </SortableContext>
                </KanbanColumnContainer>
              ))}
            </div>

            {/* ✅ Drag Overlay acessível */}
            <DragOverlay 
              dropAnimation={reducedMotion ? null : undefined}
            >
              {dragActiveTask ? (
                <div 
                  className={`rounded-lg shadow-xl p-4 w-64 mx-auto ${
                    theme === 'high-contrast'
                      ? 'bg-black border-4 border-yellow-400 text-yellow-300'
                      : theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-gray-100'
                        : theme === 'dyslexia'
                          ? 'bg-white border-amber-200 text-gray-800'
                          : 'bg-white border-gray-200 text-gray-800'
                  }`}
                  role="status"
                  aria-label={`Arrastando: ${dragActiveTask.title}. Solte em uma coluna para mover.`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical size={16} aria-hidden="true" />
                    <h3 className="font-medium truncate">
                      {dragActiveTask.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      theme === 'high-contrast' 
                        ? 'bg-yellow-500 text-black' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Arrastando...
                    </span>
                  </div>
                  <p className={`text-xs mt-2 ${
                    theme === 'high-contrast' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Pressione Esc para cancelar
                  </p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* ✅ Botão de acessibilidade flutuante */}
      <button
        onClick={() => {
          // Simula atalho Ctrl+K para abrir configurações
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