"use server";

import { db } from "@/lib/db";
import { AccountDataModel } from "@/Model/Account-Data-model";

export async function editAccountDataAction(value: AccountDataModel) {
    try {
        // Aquí puedes realizar la lógica para editar los datos de la cuenta
        // Por ejemplo, llamar a una API o actualizar la base de datos
        const result = await db.user.findFirst({
            where: {
                id: value.id
            },
        });

        if (!result) {
            throw new Error("Usuario no encontrado");
        }

        const updatedUser = await db.user.update({
            where: {
                id: value.id
            },
            data: {
                email: value.email,
                name: value.name,
                password: value.password
            }
        });
        console.log("Cuenta actualizada:", updatedUser);
        console.log("Datos de la cuenta editados:", value);
        return value;

    } catch (error) {
        throw new Error("Error al editar los datos de la cuenta" + error);
    }

}

//TODO: Seguir aqui para poder actualizar los datos de la cuenta