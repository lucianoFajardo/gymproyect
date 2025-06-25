/* eslint-disable @typescript-eslint/no-unused-vars */

"use server";
import { db } from "@/lib/db";

export async function deleteServiceAction(serviceId: string) {
    try {
        if (!serviceId) {
            throw new Error("servicio no encontrado.");
        }
        const deleteService = await db.service.delete({
            where: {
                id: serviceId,
            }
        });
        if (!deleteService) {
            return {
                success: false,
                message: "No se pudo eliminar el servicio.",
            }
        };
        return {
            success: true,
            message: "Servicio eliminado correctamente.",
        }
    } catch (_) {
        return {
            success: false,
            message: "Error en el servidor al eliminar el servicio.",
        }
    }
}