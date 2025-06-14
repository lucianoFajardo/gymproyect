// Modelo general para los servicios 
export interface ServicesModel {
    id: string,
    serviceName: string,
    serviceCost: number,
    dueDate: Date,
    paymentFrequency: string,
    fixedExpense: string, // O "VARIABLE" o "BASICO" según tu enum
    providerName: string,
    contactPerson: string,
    providerPhoneNumber: string,
    status: string, // Valor por defecto para el estado
    paymentMethod?: string,
    notes?: string,
}

// Modelo para mostrar en la lista de servicios
export interface ServicesListModel {
    serviceId: string;
    serviceName: string;
    serviceCost: number;
    dueDate: Date;
    paymentFrequency: string;
    status: string;
    lastPaymentDate?: Date | null;
    notes?: string;
}