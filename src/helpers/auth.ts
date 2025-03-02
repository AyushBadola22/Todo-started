import { SignUpSchema } from "@/zod-schemas/sign-up-schema";
import axios from "axios";
import {z} from 'zod';

export async function signupUser(formdata: z.infer<typeof SignUpSchema>) {
    const response = await axios.post('/api/signup', formdata, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data; 
}