import { authOptions } from "@/lib/options";
import type { Context, Next } from "hono";
import { getServerSession } from "next-auth";

export const authMiddleware = async function (c : Context , next : Next) {
    try {
        const session = await getServerSession(authOptions); 
        if(!session || !session.user){
            return c.json({message : "Unauthorized access , try login first"}, {status : 401});
        }
        c.set('user', session.user); 
        await next(); 
    } catch (error) {
        console.error("error in auth middlware", error); 
        return c.json({error : "Internal server error"}, {status : 500})
    }
}