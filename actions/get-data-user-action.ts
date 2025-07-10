/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'
import { db } from "@/lib/db";
import { SubscriptionPlanModel } from "@/Model/Subscription-Plan-model";
import { UserModel } from "@/Model/User-model";

export async function getDataUserAction({ page = 1, pageSize = 10 }: {
    page?: number;
    pageSize?: number;
}) {
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
                subscriptionPlan: {
                    select: {
                        id: true,
                        namePlan: true,
                        durationDaysPlan: true,
                        price: true,
                    }
                },
                createdAt: true,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" }, // Ordenar por fecha de creación
        });

        // 2. Contar el total de usuarios
        const totalUsers = await db.createClientModel.count({
            where: {
                subscriptionPlan: { // Ajusta este filtro si es necesario para llamar los datos
                    NOT: undefined
                }
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
        return {
            users: formattedUsers,
            total: totalUsers, // Total de usuarios
        }
    } catch (_) {
        throw new Error("Error al obtener los datos de los usuarios");
    }
}

//* NOTA: Aqui se crea una función adicional para obtener los datos de los usuarios con suscripciones, 
export async function getDataUserActionWithSubscription({
    page = 1,
    pageSize = 10,
}: {
    page?: number;
    pageSize?: number;
}) {
    try {
        // 1. Traer los usuarios paginados
        const usersFromDbSubscription = await db.createClientModel.findMany({
            select: {
                id: true,
                name: true,
                startPlan: true,
                subscriptionPlan: {
                    select: {
                        id: true,
                        namePlan: true,
                        durationDaysPlan: true,
                        price: true,
                    }
                },
                createdAt: true,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
        });

        // 2. Contar el total de usuarios con suscripción
        const total = await db.createClientModel.count({
            where: {
                subscriptionPlan: { // Ajusta este filtro si es necesario para llamar los datos
                    NOT: undefined
                }
            }
        });

        // Mapear los datos a la estructura de UserModel
        const formattedUsers = usersFromDbSubscription.map(user => {
            let planInfo: SubscriptionPlanModel | null = null;
            if (user.subscriptionPlan) {
                planInfo = {
                    id: user.subscriptionPlan.id ? String(user.subscriptionPlan.id) : "",
                    name: user.subscriptionPlan.namePlan,
                    durationDaysPlan: user.subscriptionPlan.durationDaysPlan,
                    price: user.subscriptionPlan.price,
                };
            }
            return {
                id: String(user.id),
                name: String(user.name),
                startPlan: user.startPlan ? user.startPlan.toISOString() : "",
                price: user.subscriptionPlan ? String(user.subscriptionPlan.price) : "",
                createdAt: user.createdAt ? user.createdAt.toISOString() : "",
                subscriptionPlan: planInfo,
            };
        });

        return {
            users: formattedUsers,
            total, // total de usuarios con suscripción
        }
    } catch (_) {
        throw new Error("Error al obtener los datos de los usuarios con suscripción");
    }
}