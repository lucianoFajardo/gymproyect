"use client";

import { ServicesModel } from "@/Model/Services-model";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ServiceViewModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onClose: () => void;
    serviceData: ServicesModel[];
}

export function ServiceViewModal({
    isOpen,
    onOpenChange,
    onClose, 
    serviceData,
}: ServiceViewModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                {serviceData.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        No hay historial de pagos para este servicio.
                    </div>
                ) : (
                    <>
                        {
                            serviceData.map((serviceData) => (
                                <>
                                    <DialogHeader key={serviceData.id}>
                                        <DialogTitle>Detalles del Servicio: {serviceData.serviceName}</DialogTitle>
                                        <DialogDescription>
                                            Aquí puedes ver los detalles completos del servicio.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-3 py-4 max-h-[70vh] overflow-y-auto text-sm pr-2">
                                        <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                            <span className="font-semibold text-muted-foreground">ID del Servicio:</span>
                                            <span>{serviceData.id}</span>
                                        </div>
                                        <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                            <span className="font-semibold text-muted-foreground">Nombre del Servicio:</span>
                                            <span className="font-medium">{serviceData.serviceName}</span>
                                        </div>
                                        <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                            <span className="font-semibold text-muted-foreground">Costo del Servicio:</span>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                ${serviceData.serviceCost?.toLocaleString()}</span>
                                        </div>
                                        <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                            <span className="font-semibold text-muted-foreground">Próximo Vencimiento:</span>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {serviceData.dueDate ? format(new Date(serviceData.dueDate), "PPP", { locale: es }) : "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                            <span className="font-semibold text-muted-foreground">Frecuencia de Pago:</span>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {(serviceData.paymentFrequency)} Dias</span>
                                        </div>
                                        <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                            <span className="font-semibold text-muted-foreground">Tipo de Gasto:</span>
                                            <span>{serviceData.fixedExpense}</span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                            <span className="font-semibold text-muted-foreground">Nombre Proveedor:</span>
                                            <span>{serviceData.providerName || "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                            <span className="font-semibold text-muted-foreground">Persona de Contacto:</span>
                                            <span>{serviceData.contactPerson || "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                            <span className="font-semibold text-muted-foreground">Teléfono Proveedor:</span>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {serviceData.providerPhoneNumber || "-"}</span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                            <span className="font-semibold text-muted-foreground">Método de Pago:</span>
                                            <span>{serviceData.paymentMethod || "-"}</span>
                                        </div>
                                        {serviceData.notes && (
                                            <div className="grid grid-cols-[150px_1fr] items-start gap-x-4 gap-y-1">
                                                <span className="font-semibold text-muted-foreground">Notas:</span>
                                                <span className="whitespace-pre-wrap">{serviceData.notes}</span>
                                            </div>
                                        )}
                                        <hr className="my-2" />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={onClose} variant="default">
                                            Cerrar
                                        </Button>
                                    </DialogFooter>
                                </>
                            ))
                        }
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
