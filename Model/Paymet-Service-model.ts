export interface PaymentServiceHistoryModel {
    id: string;
    paymentServiceName: string;
    paymentServiceAmount: string;
    paymentServiceDate: string;
    serviceId: string;
}

export interface PaymentProductModel {
    id: string;
    productId: string;
    priceProduct: number;
    methodPay: string;
    quantity: number;
    totalPay: number;
    createAt: Date;
}