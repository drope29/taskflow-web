'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task, Subtask } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Check, Edit3, Type, Contrast, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

// ✅ Hook de acessibilidade
import { useAccessibility } from '@/hooks/useAccessibility';

// Schema de validação
const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório.'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: uuidv4(), title: '', completed: false },
  ]);

  // ✅ Acessibilidade
  const { theme, fontSize, reducedMotion } = useAccessibility();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'low' },
  });

  // Redirect se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const tasksList = snapshot.docs.map((d) => {
        const data = d.data() as DocumentData;
        return {
          id: d.id,
          userId: data.userId,
          title: data.title || '',
          description: data.description || '',
          dueDate: data.dueDate || '',
          priority: data.priority || 'low',
          status: data.status || 'todo',
          inKanban: data.inKanban ?? false,
          subtasks: Array.isArray(data.subtasks)
            ? data.subtasks.map((st: any) => ({
                id: String(st.id ?? uuidv4()),
                title: String(st.title ?? ''),
                completed: Boolean(st.completed ?? false),
              }))
            : [],
        } as Task;
      });
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

  // ✅ Correção: Reset limpo + atualização segura ao editar
  useEffect(() => {
    if (editingTaskId) {
      const t = tasks.find((x) => x.id === editingTaskId);
      if (t) {
        reset({ 
          title: t.title,
          description: t.description || '',
          dueDate: t.dueDate || '',
          priority: t.priority as any,
        });
        
        const st = t.subtasks && t.subtasks.length > 0 
          ? t.subtasks 
          : [{ id: uuidv4(), title: '', completed: false }];
        
        setTimeout(() => setSubtasks(st), 0);
        
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    } else {
      reset({ priority: 'low' });
      setSubtasks([{ id: uuidv4(), title: '', completed: false }]);
    }
  }, [editingTaskId, tasks, reset, reducedMotion]);

  // ✅ Remover subtasks vazias automaticamente
  const cleanupEmptySubtasks = useCallback(() => {
    setSubtasks(prev => 
      prev.filter(st => st.title.trim() !== '')
        .map(st => ({ ...st, title: st.title.trim() }))
    );
  }, []);

  // Handlers de subtasks
  const addSubtask = () => {
    cleanupEmptySubtasks();
    setSubtasks(s => [...s, { id: uuidv4(), title: '', completed: false }]);
  };

  const removeSubtask = (id: string) => {
    setSubtasks(s => s.filter(st => st.id !== id));
  };

  const updateSubtaskLocal = (id: string, field: keyof Subtask, value: string | boolean) => {
    setSubtasks(s => s.map(st => st.id === id ? { ...st, [field]: value } : st));
  };

  const calculateProgress = (subtasksArr?: Subtask[]) => {
    const st = Array.isArray(subtasksArr) ? subtasksArr : [];
    if (st.length === 0) return 0;
    const completed = st.filter(x => x.completed).length;
    return Math.round((completed / st.length) * 100);
  };

  // ✅ Classes dinâmicas de acessibilidade
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
      case 'high-contrast': return 'bg-white text-black border-white';
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

  const getInputBorderClasses = () => {
    switch (theme) {
      case 'high-contrast': return 'border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500';
      case 'dark': return 'border-gray-600 bg-gray-700 focus:ring-emerald-500 focus:border-emerald-500';
      case 'dyslexia': return 'border-amber-300 focus:ring-amber-500 focus:border-amber-500';
      default: return 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500';
    }
  };

  const fontSizeClasses = {
    normal: '',
    large: 'text-lg',
    xlarge: 'text-xl',
  };

  // ✅ onSubmit com acessibilidade
  const onSubmit = async (data: TaskFormData) => {
    if (!user) return;

    cleanupEmptySubtasks();
    
    const cleanedSubtasks = subtasks
      .map(st => ({ ...st, title: st.title.trim() }))
      .filter(st => st.title.length > 0);

    const newStatus = cleanedSubtasks.length > 0 && cleanedSubtasks.every(s => s.completed) 
      ? 'done' 
      : 'todo';

    try {
      if (editingTaskId) {
        const taskRef = doc(db, 'tasks', editingTaskId);
        await updateDoc(taskRef, {
          title: data.title,
          description: data.description || '',
          dueDate: data.dueDate || '',
          priority: data.priority,
          subtasks: cleanedSubtasks,
          status: newStatus,
        });
        setTasks(prev =>
          prev.map(t =>
            t.id === editingTaskId
              ? { ...t, ...data, subtasks: cleanedSubtasks, status: newStatus }
              : t
          )
        );
        setEditingTaskId(null);
      } else {
        const newTask: Omit<Task, 'id'> = {
          userId: user.uid,
          title: data.title,
          description: data.description || '',
          dueDate: data.dueDate || '',
          priority: data.priority,
          status: newStatus,
          inKanban: false,
          subtasks: cleanedSubtasks,
        };
        const docRef = await addDoc(collection(db, 'tasks'), newTask);
        setTasks(prev => [...prev, { ...newTask, id: docRef.id } as Task]);
      }

      reset({ priority: 'low' });
      setSubtasks([{ id: uuidv4(), title: '', completed: false }]);
    } catch (err) {
      console.error('Erro ao salvar tarefa:', err);
    }
  };

  // Deletar
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
      setTasks(prev => prev.filter(t => t.id !== id));
      if (editingTaskId === id) {
        setEditingTaskId(null);
      }
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
    }
  };

  // Toggle subtask
  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const newStatus = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed)
      ? 'done'
      : 'todo';

    try {
      await updateDoc(doc(db, 'tasks', taskId), { subtasks: updatedSubtasks, status: newStatus });
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, subtasks: updatedSubtasks, status: newStatus } : t)
      );
    } catch (err) {
      console.error('Erro ao atualizar subtask:', err);
    }
  };

  // Toggle task status
  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let newStatus: 'todo' | 'done';
    
    if (task.status === 'done') {
      newStatus = 'todo';
    } else {
      if (task.subtasks.length === 0 || task.subtasks.every(s => s.completed)) {
        newStatus = 'done';
      } else {
        if (!confirm('Esta tarefa tem subtasks pendentes. Deseja marcá-la como concluída mesmo assim?')) {
          return;
        }
        newStatus = 'done';
      }
    }

    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      );
    } catch (err) {
      console.error('Erro ao atualizar status da tarefa:', err);
    }
  };

  // Ordenação inteligente
  const sortedTasks = [...tasks].sort((a, b) => {
    const prioOrder = { high: 3, medium: 2, low: 1 };
    if (a.priority !== b.priority) return prioOrder[b.priority] - prioOrder[a.priority];
    
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    if (dateA !== dateB) return dateA - dateB;
    
    if (a.status !== b.status) return a.status === 'done' ? 1 : -1;
    
    return 0;
  });

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
                : theme === 'dark' 
                  ? 'border-emerald-500' 
                  : 'border-emerald-500'
            } ${
              reducedMotion ? '' : 'animate-spin'
            }`}
            aria-hidden="true"
          />
          <span className={`mt-4 ${fontSizeClasses[fontSize]} ${getTextClasses()}`}>
            Carregando tarefas...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen p-4 md:p-6 transition-colors duration-300 ${getThemeClasses()} ${fontSizeClasses[fontSize]}`}
      role="main"
      aria-label="Gerenciamento de tarefas"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${getTextClasses()}`}>
            Minhas Tarefas
          </h1>
          <p className={`${getSecondaryTextClasses()}`}>
            Gerencie suas tarefas com prioridade e subtasks.
          </p>
        </div>
        <Link 
          href="/dashboard" 
          className={`${getButtonClasses('outline')} text-sm`}
          aria-label="Voltar ao Dashboard"
        >
          ← Voltar ao Dashboard
        </Link>
      </div>

      {/* Formulário */}
      <div className={`rounded-lg shadow mb-8 p-6 ${getCardClasses()}`} role="form" aria-label="Formulário de tarefa">
        <h2 className={`text-lg font-semibold mb-4 ${getTextClasses()}`}>
          {editingTaskId ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="title" className={`block text-sm font-medium mb-1 ${getSecondaryTextClasses()}`}>
              Título *
            </label>
            <input
              id="title"
              {...register('title')}
              placeholder="Título da tarefa"
              className={`w-full px-4 py-2.5 rounded-lg outline-none ${getInputBorderClasses()} ${
                theme === 'dark' ? 'bg-gray-700' : ''
              } ${getTextClasses()}`}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className={`block text-sm font-medium mb-1 ${getSecondaryTextClasses()}`}>
              Descrição
            </label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Descrição (opcional)"
              rows={2}
              className={`w-full px-4 py-2.5 rounded-lg outline-none ${getInputBorderClasses()} ${
                theme === 'dark' ? 'bg-gray-700' : ''
              } ${getTextClasses()}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Due date */}
            <div>
              <label htmlFor="dueDate" className={`block text-sm font-medium mb-1 ${getSecondaryTextClasses()}`}>
                Data de vencimento
              </label>
              <input
                id="dueDate"
                {...register('dueDate')}
                type="date"
                className={`w-full px-4 py-2.5 rounded-lg outline-none ${getInputBorderClasses()} ${
                  theme === 'dark' ? 'bg-gray-700' : ''
                } ${getTextClasses()}`}
              />
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className={`block text-sm font-medium mb-1 ${getSecondaryTextClasses()}`}>
                Prioridade
              </label>
              <select
                id="priority"
                {...register('priority')}
                className={`w-full px-4 py-2.5 rounded-lg outline-none ${getInputBorderClasses()} ${
                  theme === 'dark' ? 'bg-gray-700' : ''
                } ${getTextClasses()}`}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            {/* Status informativo */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${getSecondaryTextClasses()}`}>
                Status atual
              </label>
              <div className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              } border text-sm ${getTextClasses()}`}>
                {editingTaskId 
                  ? (tasks.find(t => t.id === editingTaskId)?.status === 'done' ? 'Concluída' : 'Pendente')
                  : 'Pendente'}
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`block text-sm font-medium ${getSecondaryTextClasses()}`}>
                Sub-tarefas
              </label>
              <button
                type="button"
                onClick={addSubtask}
                className={`${getButtonClasses('outline')} text-sm flex items-center gap-1`}
                aria-label="Adicionar sub-tarefa"
              >
                <Plus size={14} aria-hidden="true" />
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-3">
                  <input
                    id={`sub-${st.id}`}
                    type="checkbox"
                    checked={st.completed}
                    onChange={(e) => updateSubtaskLocal(st.id, 'completed', e.target.checked)}
                    className="h-4 w-4 rounded focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    aria-label={`Marcar sub-tarefa: ${st.title || 'sem título'}`}
                  />
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) => updateSubtaskLocal(st.id, 'title', e.target.value)}
                    onBlur={cleanupEmptySubtasks}
                    placeholder="Título da sub-tarefa"
                    className={`flex-1 px-3 py-1.5 rounded outline-none text-sm ${getInputBorderClasses()} ${
                      theme === 'dark' ? 'bg-gray-700' : ''
                    } ${getTextClasses()}`}
                    aria-label={`Editar título da sub-tarefa ${st.id}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(st.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition"
                    aria-label={`Remover sub-tarefa: ${st.title || 'sem título'}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
            {subtasks.length > 0 && (
              <p className={`text-xs mt-2 ${getSecondaryTextClasses()}`}>
                Subtasks vazias são removidas automaticamente ao salvar.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className={getButtonClasses('primary')}
              aria-label={editingTaskId ? 'Atualizar tarefa' : 'Criar nova tarefa'}
            >
              {editingTaskId ? 'Atualizar Tarefa' : 'Criar Tarefa'}
            </button>

            {editingTaskId && (
              <button
                type="button"
                onClick={() => setEditingTaskId(null)}
                className={getButtonClasses('secondary')}
                aria-label="Cancelar edição"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de tarefas */}
      <div className="space-y-4" role="list" aria-label="Lista de tarefas">
        {sortedTasks.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${getCardClasses()}`}>
            <div className="text-5xl mb-4" aria-hidden="true">📋</div>
            <h3 className={`text-xl font-semibold ${getTextClasses()}`}>Nenhuma tarefa encontrada</h3>
            <p className={`mt-2 ${getSecondaryTextClasses()}`}>
              Crie sua primeira tarefa clicando em "Nova Tarefa" acima.
            </p>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const progress = calculateProgress(task.subtasks);
            return (
              <div 
                key={task.id} 
                className={`rounded-lg shadow p-5 ${getCardClasses()}`}
                role="article"
                aria-labelledby={`task-title-${task.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 
                      id={`task-title-${task.id}`} 
                      className={`font-semibold ${getTextClasses()} truncate`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`mt-1 ${getSecondaryTextClasses()} line-clamp-2`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {task.dueDate && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          theme === 'high-contrast' 
                            ? 'bg-yellow-400 text-black' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}

                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        task.priority === 'high'
                          ? theme === 'high-contrast' 
                            ? 'bg-red-400 text-black' 
                            : 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                            ? theme === 'high-contrast'
                              ? 'bg-yellow-400 text-black'
                              : 'bg-amber-100 text-amber-900'
                            : theme === 'high-contrast'
                              ? 'bg-emerald-400 text-black'
                              : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>

                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        task.status === 'done'
                          ? theme === 'high-contrast'
                            ? 'bg-emerald-400 text-black'
                            : 'bg-emerald-100 text-emerald-800'
                          : theme === 'high-contrast'
                            ? 'bg-gray-400 text-black'
                            : 'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status === 'done' ? 'Concluída' : 'Pendente'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`p-2 rounded-lg ${
                        theme === 'high-contrast'
                          ? 'bg-yellow-400 hover:bg-yellow-500'
                          : theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      title={task.status === 'done' ? 'Marcar como pendente' : 'Marcar como concluída'}
                      aria-label={`Marcar tarefa "${task.title}" como ${task.status === 'done' ? 'pendente' : 'concluída'}`}
                    >
                      <Check 
                        size={18} 
                        className={task.status === 'done' 
                          ? theme === 'high-contrast' 
                            ? 'text-black' 
                            : 'text-emerald-600' 
                          : theme === 'high-contrast'
                            ? 'text-black'
                            : 'text-gray-600'
                        } 
                      />
                    </button>

                    <button
                      onClick={() => setEditingTaskId(task.id)}
                      className={`p-2 rounded-lg ${
                        theme === 'high-contrast'
                          ? 'bg-yellow-400 hover:bg-yellow-500'
                          : theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      title="Editar tarefa"
                      aria-label={`Editar tarefa: ${task.title}`}
                    >
                      <Edit3 
                        size={18} 
                        className={theme === 'high-contrast' ? 'text-black' : 'text-blue-600'} 
                      />
                    </button>

                    <button
                      onClick={() => handleDelete(task.id)}
                      className={`p-2 rounded-lg ${
                        theme === 'high-contrast'
                          ? 'bg-red-400 hover:bg-red-500'
                          : theme === 'dark'
                            ? 'bg-red-800 hover:bg-red-700'
                            : 'bg-red-100 hover:bg-red-200'
                      }`}
                      title="Excluir tarefa"
                      aria-label={`Excluir tarefa: ${task.title}`}
                    >
                      <Trash2 
                        size={18} 
                        className={theme === 'high-contrast' ? 'text-black' : 'text-red-600'} 
                      />
                    </button>
                  </div>
                </div>

                {/* Sub-tarefas interativas */}
                {task.subtasks.length > 0 && (
                  <div className="mt-5">
                    <h4 className={`text-sm font-medium mb-2 ${getSecondaryTextClasses()}`}>Sub-tarefas</h4>
                    <ul className="space-y-2" role="list">
                      {task.subtasks.map((st) => (
                        <li key={st.id} className="flex items-start gap-3" role="listitem">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => toggleSubtask(task.id, st.id)}
                            className="mt-0.5 h-4 w-4 rounded focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            aria-label={`Marcar sub-tarefa "${st.title}" como ${st.completed ? 'pendente' : 'concluída'}`}
                          />
                          <span 
                            className={`${st.completed ? 'line-through' : ''} ${
                              st.completed 
                                ? theme === 'high-contrast' 
                                  ? 'text-gray-300' 
                                  : 'text-gray-500'
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

                {/* Barra de progresso */}
                {task.subtasks.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className={getSecondaryTextClasses()}>Progresso</span>
                      <span className={`font-medium ${getTextClasses()}`}>{progress}%</span>
                    </div>
                    <div 
                      className={`w-full rounded-full h-2 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progresso da tarefa: ${progress} por cento`}
                    >
                      <div
                        className={`h-2 rounded-full ${
                          theme === 'high-contrast' 
                            ? 'bg-yellow-400' 
                            : 'bg-emerald-600'
                        } transition-all duration-300`}
                        style={{ 
                          width: `${progress}%`,
                          transition: reducedMotion ? 'none' : 'width 0.3s ease'
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ✅ Botão de acessibilidade flutuante */}
      <button
        onClick={() => {
          // Abre barra de acessibilidade ou vai para configurações
          const event = new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: true,
            bubbles: true
          });
          document.dispatchEvent(event);
        }}
        className="fixed bottom-4 right-4 z-40 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        aria-label="Configurações de acessibilidade"
        title="Acessibilidade (Ctrl+K)"
      >
        <Type size={20} aria-hidden="true" />
        <span className="sr-only">Acessibilidade</span>
      </button>
    </div>
  );
}