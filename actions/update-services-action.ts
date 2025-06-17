"use server";

import { db } from "@/lib/db";


export async function updateServicesPaymentAction(serviceId: string, updatedData: { status: string, dueDate: Date }) {
    try {
        if (!serviceId || !updatedData) {
            throw new Error("El ID del servicio y los datos actualizados son obligatorios" +  serviceId + updatedData);
        };
        const updateServicesDateAndStatus = await db.service.update({
            where: { id: serviceId },
            data: {
                status: updatedData.status,
                dueDate: updatedData.dueDate
            }
        });
        if (!updateServicesDateAndStatus) {
            return {
                success: false,
                message: "No se pudo actualizar el servicio"
            };
        };
        return {
            success: true,
            message: "Servicio actualizado exitosamente, fecha de vencimiento y estado actualizados",
            data: updateServicesDateAndStatus
        };

    } catch (error) {
        console.error("Error al actualizar el servicio:", error);
        throw new Error("Error al actualizar el servicio");
    }

}