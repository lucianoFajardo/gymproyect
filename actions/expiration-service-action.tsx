"use client";

import { differenceInDays, isPast, isToday } from "date-fns";
import { JSX } from "react"; // Añadido useEffect
import { AlertTriangle, CalendarClock } from "lucide-react"; // Añadido History icon

//* Helper o funcion, para obtener el estado del vencimiento
export const getDueDateStatus = (dueDate: Date): { text: string; variant: "default" | "destructive" | "secondary" | "outline"; icon?: JSX.Element } => {
    const today = new Date();
    const daysUntilDue = differenceInDays(dueDate, today);

    if (isPast(dueDate) && !isToday(dueDate)) {
        return { text: "Vencido", variant: "destructive", icon: <AlertTriangle className=" mr-1" /> };
    }
    if (daysUntilDue <= 0) {
        return { text: "Vence Hoy", variant: "destructive", icon: <AlertTriangle className="h-4 w-4 mr-1" > </AlertTriangle> };
    }
    if (daysUntilDue <= 7) {
        return { text: `Vence en ${daysUntilDue} día(s)`, variant: "default", icon: <CalendarClock className=" mr-1" /> };
    }
    return { text: "Activo", variant: "default" };
};
