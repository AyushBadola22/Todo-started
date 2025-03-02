'use client'
import { useSession } from 'next-auth/react'
import { Loader, Check, Plus, Trash, RefreshCw, Clock } from "lucide-react"
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ToDoSchema, { Todo } from '@/zod-schemas/todo-schema'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useTodoQueries } from '@/hooks/use-todo';
import useTodoStore from '@/hooks/todo-store';


export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(ToDoSchema),
    defaultValues: {
      title: ""
    }
  });

  const { createTodo, updateTodo, deleteTodo, getTodos } = useTodoQueries();

  const todos = useTodoStore((state) => state.todos);

  const taskCount = todos.length;
  let taskText = '';
  if (taskCount > 0) {
    taskText = `${taskCount} task${taskCount !== 1 ? 's' : ''}`;
  }


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className='bg-background h-screen w-screen flex items-center justify-center backdrop-blur-2xl'>
        <div className="flex flex-col items-center gap-2">
          <Loader className='animate-spin h-8 w-8' />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 mr-1" /> Completed</Badge>;
    }
    else {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  async function handleCreateTodo(todo: z.infer<typeof ToDoSchema>) {
    createTodo.mutate(todo.title);
    form.reset();
  };

  const updateStatus = (todo: Todo) => {
    updateTodo.mutate({
      id: todo.id,
      status: todo.status === 'completed' ? 'pending' : 'completed'
    });
  };

  return (
    <div className='mt-16 p-6 w-full min-h-screen'>
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Todo List</CardTitle>
          <CardDescription>
            example app
          </CardDescription>
        </CardHeader>

        <CardContent>

          {/* add task vla form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateTodo)} className='space-y-4 flex justify-between items-center gap-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Add Todo</FormLabel>
                    <FormControl><Input disabled={createTodo.isPending} placeholder='Add a new task' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' disabled={createTodo.isPending} className='p-2'>
                {createTodo.isPending ? <span className='flex justify-center items-center gap-1'>
                  <Loader /> Adding
                </span> : <span className='flex justify-center items-center gap-1'><Plus />Add Todo</span>}
              </Button>

            </form>
          </Form>



          <div className="space-y-3">
            {getTodos.isPending && (
              <div className="flex justify-center py-6">
                <Loader className="animate-spin h-6 w-6" />
              </div>
            )}

            {getTodos.isError && (
              <div className="py-6 text-center">
                <p className="text-red-500">Failed to load todos</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => getTodos.refetch()}
                >
                  Try Again
                </Button>
              </div>
            )}

            {getTodos.isSuccess && todos.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No tasks yet. Create one to get started!</p>
              </div>
            )}

            {todos.map((todo: Todo) => (
              <Card key={todo.id} className="overflow-hidden">
                <div className="flex items-start p-4 gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="mt-0.5 shrink-0 cursor-pointer"
                    onClick={() => updateStatus(todo)}
                    title="Change status"
                  >
                    {todo.status === 'completed' ? (
                      <Check className="h-4 w-4 text-green-500 " />
                    ) : (
                      <Clock className=" h-4 w-4 text-yellow-500" />
                    )}
                  </Button>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-lg font-medium  ${todo.status.toLowerCase() === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {todo.title}
                      </h3>
                      {getStatusBadge(todo.status)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Created on {new Date(todo.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                    onClick={() => deleteTodo.mutate(todo.id)}
                    disabled={deleteTodo.isPending}
                    title="Delete"
                  >
                    {deleteTodo.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>

        <CardFooter className="border-t px-6 py-4 flex justify-between">
          <p className="text-sm text-gray-500">
            {taskText}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => getTodos.refetch()}
            disabled={getTodos.isFetching}
          >
            {getTodos.isFetching ? <Loader className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}