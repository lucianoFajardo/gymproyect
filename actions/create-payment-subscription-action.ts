/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { db } from "@/lib/db";
import { SubscriptionHistoryPaymentModel } from "@/Model/Payment-subscription-model";

export async function createPaymentSubscriptionAction(promps: SubscriptionHistoryPaymentModel) {
    try {
        if (!promps) {
            return {
                success: false,
                message: "Los datos del pago no pueden ser nulos o indefinidos"
            }
        };

        const user = await db.createClientModel.findUnique({
            where: { id: promps.userId },
            include: { subscriptionPlan: true }
        });
        if (!user || !user.subscriptionPlan) {
            return {
                success: false,
                message: "No se encontró el usuario o su plan de suscripción"
            }
        }

        const lastStartPlan = user.startPlan ? new Date(user.startPlan) : new Date();
        const durationDays = user.subscriptionPlan.durationDaysPlan
        const newStartPlan = new Date(lastStartPlan);
        newStartPlan.setDate(newStartPlan.getDate() + durationDays);

        const newPaymentSubscription = await db.paymentSubscription.create({
            data: {
                clientId: promps.userId,
                paymentDate: promps.paymentServiceDate,
                amountPaid: promps.paymentServiceAmount,
                paymentMethodUsed: promps.paymentServicetype,
            }
        });

        await db.createClientModel.update({
            where: { id: promps.userId },
            data: { startPlan: newStartPlan }
        });

        if (!newPaymentSubscription) {
            return {
                success: false,
                message: "No se pudo registrar el pago de la suscripción"
            }
        }
        return {
            success: true,
            message: "Pago de suscripción registrado exitosamente",
            data: {
                payment: newPaymentSubscription,
                newStartPlan,
            }
        }

    } catch (error) {
        throw new Error("Error al crear el pago de la suscripción");
    }
}