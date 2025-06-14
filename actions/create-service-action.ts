"use server";

import { db } from "@/lib/db";
import { serviceSchema } from "@/lib/zod";
import { z } from "zod";

export const createServiceAction = async (value: z.infer<typeof serviceSchema>) => {
    try {
        if (!value) {
            return {
                error: true,
                message: "No se proporcionaron datos para crear el servicio",
                data: null,
            };
        }
        const dataParsedService = serviceSchema.safeParse(value);
        if (!dataParsedService.success) {
            return {
                error: true,
                message: "Error de validación de datos al crear el servicio",
                data: null,
            };
        };

        const newServiceDb = await db.service.create({
            data: {
                serviceName: dataParsedService.data.serviceName,
                serviceCost: dataParsedService.data.serviceCost,
                dueDate: dataParsedService.data.dueDate,
                paymentFrequency: dataParsedService.data.paymentFrequency,
                fixedExpense: dataParsedService.data.fixedExpense,
                providerName: dataParsedService.data.providerName || "",
                contactPerson: dataParsedService.data.contactPerson || "",
                providerPhoneNumber: dataParsedService.data.providerPhoneNumber || "",
                status: dataParsedService.data.status,
                paymentMethod: dataParsedService.data.paymentMethod,
                notes: dataParsedService.data.notes,
            }
        });

        if (!newServiceDb) {
            return {
                error: true,
                message: "Error al crear el servicio en la base de datos",
                data: null,
            };
        }

        return {
            error: false,
            message: "Servicio creado exitosamente",
            data: newServiceDb,
        };
    } catch (error) {
        console.error("Error al crear el servicio:", error);
        return {
            error: true,
            message: "Error al crear el servicio",
            data: null,
        };
    }
}