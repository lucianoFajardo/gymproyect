"use client";

import { useState, JSX, useEffect,} from "react"; // Añadido useEffect
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, CalendarClock, History, EyeIcon, } from "lucide-react"; // Añadido History icon
import { format, differenceInDays, isPast, isToday, addMonths, addDays, addYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { ServicePaymentHistoryModal} from "./service-payment-history"; // Importar el modal
import { Card, CardDescription, CardHeader, CardTitle } from "./card";
import { ServicesModel } from "@/Model/Services-model";
import { getAllDataServiceAction } from "@/actions/get-data-services-action";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Separator } from "@radix-ui/react-separator";
import { createPaymentServiceAction } from "@/actions/create-payment-services-action";
import { toast } from "sonner";
import { updateServicesPaymentAction } from "@/actions/update-services-action";
import { PaymentServiceHistoryModel } from "@/Model/Paymet-Service-model";
import { getPaymentServicesAction } from "@/actions/get-data-service-payment-action";

//* Helper o funcion, para obtener el estado del vencimiento
const getDueDateStatus = (dueDate: Date, serviceStatus: ServicesModel["status"]): { text: string; variant: "default" | "destructive" | "secondary" | "outline"; icon?: JSX.Element } => {
    if (serviceStatus === "PAGADO" || serviceStatus === "INACTIVO") {
        return { text: serviceStatus === "PAGADO" ? "Pagado" : "Inactivo", variant: "default" };
    }
    const today = new Date();
    const daysUntilDue = differenceInDays(dueDate, today);
    if (isPast(dueDate) && !isToday(dueDate)) {
        return { text: "Vencido", variant: "destructive", icon: <AlertTriangle className=" mr-1" /> };
    }
    if (daysUntilDue <= 0) {
        return { text: "Vence Hoy", variant: "destructive", icon: <AlertTriangle className="h-4 w-4 mr-1" /> };
    }
    if (daysUntilDue <= 7) {
        return { text: `Vence en ${daysUntilDue} día(s)`, variant: "default", icon: <CalendarClock className=" mr-1" /> };
    }
    return { text: "Activo", variant: "secondary" };
};


