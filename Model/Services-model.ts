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

// Modelo para Editar un servicio
export interface ServicesModelEdit {
    serviceName: string;
    serviceCost: number;
    dueDate: Date;
    paymentFrequency: string;
    providerName: string;
    contactPerson: string;
    paymentMethod?: string;
    providerPhoneNumber?: string;
}
