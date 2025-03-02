import { Hono } from "hono";
import { authMiddleware } from "../middlwares/auth-middleware";

const protectedRoute = new Hono(); 

protectedRoute.get("/", authMiddleware, async (c) => {
    console.log('calling miidleware')
    return c.json({
        success : true, 
        message : "accessed hooray", 
    }, {status : 200}); 
})

export default protectedRoute; 