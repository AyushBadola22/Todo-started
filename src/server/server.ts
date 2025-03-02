import {Hono} from 'hono'; 
import signupRoute from './routes/signup-route';
import protectedRoute from "./routes/protected-route"
import todoRoute from './routes/todo-route';
export const runtime = "edge"; 

const app = new Hono().basePath("/api"); 
app.route('/signup', signupRoute);
app.route('/protected', protectedRoute); 
app.route('/todo', todoRoute);
export default app; 
