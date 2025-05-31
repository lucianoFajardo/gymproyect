"use server"

import { db } from "@/lib/db";
import { UpdateUserSubscriptionSchema } from "@/lib/zod";
import { z } from "zod";

type parseEditPlan = z.infer<typeof UpdateUserSubscriptionSchema>;

export const editSubscriptionPlanAction = async (dataPlan: parseEditPlan) => {
    try {
        const datavalidation = UpdateUserSubscriptionSchema.safeParse(dataPlan)

        if (!datavalidation.success) {
            console.log("Error de validacion:", datavalidation.error.format())
            return {
                success: false,
                error: datavalidation.error,
                message: "Error de validación de datos.",
            };
        }

        const updateSubscriptionPlan = await db.createClientModel.update({
            where:{
                id: dataPlan.userId,
            } , 
            data: {
                startPlan: dataPlan.startDate,
            }
        })

        if (!updateSubscriptionPlan) {
            return {
                success: false,
                message: "No se pudo actualizar la suscripción del usuario.",
            };
        }
        return {
            success: true,
            data: updateSubscriptionPlan,
            message: "Suscripción del usuario actualizada correctamente.",
        };

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