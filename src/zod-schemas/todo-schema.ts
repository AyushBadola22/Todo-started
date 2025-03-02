import { z } from 'zod';

const ToDoSchema = z.object({
    title: z.string().trim().min(1, "Title can't be empty"),
})

export default ToDoSchema

export interface Todo {
    id: string;
    title: string;
    status: "pending" | "completed";
    userId: string;
    createdAt: string;
}