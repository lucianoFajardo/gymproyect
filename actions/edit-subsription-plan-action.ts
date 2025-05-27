"use server"

import { db } from "@/lib/db";
import { PlansSchema } from "@/lib/zod";
import { z } from "zod";

type parseEditPlan = z.infer<typeof PlansSchema>;

export const editSubscriptionPlanAction = async (idPlan: string, dataPlan: parseEditPlan) => {
    try {

        const datavalidation = PlansSchema.safeParse(dataPlan)

        if (!datavalidation.success) {
            console.log("Error de validacion:", datavalidation.error.format())
            return {
                // Si aqui existe un error me retorna este JSON con un error
                success: false,
                error: datavalidation.error.flatten().fieldErrors,
                message: "Error de validación al editar el plan.",
            }
        } else {
            const updatePlanDb = await db.subscriptionPlan.update({
                where: {
                    id: idPlan,
                },
                data: {
                    namePlan: dataPlan.name,
                    durationDaysPlan: dataPlan.durationDaysPlan,
                    price: dataPlan.price,
                    descriptionPlan: dataPlan.description,
                }
            })
            // Si aqui esta toda la data bien me retorna este JSON con un exito
            return {
                success: true,
                error: null,
                data: updatePlanDb,
                message: "Plan actualizado correctamente",
            }
        }

    }
    catch (error) {
        console.log("Error encontrado al editar Plan: -> " + error)
        return {
            // Si aqui el servidor no responde o hay un error me retorna este JSON con un error
            success: false,
            error: error,
            message: "Error interno del servidor al actualizar los datos.",
        }
    }

}