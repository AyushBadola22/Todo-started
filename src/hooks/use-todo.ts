import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios";
import { toast } from "sonner";
import useTodoStore from "./todo-store";

export function useTodoQueries() {
    const queryClient = useQueryClient();
    const { setTodosStore, deleteTodoStore, updateTodoStore, addTodoStore } = useTodoStore();

    const createTodo = useMutation({
        mutationFn: async (title: string) => {
            const response = await axios.post('/api/todo', { title }, {
                headers: { 'Content-Type': 'application/json' }  // ye mutation valo ko chahiye hi hota hai json headers
            });
            return response.data;
        },
        onSuccess: (data) => {
            addTodoStore(data.todo)
            queryClient.invalidateQueries({ queryKey: ['todos'] });
            toast("Todo added")
        },
        onError: (error) => {
            toast(error.message)
        }
    });

    const deleteTodo = useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.delete(`/api/todo/${id}`);
            return response.data;
        },
        onSuccess: (_, id) => {
            // id isliye mili mujhe kyunki maine mutation mai jo variables pass kare the vo mujhe idher bhi mil jayenge
            deleteTodoStore(id)
            queryClient.invalidateQueries({ queryKey: ['todos'] });
            toast('Todo deleted')
        },
        onError: (error) => {
            toast(error.message)
        }
    });


    const getTodos = useQuery({
        queryKey: ['todos'],
        queryFn: async () => {
            const response = await axios.get('/api/todo');
            setTodosStore(response.data.todos);
            return response.data;
        }
    });


    const updateTodo = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const response = await axios.patch(`/api/todo/${id}`, { status });
            return response.data;
        },
        onSuccess: (data) => {
            updateTodoStore(data); 
            queryClient.invalidateQueries({ queryKey: ['todos'] });
            toast("Todo updated")
        },
        onError: (error) => {
            toast(error.message)
        }
    });

    return { createTodo, deleteTodo, updateTodo, getTodos }
}