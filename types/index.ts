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
  description: string;
  dueDate: string; // ISO string (ex: "2025-11-30")
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'doing' | 'done'; // para Kanban
  subtasks: Subtask[];
}