export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done'; // usado para coluna
  inKanban?: boolean; // ✅ NOVO: controla se está no quadro ou na lista lateral
  subtasks: Subtask[];
}