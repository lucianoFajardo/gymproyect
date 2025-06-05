"use server";

import { db } from "@/lib/db";

export async function registerAssistsQrAction(userIdReaderQr: string, date: Date) {
    try {
        //*Si no tengo ningun tipo de datos proporcionados, retornar este mensaje
        if (!userIdReaderQr || !date) {
            return {
                success: false,
                message: 'Datos requeridos no proporcionados'
            }
        }
        //* Encontrar al usuario por su ID y obtener su plan de subscripcion y fecha de inicio
        const findeUser = await db.createClientModel.findUnique({
            where: {
                id: userIdReaderQr
            },
            include: {
                subscriptionPlan: true
            }
        });
        if (!findeUser) {
            return {
                success: false,
                message: 'Usuario no encontrado'
            };
        }
        let isActive = false;
        if (findeUser.subscriptionPlan && findeUser.startPlan) {
            const startDate = new Date(findeUser.startPlan)
            const endDate = new Date(startDate)
            endDate.setDate(startDate.getDate() + findeUser.subscriptionPlan.durationDaysPlan);
            //* El plan es válido si assistanceDate está entre startDate y endDate (inclusive)
            //* Normalizar las fechas a medianoche para comparar solo días
            const normalizedAssistanceDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            //* Ajuste para que endDate incluya todo el día de vencimiento
            normalizedEndDate.setHours(23, 59, 59, 999);
            if (normalizedAssistanceDate >= normalizedStartDate && normalizedAssistanceDate <= normalizedEndDate) {
                isActive = true;
            }
        }
        if (!isActive) {
            return {
                success: false,
                message: `El usuario ${findeUser.name} no tiene un plan activo para esta fecha. Acceso denegado.`,
            };
        }
        //         // 4. Opcional: Verificar si ya existe una asistencia para este usuario en esta fecha (para evitar duplicados en el mismo día)
        // const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        // const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        //* Crear la asistencia en la base de datos con el id del usuario y la fecha que proporcionamos
        const newAssistance = await db.assists.create({
            data: {
                clientId: findeUser.id,
                date: date
            }
        });
        return {
            success: true,
            message: `Asistencia registrada con éxito (vía QR). ${findeUser.name} ¡Bienvenido/a!`,
            data: newAssistance,
        };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
        return { success: false, message: 'Error al registrar asistencia' };
    }


}