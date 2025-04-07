"use server"

import { db } from "@/lib/db";
import { CreateClientSchema } from "@/lib/zod";
import { z } from "zod";

export const crateClientAction = async (values: z.infer<typeof CreateClientSchema>) => {
    try {
        // Validar los datos usando el esquema de Zod
        const parsed = CreateClientSchema.safeParse(values);
        if (!parsed.success) {
            console.error("Error de validación al crear el cliente", parsed.error);
            throw new Error("Datos inválidos para crear el cliente");
        }
        const data = parsed.data;
        const userId = 'dd'

        // Crear el cliente en la base de datos
        const newClient = await db.createClientModel.create({
            data: {
                name: data.name,
                lastname: data.lastname,
                phone: data.phone,
                age: data.age.toString(),
                gmail: data.gmail,
                startPlan: data.startPlan,
                subscriptionPlanId: data.subscriptionPlanId,
                methodpay: data.methodpay,
                statusPlan: "Activo", // todos los clientes que se ingresan se les asigna el plan activo hasta que se cancele su suscripcion.
                userId: userId,
            },
            include: {
                subscriptionPlan: true, // Incluir datos del plan de suscripción relacionado
            },
        });
        console.log("Cliente creado con éxito", newClient);
        return newClient;
    } catch (error) {
        console.error("Error al crear el cliente", error);
        throw new Error("No se pudo crear el cliente");
    }

}