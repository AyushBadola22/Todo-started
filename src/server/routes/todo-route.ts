import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import ToDoSchema from "@/zod-schemas/todo-schema";
import { Session } from "next-auth";
import { authMiddleware } from "../middlwares/auth-middleware";
import { db } from "@/lib/db";
import redis from "@/lib/redis";
import { Todo } from "@prisma/client";

const todoRoute = new Hono<{ Variables: { user: Session["user"] | null } }>();
todoRoute.use(authMiddleware); 


todoRoute.post(
    '/', 
    zValidator("json", ToDoSchema), 
    async (c) => {
        const data = c.req.valid("json"); 
        try {
            const {title} = data; 
            const userId = c.get('user')?.id;
            if(!userId) {
                return c.json({
                    success : false , 
                    message : "invalid user session"
                }, 401); 
            }    

            const newtodo = await db.todo.create({
                data : {
                    title , 
                    userId 
                }
            }); 


            const cachedTodo = JSON.parse((await redis.get(`todo:${userId}`)) ?? "[]");
            await redis.set(`todo:${userId}`, JSON.stringify([...cachedTodo, newtodo]), "EX", 60 * 5);
    


            return c.json({
                success : true , 
                message : "todo created", 
                todo : newtodo
            }, 201);
        } catch (error) {
            console.error(error)
            return c.json({
                success : false , 
                message : "Internal server error"
            }, 500); 
        }
    }
)
.get(
    "/" ,  
    async (c) => {
        try {
            const userId = c.get('user')?.id;
            if(!userId) {
                return c.json({
                    success : false, 
                    message : "No user found , try login first"
                }, 401);
            }

            const cachedTodo = await redis.get(`todo:${userId}`);

            if(cachedTodo){
                return c.json({
                    success : true , 
                    todos : JSON.parse(cachedTodo), 
                    message : "Found data in redis"
                }, 200)
            }



            const todos = await db.todo.findMany({
                where : {userId }, 
                orderBy: { createdAt: "desc" },
            }); 

            await redis.set(`todo:${userId}`, JSON.stringify(todos), "EX", 60 * 5);

            return c.json({
                success : true ,  
                todos , 
                message : "todos fetched successfully"
            }, 201); 

        } catch (error) {
            console.error(error); 
            return c.json({
                success : false ,  
                todos : [], 
                message : "failed to fetch todos"
            }, 500)
        }
    }
)
.delete(
    "/:id" , 
    async (c) =>{
        try {
            const userId = c.get('user')?.id; 
            if(!userId){
                return c.json({
                    success : false ,
                    message : "no user found"
                },400); 
            }

            const id = c.req.param('id'); 
            if(!id) {
                return c.json({
                    success : false ,
                    message : "no todo id provided"
                },400); 
            }


            const todo = await db.todo.findFirst({
                where : {
                    id , userId
                }
            })

            if(!todo) {
                return c.json({
                    success : false ,
                    message : "no such todo exists"
                },400); 
            }

            await db.todo.delete({
                where : {
                    id , userId
                }
            }); 

            const cachedTodos = JSON.parse((await redis.get(`todo:${userId}`)) || "[]");
            const updatedTodos = cachedTodos.filter((t: Todo) => t.id !== id);
            await redis.set(`todo:${userId}`, JSON.stringify(updatedTodos), "EX", 60 * 5);
      

            return c.json({
                success : true ,
                message : "successfully deleted"
            },201); 

        } catch (error) {
            console.log(error); 
            return c.json({
                success : false ,
                message : "Internal server error"
            },500); 
        }
    }
)
.patch(
    "/:id" , 
    async (c) =>{
        try {
            const userId = c.get('user')?.id; 
            if(!userId){
                return c.json({
                    success : false ,
                    message : "no user found"
                },400); 
            }

            const id = c.req.param('id'); 
            const { title, status } = await c.req.json();
            if(!id) {
                return c.json({
                    success : false ,
                    message : "no todo id provided"
                },400); 
            }

            if(!title && !status) {
                return c.json({
                    success : false ,
                    message : "missing fields"
                },400);
            }

            const todo = await db.todo.findFirst({
                where : {
                    id , userId
                }
            })

            if(!todo) {
                return c.json({
                    success : false ,
                    message : "no such todo exists"
                },400); 
            }

            const updateTodo = await db.todo.update({
                where: { id, userId },
                data: {
                  ...(title !== undefined && { title }),
                  ...(status !== undefined && { status }),
                },
              });

              const cachedTodos = JSON.parse((await redis.get(`todo:${userId}`)) ?? "[]");
              
              const updatedTodos = cachedTodos.map((t: Todo) =>
                t.id === id
                    ? { ...t, title: title !== undefined ? title : t.title, status: status !== undefined ? status : t.status }
                    : t
            );
              await redis.set(`todo:${userId}`, JSON.stringify(updatedTodos), "EX", 60 * 5);
        

            return c.json({
                success : true ,
                message : "successfully updated", 
                updateTodo : updateTodo
            },201); 

        } catch (error) {
            console.log(error); 
            return c.json({
                success : false ,
                message : "Internal server error"
            },500); 
        }
    }
)

export default todoRoute;