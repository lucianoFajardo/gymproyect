'use server'
import { db } from "@/lib/db";
import { SubscriptionPlanModel } from "@/Model/Subscription-Plan-model";
import { UserModel } from "@/Model/User-model"; // Importa ambas interfaces

export async function getDataUserAction(): Promise<UserModel[]> {
    try {
        const usersFromDb = await db.createClientModel.findMany({
            select: {
                id: true,
                name: true,
                age: true,
                lastname: true,
                phone: true,
                gmail: true,
                startPlan: true,
                statusPlan: true,
                subscriptionPlan: { // Esto ya selecciona los campos que necesitas del plan
                    select: {
                        id: true, // Descomenta si necesitas el ID del plan en el frontend
                        namePlan: true,
                        durationDaysPlan: true,
                        price: true,
                    }
                },
                createdAt: true,
            }
        });

        // Mapear los datos a la estructura de UserModel
        const formattedUsers: UserModel[] = usersFromDb.map(user => {
            // Construir el objeto subscriptionPlan para el UserModel
            let planInfo: SubscriptionPlanModel | null = null;

            if (user.subscriptionPlan) {
                planInfo = {
                    id: user.subscriptionPlan.id ? String(user.subscriptionPlan.id) : "", // Convertir a string
                    name: user.subscriptionPlan.namePlan,
                    durationDaysPlan: user.subscriptionPlan.durationDaysPlan, // Mantener como número
                    price: user.subscriptionPlan.price, // Mantener como número
                };
            }

            return {
                id: String(user.id),
                name: String(user.name),
                lastname: String(user.lastname),
                age: user.age ? String(user.age) : "",
                phone: user.phone ? String(user.phone) : "",
                gmail: String(user.gmail),
                startPlan: user.startPlan ? user.startPlan.toISOString() : "", // Convertir Date a string ISO
                statusPlan: String(user.statusPlan),
                price: user.subscriptionPlan ? String(user.subscriptionPlan.price) : "", // Convertir a string
                createdAt: user.createdAt ? user.createdAt.toISOString() : "", // Convertir Date a string ISO
                subscriptionPlan: planInfo, // Asignar el objeto del plan (o null)
            };
        });

        // No necesitas la verificación de !parsedUsers, findMany devuelve [] si no hay resultados
        if (formattedUsers.length === 0) {
            return[];
        }

        return formattedUsers;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
        return [];
    }
}

//! NOTA: Aqui se crea una función adicional para obtener los datos de los usuarios con suscripciones, 
export async function getDataUserActionWithSubscription() {
    try {
        const usersFromDbSubscription = await db.createClientModel.findMany({
            select: {
                id: true,
                name: true,
                startPlan: true,
                subscriptionPlan: { // Esto ya selecciona los campos que necesitas del plan
                    select: {
                        id: true, // Descomenta si necesitas el ID del plan en el frontend
                        namePlan: true,
                        durationDaysPlan: true,
                        price: true,
                    }
                },
                createdAt: true,
            }
        });

        // Mapear los datos a la estructura de UserModel
        const formattedUsers = usersFromDbSubscription.map(user => {
            // Construir el objeto subscriptionPlan para el UserModel
            let planInfo: SubscriptionPlanModel | null = null;
            if (user.subscriptionPlan) {
                planInfo = {
                    id: user.subscriptionPlan.id ? String(user.subscriptionPlan.id) : "", // Convertir a string
                    name: user.subscriptionPlan.namePlan,
                    durationDaysPlan: user.subscriptionPlan.durationDaysPlan, // Mantener como número
                    price: user.subscriptionPlan.price, // Mantener como número
                };
            }
            return {
                id: String(user.id),
                name: String(user.name),
                startPlan: user.startPlan ? user.startPlan.toISOString() : "", // Convertir Date a string ISO
                price: user.subscriptionPlan ? String(user.subscriptionPlan.price) : "", // Convertir a string
                createdAt: user.createdAt ? user.createdAt.toISOString() : "", // Convertir Date a string ISO
                subscriptionPlan: planInfo, // Asignar el objeto del plan (o null)
            };
        });

        // No necesitas la verificación de !parsedUsers, findMany devuelve [] si no hay resultados
        if (formattedUsers.length === 0) {
            return [];
        }

        return formattedUsers;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
        return [];
    }
}