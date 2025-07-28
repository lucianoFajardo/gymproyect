"use server"

import { db } from "@/lib/db";
import { SubscriptionHistoryPaymentModel } from "@/Model/Payment-subscription-model";

export async function getDataPaymentsSubscriptionAction(): Promise<SubscriptionHistoryPaymentModel[]> {
    try {
        const payments = await db.paymentSubscription.findMany({
            select: {
                id: true,
                paymentDate: true,
                amountPaid: true,
                paymentMethodUsed: true,
                client: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                createdAt: true
            }
        });
        const formatedDate: SubscriptionHistoryPaymentModel[] = payments.map(payment => ({
            id: payment.id,
            paymentServiceDate: payment.paymentDate,
            paymentServiceAmount: payment.amountPaid,
            paymentServicetype: payment.paymentMethodUsed ?? "",
            createdAt: payment.createdAt ?? new Date(),
            userName: payment.client.name ?? "",
            userId: payment.client.id
        }));
        return formatedDate;
    } catch (error) {
        throw new Error("Error al obtener los datos de pagos de suscripción: " + error);
    }
}