export interface Task {
  id?: string | number;
  name: string;
  description: string;
  dueDate: Date | string;
  isCompleted: boolean;
}
