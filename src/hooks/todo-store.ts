/**
|--------------------------------------------------
| 
Your store is a hook! You can put anything in it: primitives, objects, functions. The set function merges state. 
- Official docs 
|--------------------------------------------------
*/


import { Todo } from '@/zod-schemas/todo-schema'
import {create} from 'zustand'
import {devtools}  from 'zustand/middleware'


export interface TodoStore {
    todos : Todo[] , 
    addTodoStore : (todo : Todo) => void; 
    updateTodoStore : (updatedTodo : Todo) => void; 
    deleteTodoStore : (id : string) => void ; 
    setTodosStore : (todos : Todo[]) => void ; 
}


const useTodoStore = create <TodoStore>() (
    devtools((set) => ({
    todos : [] , 

    addTodoStore : (todo : Todo) => set((state) => ({
        todos : [...state.todos, todo]
    })),
    
    updateTodoStore : (updatedTodo : Todo) => set((state)=> ({
        todos : state.todos.map((todo) => todo.id === updatedTodo.id ? updatedTodo : todo
        ),
    })), 
    

    deleteTodoStore : (id : string) => set((state) => ({
        todos : state.todos.filter((todo : Todo) => todo.id !== id)
    })), 

    setTodosStore : (todos : Todo[]) => set({todos})

}))) 


export default useTodoStore;  