"use server";

import { db } from "@/lib/db";
import { ServicesModelEdit } from "@/Model/Services-model";

export async function updateServicesPaymentAction(serviceId: string, updatedData: { status: string, dueDate: Date }) {
    try {
        if (!serviceId || !updatedData) {
            throw new Error("El ID del servicio y los datos actualizados son obligatorios" + serviceId + updatedData);
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

export async function updateServiceAction(serviceId: string, service: ServicesModelEdit) {
    try {
        if (!service) {
            throw new Error("El servicio es obligatorio, no se puede actualizar un servicio sin datos");
        }
        const updateService = await db.service.update({
            where: { id: serviceId },
            data: {
                serviceName: service.serviceName,
                serviceCost: service.serviceCost,
                dueDate: service.dueDate,
                paymentFrequency: service.paymentFrequency,
                providerName: service.providerName,
                contactPerson: service.contactPerson,
                paymentMethod: service.paymentMethod,
                providerPhoneNumber: service.providerPhoneNumber,
            }
        }
        );
        if (!updateService) {
            return {
                success: false,
                message: "No se pudo actualizar el servicio"
            };
        }
        return {
            success: true,
            message: "Servicio actualizado exitosamente",
            data: updateService
        };

    } catch (error) {
        console.error("Error al actualizar el servicio:", error);
        throw new Error("Error al actualizar el servicio");

    }
}