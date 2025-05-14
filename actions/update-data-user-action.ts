"use server"

import { db } from "@/lib/db";
import { UpdateClientSchema } from "@/lib/zod"
import { z } from "zod"

// Aqui esta el esquema de validacion para el formulario de actualizacion de datos
type updateUserDataInput = z.infer<typeof UpdateClientSchema>;


export async function updateUserAction(userId: string, dataFormClient: updateUserDataInput) {
    try {
        const datavalidation = await UpdateClientSchema.safeParse(dataFormClient);

        if (!datavalidation.success) {
            return {
                error: true,
                message: datavalidation.error.format(),
            }
        }

        const responseDataUpdate = await db.createClientModel.update({
            where:{
                id: userId
            } ,
            data : {
                name: dataFormClient.name,
                lastname: dataFormClient.lastname,
                age: dataFormClient.age.toString(),
                phone: dataFormClient.phone,
                gmail: dataFormClient.gmail,
            }
        })

        return {
            error:false,
            data: responseDataUpdate,
            message: "Datos actualizados correctamente",
        };  //Retornamos la respuesta que nos da la base de datos

    } catch (error) {
        console.log("Error encontrado : -> " + error)
        return {
            error: true,
            message: "Error al actualizar los datos", 
        }
    }


}