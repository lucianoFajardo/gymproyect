"use server";

import { db } from "@/lib/db";
import { ServicesListModel, ServicesModel } from "@/Model/Services-model";

export async function getDataServiceAction(): Promise<ServicesListModel[]> {
    try {
        const getDataServices = await db.service.findMany({
            select: {
                id: true,
                serviceName: true,
                serviceCost: true,
                dueDate: true,
                paymentFrequency: true,
                status: true,
            }
        });

        if (getDataServices.length === 0) {
            return [];
        }

        const parsedDataServices: ServicesListModel[] = getDataServices.map(services => {
            return {
                serviceId: String(services.id),
                serviceName: services.serviceName,
                serviceCost: services.serviceCost,
                dueDate: services.dueDate ? new Date(services.dueDate) : new Date(),
                paymentFrequency: services.paymentFrequency,
                status: services.status,
                lastPaymentDate: null, // Asignar valor por defecto o calcular si es necesario
                notes: "", // Asignar valor por defecto o calcular si es necesario
            }
        });

        return parsedDataServices;

    } catch (error) {
        console.error("Error fetching data services:", error);
        throw new Error("Failed to fetch data services");

    }
}

export async function getAllDataServiceAction(): Promise<ServicesModel[]> {
    try {
        const getAllDataServices = await db.service.findMany({
            select: {
                id: true,
                serviceName: true,
                serviceCost: true,
                dueDate: true,
                paymentFrequency: true,
                status: true,
                fixedExpense: true, // O "VARIABLE" o "BASICO" según tu enum
                contactPerson: true,
                providerName: true,
                providerPhoneNumber: true,
                paymentMethod: true,
                notes: true,
                ServicePayment:{
                    select: {
                        serviceId:true
                    }
                }
            }
        });

        if (getAllDataServices.length === 0) {
            return [];
        }

        const parsedAllDataServices: ServicesModel[] = getAllDataServices.map(services => {
            return {
                id: services.id,
                serviceName: services.serviceName,
                serviceCost: services.serviceCost,
                dueDate: services.dueDate ? new Date(services.dueDate) : new Date(),
                paymentFrequency: services.paymentFrequency,
                contactPerson: services.contactPerson ,
                providerName: services.providerName,
                providerPhoneNumber: services.providerPhoneNumber,
                paymentMethod: services.paymentMethod || "",
                status: services.status,
                fixedExpense: services.fixedExpense,
                notes: services.notes || "",
            }
        });
        return parsedAllDataServices;
    } catch (error) {
        console.error("Error fetching all data services:", error);
        throw new Error("Failed to fetch all data services");
    }

}