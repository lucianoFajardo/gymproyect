"use server"

import { db } from "@/lib/db";
import { PlansSchema } from "@/lib/zod";
import { z } from "zod";
export const createSubscriptionPlanAction = async (value: z.infer<typeof PlansSchema>) => {
    const { data, success } = await PlansSchema.safeParse(value);
    if (!success) {
        return {
            error: true,
            message: "Error de validacion de datos al crear el plan de subscripcion",
            data: null,
        }
    }
    try {
        const newSubscriptionPlan = await db.subscriptionPlan.create({
            data: {
                subscriptionPlanId: crypto.randomUUID(), 
                namePlan: data.name,
                price: data.price,
                durationDaysPlan: data.durationDaysPlan,
                descriptionPlan: data.description ? data.description : "",
            }
        })
        return {
            error: false,
            message: "Plan de suscripción creado con éxito",
            data: newSubscriptionPlan
        }
    } catch (error) {
        console.error("Error al crear el plan de suscripción", error);
        return {
            error: true,
            message: "No se pudo crear el plan de suscripción" + error,
            data: null,
        }
    }
}