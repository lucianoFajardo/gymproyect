/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { db } from "@/lib/db";
import { ServicesModel } from "@/Model/Services-model";

export async function createPaymentServiceAction(service: ServicesModel) {
    try {
        if (!service) {
            throw new Error("El servicio no puede ser nulo o indefinido");
        }
        const newPaymentService = await db.servicePayment.create({
            data: {
                serviceId: service.id,
                paymentDate: new Date(), // Fecha actual
                amountPaid: service.serviceCost,
                paymentMethodUsed: service.paymentMethod || "N/A",
            }
        });
        if (!newPaymentService) {
            return {
                success: false,
                message: "No se pudo registrar el servicio de pago"
            }
        }
        return {
            success: true,
            message: "Servicio de pago registrado exitosamente",
            data: newPaymentService
        }
    } catch (error) {
        throw new Error("Error al crear el servicio de pago");
    }
}