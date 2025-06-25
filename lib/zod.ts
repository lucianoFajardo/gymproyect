import { coerce, object, string, date, enum as zodEnum } from "zod"

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

export const UpdateUserSubscriptionSchema = object({
    userId: string().min(1, "El ID de usuario es requerido."),
    startDate: string().refine((date) => !isNaN(Date.parse(date)), {
        message: "La fecha de inicio debe ser una fecha válida.",
    }),
});

export const productSchema = object({
    nameProduct: string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }).max(100),
    descriptionProduct: string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }).max(500).optional(),
    priceProduct: coerce.number().positive({ message: "El precio debe ser un número positivo." }),
    stockProduct: coerce.number().int().min(0, { message: "El stock no puede ser negativo." }),
    categoryProduct: string().min(1, { message: "Debes seleccionar una categoría." }),
});

// Esquema de validación para el nombre de la categoría
export const categorySchema = object({
    nameCategory: string().min(2, { message: "El nombre de la categoría debe tener al menos 2 caracteres." }).max(50, { message: "El nombre no puede exceder los 50 caracteres." }),
});

export const serviceSchema = object({
    serviceName: string().min(2, {
        message: "El nombre del servicio debe tener al menos 2 caracteres.",
    }).max(100, { message: "El nombre del servicio no puede exceder los 100 caracteres." }),
    serviceCost: coerce.number().positive({
        message: "El costo del servicio debe ser un número positivo.",
    }),
    dueDate: date({
        required_error: "La próxima fecha de vencimiento es obligatoria.",
        invalid_type_error: "La próxima fecha de vencimiento debe ser una fecha válida.",
    }),
    paymentFrequency: string().min(1, { message: "El tipo de pago es requerido" }).max(100),
    fixedExpense: zodEnum(["FIJO", "BASICO", "VARIABLE"], { // Añadido "VARIABLE"
        required_error: "El tipo de gasto es obligatorio.",
    }),
    providerName: string().min(2, { message: "El nombre del proveedor debe tener al menos 2 caracteres." }).max(100).optional(),
    contactPerson: string().min(2, { message: "El nombre de la persona de contacto debe tener al menos 2 caracteres." }).max(100).optional(),
    providerPhoneNumber: string()
        .regex(/^\+?\d{7,15}$/, { message: "Número de teléfono del proveedor no válido." }) // Regex simple para teléfono internacional
        .optional(),
    category: string().min(2, { message: "La categoría debe tener al menos 2 caracteres." }).max(50).optional(),
    status: zodEnum(["ACTIVO", "INACTIVO", "PENDIENTE", "PAGADO"], { // Opciones de estado
        required_error: "El estado es obligatorio.",
    }),

    paymentMethod: string().min(2, { message: "El método de pago debe tener al menos 2 caracteres." }).max(50).optional(),
    notes: string().max(500, { message: "Las notas no pueden exceder los 500 caracteres." }).optional(),
});

export const serviceUpdateSchema = object({
    serviceName: string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    serviceCost: coerce.number().positive({ message: "El costo debe ser un número positivo." }),
    dueDate: date({
        required_error: "La próxima fecha de vencimiento es obligatoria.",
        invalid_type_error: "La próxima fecha de vencimiento debe ser una fecha válida.",
    }),
    paymentFrequency: string({ required_error: "La frecuencia de pago es requerida." }),
    providerName: string().min(2, { message: "El nombre del proveedor debe tener al menos 2 caracteres." }).max(100).optional(),
    contactPerson: string().min(2, { message: "El nombre de la persona de contacto debe tener al menos 2 caracteres." }).max(100).optional(),
    paymentMethod: string().optional(),
    fixedExpense: zodEnum(["FIJO", "BASICO", "VARIABLE"], { // Añadido "VARIABLE"
        required_error: "El tipo de gasto es obligatorio.",
    }),
    providerPhoneNumber: string()
        .regex(/^\+?\d{7,15}$/, { message: "Número de teléfono del proveedor no válido." }) // Regex simple para teléfono internacional
        .optional(),
});
