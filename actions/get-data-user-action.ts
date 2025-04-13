'use server'
import { db } from "@/lib/db";

export const getDataUserAction = async () => {   
    try {
        const users = await db.createClientModel.findMany({
            select:{
                id: true,
                name: true,
                age: true,
                lastname: true,
                phone: true,
                gmail: true,
                startPlan: true,
                statusPlan: true,
                subscriptionPlan:{
                    select:{
                        namePrice: true,
                        price: true,
                    }
                },
                createdAt: true,
            }
        })
        // Parse data to JSON with string values
        const parsedUsers = users.map(user => ({
            id: String(user.id),
            name: String(user.name),
            lastname: String(user.lastname),
            age: user.age ? String(user.age) : "",
            phone: user.phone ? String(user.phone) : "",
            gmail: String(user.gmail),
            startPlan: user.startPlan ? String(user.startPlan) : "",
            statusPlan: String(user.statusPlan),
            subscriptionPlan: user.subscriptionPlan?.namePrice ? String(user.subscriptionPlan.namePrice) : "",
            price: user.subscriptionPlan?.price ? String(user.subscriptionPlan.price) : "",
            createdAt: String(user.createdAt),
        }));
        //Verificar que existan usuarios registrados.
        if (!parsedUsers || parsedUsers.length === 0) {
            throw new Error("No se encontraron usuarios registrados.");
        }
        return parsedUsers
    } catch (error) {
        console.error("Error al obtener los usuarios", error);
        throw new Error("No se pudo obtener los usuarios");
    }
}

//TODO: ya se obtienen los datos , ahora solo queda renderizarlos a gusto y editarlos poder tener un CRUD completo.