export function ServiceListTable() {
    useEffect(() => {
        getAllDataServiceAction().then(data => setServices(data))
    }, []);

    useEffect(() => {
        //TODO : Seguir aqui , llamo a todos los pagos de servicios, para que se carguen al inicio de la aplicacion , despues filtrarlos por el servicio que se nececita
        getPaymentServicesAction().then(history => {
            console.log("Historial de pagos:", history.length);
        });
     }, []);

    const [services, setServices] = useState<ServicesModel[]>();
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isViewDataServiceOpen, setIsViewDataServiceOpen] = useState(true);
    const [selectedService, setSelectedService] = useState<ServicesModel | null>(null);

    const [selectedServiceForHistory, setSelectedServiceForHistory] = useState<ServicesModel | null>(null);
    const [currentHistoryData, setCurrentHistoryData] = useState<PaymentServiceHistoryModel[]>();

    //*** Para crear y a la vez guardar este pago, el cual se almacenara en la base de datos, con un boton tengo que entregarle la info*/
    const handleMarkAsPaid = async (serviceId: string) => {
        const serviceToUpdate = services!.find(s => s.id === serviceId);
        if (!serviceToUpdate) {
            toast.error("Servicio no encontrado.");
            return;
        }
        let newDueDate = new Date(serviceToUpdate.dueDate);
        switch (serviceToUpdate.paymentFrequency) {
            case "7": newDueDate = addDays(new Date(serviceToUpdate.dueDate), 7); break;
            case "30": newDueDate = addMonths(new Date(serviceToUpdate.dueDate), 1); break;
            case "90": newDueDate = addMonths(new Date(serviceToUpdate.dueDate), 3); break;
            case "360": newDueDate = addYears(new Date(serviceToUpdate.dueDate), 1); break;
            default:
                toast.warning("Frecuencia de pago no válida, por favor revisa la configuración del servicio.");
                break;
        }
        try {
            const response = await createPaymentServiceAction(serviceToUpdate);
            //* Primero registro el pago del servicio 
            if (response.success) {
                toast.success("Pago registrado exitosamente");
                //* Creo el payload para actualizar el servicio
                const servicePayload = {
                    status: "PAGADO",
                    dueDate: newDueDate,
                };
                //* Llamo a la funcion para actualizar el servicio con el nuevo estado y fecha de pago.
                const updateResponse = await updateServicesPaymentAction(serviceId, servicePayload);
                if (updateResponse.success) {
                    toast.success("Servicio actualizado exitosamente");
                    //* Actualizar el estado local de los servicios
                    setServices(prevServices =>
                        prevServices!.map(service =>
                            service.id === serviceId
                                ? {
                                    ...service,
                                    status: "PAGADO",
                                    dueDate: newDueDate,
                                    lastPaymentDate: new Date(),
                                }
                                : service
                        )
                    );
                } else {
                    toast.error(updateResponse.message || "Error al actualizar el servicio.");
                }
            } else {
                toast.error(response.message || "Error al registrar el pago del servicio.");
            }
        } catch (error) {
            throw new Error("Error en el servidor al tratar de registrar el pago." + error);
        }
    };

    // const handleEditService = (serviceId: string) => {
    //     console.log(`Editar servicio ${serviceId}`);
    //     // Aquí podrías redirigir a una página de edición o abrir un modal de edición
    //     // Por ahora, solo mostramos un mensaje en la consola
    // };

    const handleViewDetails = (service: ServicesModel) => {
        setSelectedService(service);
        setIsViewDataServiceOpen(true);
    }

    const handleViewHistory = (service: ServicesModel) => {
        setSelectedServiceForHistory(service);
        // En una aplicación real, aquí harías fetch del historial para este service.serviceId
        // Aqui tengo que tener el get de los pagos de este servicio;
        setIsHistoryModalOpen(true);
    };

    return (
        <Card className="w-full max-w-5xl mx-auto my-8">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <CardTitle className="text-2xl font-bold">Lista de servicios</CardTitle>
                        <CardDescription className='p-2'>Gestionar los servicio que tienes creados, para poder tener las cuentas al dia.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <div className="rounded-md border overflow-x-auto m-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Costo</TableHead>
                            <TableHead>Próximo Vencimiento</TableHead>
                            <TableHead>Estado de Vencimiento</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Frecuencia</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    No hay servicios registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            services?.map((service) => {
                                const dueDateInfo = getDueDateStatus(service.dueDate, service.status);
                                return (
                                    <TableRow key={service.id}>
                                        <TableCell className="font-medium">{service.serviceName}</TableCell>
                                        <TableCell className="">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full  bg-purple-100 text-purple-800">
                                                ${service.serviceCost.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full  bg-green-100 text-green-800">
                                                {format(service.dueDate, "PPP", { locale: es })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={dueDateInfo.variant} className="m-1 w-fit">
                                                {dueDateInfo.icon}
                                                {dueDateInfo.text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${service.status === "ACTIVO" ? "bg-gray-200 text-gray-800 " :
                                                service.status === "INACTIVO" ? "bg-red-200 text-red-800" :
                                                    service.status === "PAGADO" ? "bg-green-200 text-green-800" :
                                                        "bg-gray-100 text-gray-800" //* Estilo por defecto 
                                                }`}>
                                                {service.status.charAt(0).toUpperCase() + service.status.slice(1).toLowerCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full  bg-blue-100 text-blue-800">
                                                {service.paymentFrequency} Dias
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <Button variant="outline" size="icon" onClick={() => handleViewDetails(service)}>
                                                    <EyeIcon className="h-4 w-4" />
                                                    <span className="sr-only">Ver</span>
                                                </Button>
                                                <Button variant="default" size="icon" onClick={() => handleViewHistory(service)}>
                                                    <History className="h-4 w-4" />
                                                    <span className="sr-only">Ver pagos</span>
                                                </Button>
                                                <Separator orientation="vertical">|</Separator>
                                                <Button variant="outline" size="icon" onClick={() => handleMarkAsPaid(service.id)}>
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="sr-only">Activar Plan</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Aqui esta el modal para poder ver el historial de pagos de este servicio*/}
            {selectedServiceForHistory && (
                <ServicePaymentHistoryModal
                    isOpen={isHistoryModalOpen}
                    onOpenChange={setIsHistoryModalOpen}
                    serviceName={selectedServiceForHistory.serviceName}
                    historyData={currentHistoryData || []}
                />
            )}

            {/* Aqui podemos visualizar los datos del servicio */}
            {isViewDataServiceOpen && selectedService && ( // Asegúrate que selectedService no sea null
                <Dialog open={isViewDataServiceOpen} onOpenChange={setIsViewDataServiceOpen}>
                    <DialogContent className="max-w-lg"> {/* Ajustado el ancho un poco */}
                        <DialogHeader>
                            <DialogTitle>Detalles del Servicio: {selectedService.serviceName}</DialogTitle>
                            <DialogDescription>
                                Aquí puedes ver los detalles completos del servicio.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3 py-4 max-h-[70vh] overflow-y-auto text-sm pr-2"> {/* pr-2 para espacio de scrollbar */}
                            <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                <span className="font-semibold text-muted-foreground">ID del Servicio:</span>
                                <span>{selectedService.id}</span>
                            </div>
                            <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                <span className="font-semibold text-muted-foreground">Nombre del Servicio:</span>
                                <span className="font-medium">{selectedService.serviceName}</span>
                            </div>
                            <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                <span className="font-semibold text-muted-foreground">Costo del Servicio:</span>
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                    ${selectedService.serviceCost?.toLocaleString()}</span>
                            </div>
                            <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                <span className="font-semibold text-muted-foreground">Próximo Vencimiento:</span>
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {selectedService.dueDate ? format(new Date(selectedService.dueDate), "PPP", { locale: es }) : "-"}</span>
                            </div>
                            <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                <span className="font-semibold text-muted-foreground">Frecuencia de Pago:</span>
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {(selectedService.paymentFrequency)} Dias</span>
                            </div>
                            <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                <span className="font-semibold text-muted-foreground">Tipo de Gasto:</span>
                                <span>{selectedService.fixedExpense}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                <span className="font-semibold text-muted-foreground">Nombre Proveedor:</span>
                                <span>{selectedService.providerName || "-"}</span>
                            </div>
                            <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                <span className="font-semibold text-muted-foreground">Persona de Contacto:</span>
                                <span>{selectedService.contactPerson || "-"}</span>
                            </div>
                            <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                <span className="font-semibold text-muted-foreground">Teléfono Proveedor:</span>
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {selectedService.providerPhoneNumber || "-"}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                                <span className="font-semibold text-muted-foreground">Método de Pago:</span>
                                <span>{selectedService.paymentMethod || "-"}</span>
                            </div>
                            {selectedService.notes && (
                                <div className="grid grid-cols-[150px_1fr] items-start gap-x-4 gap-y-1"> {/* items-start para notas largas */}
                                    <span className="font-semibold text-muted-foreground">Notas:</span>
                                    <span className="whitespace-pre-wrap">{selectedService.notes}</span>
                                </div>
                            )}
                            <hr className="my-2" />
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setIsViewDataServiceOpen(false)} variant="default">
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}


        </Card>
    );
}