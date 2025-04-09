import { db } from "@/lib/db";
// funcion para crear el plan de suscripcion en la base de datos. que el administradot puede crear.
export default async function creteSubscriptionPlanAction({
    namePrice,
    price,
    subscriptionPlanId,
}: {
    namePrice: string;
    price: number;
    subscriptionPlanId: string;
}) {
    try {
        const newSubscriptionPlan = await db.subscriptionPlan.create({
            data: {
                namePrice: namePrice,
                price: price,
                subscriptionPlanId: subscriptionPlanId,
            }
        })
        return newSubscriptionPlan  // retornamos el nuevo plan de suscripcion creado.
    } catch (error) {
        console.error("Error al crear el plan de suscripción", error);
        throw new Error("No se pudo crear el plan de suscripción");
    }
}