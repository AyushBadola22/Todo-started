import {z} from 'zod'

export const SignInSchema = z.object({
    email : z.string().email('Invalid email format.'),
    password : z.string().min(8, "Minimum eight characters expected.")
});