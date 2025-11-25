// app/tasks/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task, Subtask } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';

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
  const [subtasks, setSubtasks] = useState<Subtask[]>([{ id: Date.now().toString(), title: '', completed: false }]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  // Redireciona se não autenticado
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

  // Atualiza subtasks ao editar
  useEffect(() => {
    if (editingTaskId) {
      const task = tasks.find(t => t.id === editingTaskId);
      if (task) {
        setValue('title', task.title);
        setValue('description', task.description || '');
        setValue('dueDate', task.dueDate || '');
        setValue('priority', task.priority);
        setSubtasks(task.subtasks || [{ id: Date.now().toString(), title: '', completed: false }]);
      }
    }
  }, [editingTaskId, tasks, setValue]);

  // Adicionar sub-tarefa
  const addSubtask = () => {
    setSubtasks([...subtasks, { id: Date.now().toString(), title: '', completed: false }]);
  };

  // Remover sub-tarefa
  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  // Atualizar sub-tarefa
  const updateSubtask = (id: string, field: keyof Subtask, value: string | boolean) => {
    setSubtasks(
      subtasks.map(st => (st.id === id ? { ...st, [field]: value } : st))
    );
  };

  // Calcular progresso (% de sub-tarefas concluídas)
  const calculateProgress = (subtasks: Subtask[]) => {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(st => st.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  // Salvar tarefa (criar ou atualizar)
  const onSubmit = async ( data: TaskFormData) => {
    if (!user) return;

    const newSubtasks = subtasks.filter(st => st.title.trim() !== '');

    try {
      if (editingTaskId) {
        // Atualizar
        await updateDoc(doc(db, 'tasks', editingTaskId), {
          title: data.title,
          description: data.description || '',
          dueDate: data.dueDate || '',
          priority: data.priority,
          subtasks: newSubtasks,
        });
        setTasks(tasks.map(t => (t.id === editingTaskId ? { ...t, ...data, subtasks: newSubtasks } : t)));
        setEditingTaskId(null);
      } else {
        // Criar
        const newTask: Task = {
          id: '',
          userId: user.uid,
          title: data.title,
          description: data.description || '',
          dueDate: data.dueDate || '',
          priority: data.priority,
          status: 'todo',
          subtasks: newSubtasks,
        };
        const docRef = await addDoc(collection(db, 'tasks'), newTask);
        setTasks([...tasks, { ...newTask, id: docRef.id }]);
      }

      // Reset form
      reset();
      setSubtasks([{ id: Date.now().toString(), title: '', completed: false }]);
    } catch (err) {
      console.error('Erro ao salvar tarefa:', err);
    }
  };

  // Excluir tarefa
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Carregando tarefas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Tarefas</h1>
        <Link
          href="/dashboard"
          className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
        >
          ← Voltar ao Dashboard
        </Link>
      </div>

      {/* Formulário de Tarefa */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingTaskId ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <div>
            <input
              {...register('title')}
              placeholder="Título da tarefa"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Descrição */}
          <div>
            <textarea
              {...register('description')}
              placeholder="Descrição (opcional)"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Data de vencimento */}
          <div>
            <input
              {...register('dueDate')}
              type="date"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
            <select
              {...register('priority')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {/* Sub-tarefas */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Sub-tarefas</label>
              <button
                type="button"
                onClick={addSubtask}
                className="text-emerald-600 hover:text-emerald-800 text-sm flex items-center gap-1"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={(e) => updateSubtask(st.id, 'completed', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) => updateSubtask(st.id, 'title', e.target.value)}
                    placeholder="Título da sub-tarefa"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(st.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              {editingTaskId ? 'Atualizar' : 'Criar Tarefa'}
            </button>
            {editingTaskId && (
              <button
                type="button"
                onClick={() => {
                  setEditingTaskId(null);
                  reset();
                  setSubtasks([{ id: Date.now().toString(), title: '', completed: false }]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma tarefa criada ainda. Crie sua primeira tarefa!
          </div>
        ) : (
          tasks.map((task) => {
            const progress = calculateProgress(task.subtasks);
            return (
              <div key={task.id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    {task.description && <p className="text-gray-600 text-sm mt-1">{task.description}</p>}
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Vence em: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTaskId(task.id);
                        // Subtasks será atualizado no useEffect
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Check size={18} />
                    </button>
                    <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Sub-tarefas listadas */}
                {task.subtasks.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Sub-tarefas:</p>
                    <ul className="mt-1 space-y-1">
                      {task.subtasks.map((st) => (
                        <li key={st.id} className="flex items-center gap-2 text-sm">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              st.completed ? 'bg-emerald-500' : 'bg-gray-300'
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

                {/* Barra de progresso */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}