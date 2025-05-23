"use client";
// Este componente es para mostrar una tabla de planes de suscripción
export interface SubscriptionPlanModel {
    id?: string;
    name: string;
    price: number;
    // identificationPlan?: string,  //Este es el SubscriptionPlanId de mi db
    description?: string;
    durationDaysPlan: number;
}