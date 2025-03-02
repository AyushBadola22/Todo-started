import { Hono } from 'hono';
import { SignUpSchema } from '@/zod-schemas/sign-up-schema';
import { zValidator } from '@hono/zod-validator'; 
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs'
const signupRoute = new Hono();

signupRoute.post(
    "/",
    zValidator("json", SignUpSchema),
    async (c) => {
        const data = c.req.valid("json"); 

        try {
            const {name , email , password} = data; 
            const existingUser = await db.user.findUnique({
                where: { email },
              });
              
            if(existingUser) {
                return c.json({
                    message: "User already exists", 
                    success : false 
                }, {status : 400});
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await db.user.create({
                data : {
                    name, 
                    email , 
                    password : hashedPassword
                }
            }); 
            

            return c.json({
                success : true, 
                message : "Signed up successfully , proceed to login", 
                user : {
                    name : newUser.name, 
                    email : newUser.email, 
                    id : newUser.id
                }
            }, {status : 201})

        } catch (error) {
            
            console.error(error); 
            return c.json({
                message : "Internal Server Error", 
                success : false
            }, {status : 500})
        }        
    }
);


export default signupRoute; 