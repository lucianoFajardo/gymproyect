"use server"

import { db } from "@/lib/db";
import { UpdateClientSchema } from "@/lib/zod"
import { z } from "zod"

// Aqui esta el esquema de validacion para el formulario de actualizacion de datos
type updateUserDataInput = z.infer<typeof UpdateClientSchema>;

export const updateUserAction = async (userId: string, dataFormClient: updateUserDataInput) => {
    try {
        const datavalidation = UpdateClientSchema.safeParse(dataFormClient);
        if (!datavalidation.success) {
            console.log("Error de validacion:", datavalidation.error.format())
            return {
                // Si aqui existe un error me retorna este JSON con un error
                success: false,
                error: datavalidation.error.flatten().fieldErrors,
            }
        } else {
            const responseDataUpdate = await db.createClientModel.update({
                where: {
                    id: userId
                },
                data: {
                    name: dataFormClient.name,
                    lastname: dataFormClient.lastname,
                    age: dataFormClient.age.toString(),
                    phone: dataFormClient.phone,
                    gmail: dataFormClient.gmail,
                }
            })
            return {
                // Si aqui esta toda la data bien me retorna este JSON con un exito
                success: true,
                data: responseDataUpdate,
                message: "Datos actualizados correctamente",
            };  //Retornamos la respuesta que nos da la base de datos
        }
    } catch (error) {
        console.log("Error encontrado al editar usuario: -> " + error)
        return {
            // Si aqui el servidor no responde o hay un error me retorna este JSON con un error
            success: false,
            error: error,
            message: "Error interno del servidor al actualizar los datos.",
        }
    }
}