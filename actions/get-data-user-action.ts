'use server'

import { db } from "@/lib/db";

export const getDataUserAction = async () => {   
    try {
        const users = await db.createClientModel.findMany({
            select:{
                id: true,
                name: true,
                gmail: true,
                subscriptionPlanId: true,
                statusPlan: true,
                subscriptionPlan:{
                    select:{
                        namePrice: true,
                    }
                },
                createdAt: true,
            }
        })
        //Verificar que existan usuarios registrados.
        if (!users || users.length === 0) {
            throw new Error("No se encontraron usuarios registrados.");
        }
        return users
    } catch (error) {
        console.error("Error al obtener los usuarios", error);
        throw new Error("No se pudo obtener los usuarios");
    }
}

//TODO: ya se obtienen los datos , ahora solo queda renderizarlos a gusto y editarlos poder tener un CRUD completo.