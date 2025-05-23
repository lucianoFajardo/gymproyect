"use client";

import { SubscriptionPlanModel } from "./Subscription-Plan-model";
// Cambiar el tipo UserModel para que coincida con el nuevo modelo de datos
export interface UserModel {
    id: string;
    name: string;
    lastname: string;
    age: string;
    phone: string;
    gmail: string;
    startPlan: string;
    statusPlan: string;
    subscriptionPlan: SubscriptionPlanModel | null;
    price: string;
    createdAt: string;
};
