"use server";
import { db } from "@/lib/db";

export const getSubscriptionPlanAction = async () => {
    try {
        const subscriptionPlans = await db.subscriptionPlan.findMany({
            select:{
                id: true,
                namePrice: true,
            }
        })
        //Verificar que existan planes de suscripcion disponibles.
        if (!subscriptionPlans || subscriptionPlans.length === 0) {
            throw new Error("No se encontraron planes de suscripción disponibles.");
        }

        return subscriptionPlans
    } catch (error) {
        console.error("Error al obtener el subscriptionPlanId", error);
        throw new Error("No se pudo obtener el subscriptionPlanId");
    }
};
