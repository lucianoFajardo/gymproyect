"use server";
import { db } from "@/lib/db";
import { PaymentServiceHistoryModel } from "@/Model/Paymet-Service-model";

export const getPaymentServicesAction = async () : Promise<PaymentServiceHistoryModel[]> => {
    try {

        const getPaymentServices = await db.servicePayment.findMany({
            select: {
                id: true,
                paymentDate: true,
                amountPaid: true,
                serviceId: true,
                service: {
                    select: {
                        serviceName: true,
                    }
                }
            }
        });

        const paymentServicesParsed: PaymentServiceHistoryModel[] = getPaymentServices.map(services => {
            return{
                id: services.id,
                paymentServiceName: services.service.serviceName ,
                paymentServiceAmount: services.amountPaid.toString(),
                paymentServiceDate: services.paymentDate.toISOString(),
                serviceId: services.serviceId
            }
        })
        return paymentServicesParsed;
    } catch (error) {
        console.error("Error al obtener los servicios de pago:", error);
        throw new Error("Error al obtener los servicios de pago");
    }
}