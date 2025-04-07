import { coerce, object, string } from "zod"

export const LoginSchema = object({
    email: string({ required_error: "Correo es requerido" })
        .min(1, "Correo es requerido")
        .email("Invalid email"),

    password: string({ required_error: "Contraseña requerida" })
        .min(1, "Contraseña requerida")
        .min(8, "Contraseña debe de tener un min de 8 digitos")
        .max(32, "Contraseña no puede tener mas de 32 digitos"),

});

export const RegisterSchema = object({
    email: string({ required_error: "Correo electronico requerido" })
        .min(1, "Correo electronico requerido")
        .email("Correo invalido"),
    password: string({ required_error: "Contraseña requerida" })
        .min(1, "Contraseña requerida")
        .min(8, "Contraseña debe de tener un min de 8 digitos")
        .max(32, "Contraseña no puede tener mas de 32 digitos"),
    name: string({ required_error: "Nombre de usuario requerido" })
        .min(1, "Nombre de usuario requerido"),
})

export const CreateClientSchema = object({
    name: string({ required_error: "Nombre de cliente requerido" }).min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    lastname: string({ required_error: "Apellido requerido"}).min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
    phone: string({required_error: "Telefono debe de contener 9 digitos"}).regex(/^\d{9}$/, { message: "El teléfono debe tener 9 dígitos." }),
    age: coerce.number({required_error: "Edad debe de ser un numero positivo"}).min(1, { message: "La edad debe ser un número positivo." }).max(90, { message: "La edad debe ser menor a 90." }),
    gmail: string({required_error: "Formato de correo electronico invalido"}).email({ message: "Formato de correo electrónico inválido." }),
    startPlan: string({required_error:"Selecciona una fecha de inicio"}),
    subscriptionPlanId: string({required_error:"Formato de pago invalido"}).regex(/^\$\d{1,}\.?\d{0,}$/, { message: "Formato de pago inválido ($ seguido de números)." }),
    methodpay: string({required_error:"Seleccione un metodo de pago"}), // Puedes refinar esto con un enum si tienes métodos de pago específicos
})

