import {z} from 'zod'

export const SignUpSchema = z.object({
    name : z.string().trim().min(2, "Username is too short"), 
    email : z.string().email('Invalid email format.'),
    password : z.string().min(8, "Minimum eight characters expected.")
}) 