"use server";
import { db } from "@/lib/db";
import { SubscriptionPlanModel } from "@/Model/Subscription-Plan-model";
//* este es para obtener los plans pero para el dropdown de crear el cliente
export const getSubscriptionPlanAction = async () => {
    try {
        const subscriptionPlans = await db.subscriptionPlan.findMany({
            select:{
                id: true,
                namePlan: true,
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

//* este es para obtener todos los planes y mostrarlos en una tabla
export const getAllSubscriptionPlansAction = async () => {
    try {
        const subscriptionPlans = await db.subscriptionPlan.findMany({
            select:{
                id: true,
                namePlan: true,
                price: true,
                durationDaysPlan: true,
                descriptionPlan: true,
            }
        })
        //Verificar que existan planes de suscripcion disponibles.
        if (!subscriptionPlans || subscriptionPlans.length === 0) {
            throw new Error("No se encontraron planes de suscripción disponibles.");
        }
        
        // Mapear los datos a la estructura de SubscriptionPlanModel
        const formattedPlans : SubscriptionPlanModel[] = subscriptionPlans.map(plan => ({
            id: String(plan.id),
            name: String(plan.namePlan),
            price: Number(plan.price),
            durationDaysPlan: Number(plan.durationDaysPlan),
            descriptionPlan: plan.descriptionPlan ? String(plan.descriptionPlan) : "",
        }));

        if (formattedPlans.length === 0) {
            throw new Error("No se encontraron planes de suscripción disponibles.");
        }
        return formattedPlans
    } catch (error) {
        console.error("Error al obtener el subscriptionPlanId", error);
        throw new Error("No se pudo obtener el subscriptionPlanId");
    }

}