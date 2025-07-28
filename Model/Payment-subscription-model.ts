export interface SubscriptionHistoryPaymentModel {
    id: string;
    paymentServiceDate: Date;
    paymentServiceAmount: number;
    paymentServicetype: string;
    userId: string; 
    createdAt?: Date; // Fecha de creación del registro, opcional
    userName?: string;
}