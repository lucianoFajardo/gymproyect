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
    name: string({ required_error: "Nombre de cliente requerido" }).min(2, { message: "El nombre debe tener al menos 2 caracteres." }).regex(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/, { message: "El apellido solo puede contener letras." }),
    lastname: string({ required_error: "Apellido requerido" }).min(2, { message: "El apellido debe tener al menos 2 caracteres." }).regex(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/, { message: "El apellido solo puede contener letras." }),
    phone: string({ required_error: "Telefono debe de contener 9 digitos" }).regex(/^\d{9}$/, { message: "El teléfono debe tener 9 dígitos." }),
    age: coerce.number({ required_error: "Edad debe de ser un numero positivo" }).min(1, { message: "La edad debe ser un número positivo." }).max(90, { message: "La edad debe ser menor a 90." }),
    gmail: string({ required_error: "Formato de correo electronico invalido" }).email({ message: "Formato de correo electrónico inválido." }),
    startPlan: string({ required_error: "Selecciona una fecha de inicio" }),
    subscriptionPlanId: string({ required_error: "Seleccionar un plan" }),  // eliminar despues este registro
    methodpay: string({ required_error: "Seleccione un metodo de pago" }), // Puedes refinar esto con un enum si tienes métodos de pago específicos
})

export const UpdateClientSchema = object({
    name: string({ required_error: "Nombre de cliente requerido" }).min(2, { message: "El nombre debe tener al menos 2 caracteres." }).regex(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/, { message: "El nombre solo puede contener letras." }), // Corregido mensaje de regex
    lastname: string({ required_error: "Apellido requerido" }).min(2, { message: "El apellido debe tener al menos 2 caracteres." }).regex(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/, { message: "El apellido solo puede contener letras." }),
    phone: string({ required_error: "Telefono debe de contener 9 digitos" }).regex(/^\d{9}$/, { message: "El teléfono debe tener 9 dígitos." }),
    age: coerce.number({ // Coercer el input (que usualmente es string desde el form) a número
        required_error: "La edad es requerida.",
        invalid_type_error: "La edad debe ser un número." // Mensaje si no se puede coercer a número
    })
        .int({ message: "La edad debe ser un número entero." }) // Asegurar que sea entero
        .positive({ message: "La edad debe ser un número positivo." }) // Asegurar que sea > 0
        .min(1, { message: "La edad debe ser al menos 1." }) // Redundante si ya usas .positive(), pero puedes ajustar el mínimo
        .max(90, { message: "La edad debe ser menor o igual a 90." }), // Opcional: límite superior
    gmail: string({ required_error: "Formato de correo electronico invalido" }).email({ message: "Formato de correo electrónico inválido." }),
})

export const PlansSchema = object({
    name: string({ required_error: "Nombre de plan requerido" }).min(2, { message: "El nombre debe tener al menos 2 caracteres." }).regex(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/, { message: "El nombre solo puede contener letras." }),        
    price: coerce.number({ required_error: "Precio requerido" }).min(1, { message: "El precio debe ser mayor a 0." }),
    description: string().optional(),
    durationDaysPlan: coerce.number({ required_error: "Duracion del plan requerido" }).min(1, { message: "La duracion del plan debe ser mayor a 0." }).max(368, { message: "El precio no puede ser mayor a 1 año en dias 368." }),
})
