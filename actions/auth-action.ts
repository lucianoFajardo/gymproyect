import { LoginSchema } from "@/lib/zod";
import { AuthError } from "next-auth";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { z } from "zod";


export const loginAction = async (values: z.infer<typeof LoginSchema>): Promise<{ error?: string | null }> => {
    try {
        const result = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
            redirectTo: "/dashboard/view-users",
        });

        if (result?.error) {
            // Si el error tiene más detalles, los mostramos    
            if (result.error.includes("Credenciales inválidas")) {
                console.log('credenciales invalidas')
                return { error: "Las credenciales proporcionadas son incorrectas." };
            }
            if (result.error.includes("Usuario no encontrado")) {
                console.log('usuario no encontrado')
                return { error: "El usuario no existe." };
            }
            return { error: result.error }; // Este es el error genérico
        }
        toast.success("Inicio de session exitoso");
        setTimeout(() => { window.location.href = "/dashboard/view-users" }, 2000);  //* Demora la redirecion con un tiempo de 2ms
        return { error: null }

    } catch (error) {
        if (error instanceof AuthError) {
            throw new Error(error.message)
        }
        return { error: 'error 500' }
    }
};