[...routes] fodler  route.ts file 
import { handle } from 'hono/vercel'
import app from '@/server/server'

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);



create server folder 
inside create server.ts and route folder 
inside server.ts
import {Hono} from 'hono'; 
import signupRoute from './routes/signup-api';

export const runtime = "edge"; 

const app = new Hono().basePath("/api"); 
app.route('/', signupRoute);
export default app; 


inside routes folder create signup-routets
import { Hono } from 'hono';
import { SignUpSchema } from '@/zod-schemas/sign-up-schema';
import { zValidator } from '@hono/zod-validator'
const signupRoute = new Hono();

signupRoute.post(
    "/signup",
    zValidator("json", SignUpSchema),
    async (c) => {
        const data = c.req.valid("json"); 
        return c.json({ message: "Signup successful", ...data });
    }
);


export default signupRoute; 
**


hit the api and you are good to go 

visits the localhost/api/hello to see working or not.   