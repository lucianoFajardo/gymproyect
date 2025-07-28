export interface AssistanceRecord {
    readonly id: string;  // solamente lectura , ID unico del registro de esa asistencia
    userName: string; // Asumimos que podemos obtener el nombre del usuario
    gmailUser?: string; // Opcional: nombre del plan del usuario en ese momento
    admissionDate: Date;
    exitDate: Date;
}

//* Modelo para la asistencia del usuario