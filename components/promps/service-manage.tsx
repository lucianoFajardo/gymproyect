"use client";

import { useState, useEffect, useMemo, } from "react"; // Añadido useEffect
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
import { CheckCircle, History, EyeIcon, Trash2, EditIcon, BookAudio, } from "lucide-react";
import { format, addMonths, addDays, addYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { ServicePaymentHistoryModal } from "./service-payment-history-modal";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ServicesModel } from "@/Model/Services-model";
import { getAllDataServiceAction } from "@/actions/get-data-services-action";
import { Separator } from "@radix-ui/react-separator";
import { createPaymentServiceAction } from "@/actions/create-payment-services-action";
import { toast } from "sonner";
import { updateServicesPaymentAction } from "@/actions/update-services-action";
import { PaymentServiceHistoryModel } from "@/Model/Paymet-Service-model";
import { getPaymentServicesAction } from "@/actions/get-data-service-payment-action";
import { deleteServiceAction } from "@/actions/delete-services-action";
import { AlertDialogModalProps } from "./alert-dialog-modal";
import { ServiceViewModal } from "./service-view-modal";
import { getDueDateStatus } from "@/actions/expiration-service-action";
import { EditServiceDialog } from "./update-service-modal";

export function ServiceListTable() {
    useEffect(() => {
        setLoading(true);
        getAllDataServiceAction().then(data => {
            if (!data || data.length === 0) {
                toast.error("No se encontraron servicios.");
                setLoading(false);
                return;
            }
            setServices(data)
            setLoading(false);
        })
    }, []);

    const [services, setServices] = useState<ServicesModel[]>();
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isViewDataServiceOpen, setIsViewDataServiceOpen] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedServiceView, setSelectedServiceView] = useState<ServicesModel[]>();
    const [selectedServiceForDelete, setSelectedServiceForDelete] = useState<ServicesModel | null>();
    const [selectedServiceForHistory, setSelectedServiceForHistory] = useState<ServicesModel | null>();
    const [currentHistoryData, setCurrentHistoryData] = useState<PaymentServiceHistoryModel[]>();
    const [loading, setLoading] = useState(false);
    const [selectedServiceForPaid, setSelectedServiceForPaid] = useState<ServicesModel | null>();
    const [isPaidDialogOpen, setIsPaidDialogOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<ServicesModel | undefined>();

    const handleChangeState = (value: ServicesModel) => {
        setServices((prev) => prev?.map((p) =>
            p.id === value.id ? {
                ...p, dueDate: value.dueDate,
                serviceName: value.serviceName,
                serviceCost: value.serviceCost,
                paymentFrequency: value.paymentFrequency
            }
                : p));
    }

    const handleEdit = (value: ServicesModel) => {
        setServiceToEdit(value);
        setIsDialogOpen(true);
    };

    const handlerPaid = (service: ServicesModel) => {
        setSelectedServiceForPaid(service);
        setIsPaidDialogOpen(true);
    }
    //*** Para crear y a la vez guardar este pago, el cual se almacenara en la base de datos, con un boton tengo que entregarle la info*/
    const handleMarkAsPaid = async () => {
        if (!selectedServiceForPaid) {
            toast.error("La lista de servicios no está disponible.");
            return;
        }
        const initialDueDate = new Date(selectedServiceForPaid.dueDate);
        let newDueDate = new Date(initialDueDate);
        switch (selectedServiceForPaid.paymentFrequency) {
            case "7": newDueDate = addDays(initialDueDate, 7); break;
            case "30": newDueDate = addMonths(initialDueDate, 1); break;
            case "90": newDueDate = addMonths(initialDueDate, 3); break;
            case "360": newDueDate = addYears(initialDueDate, 1); break;
            default:
                toast.warning("Frecuencia de pago no válida. No se puede procesar el pago.");
                return;
        }
        try {
            const paymentResponse = await createPaymentServiceAction(selectedServiceForPaid);
            if (!paymentResponse.success) {
                toast.error(paymentResponse.message || "Error al registrar el pago del servicio.");
                return;
            }
            toast.success("Pago registrado. Actualizando servicio...");
            const serviceUpdatePayload = {
                status: "PAGADO",
                dueDate: newDueDate,
            };
            const updateResponse = await updateServicesPaymentAction(selectedServiceForPaid.id, serviceUpdatePayload);
            if (updateResponse.success) {
                setServices(prevServices =>
                    prevServices!.map(service =>
                        service.id === selectedServiceForPaid.id
                            ? {
                                ...service,
                                ...serviceUpdatePayload,
                                lastPaymentDate: new Date(),
                            }
                            : service
                    )
                );
                toast.success("¡Servicio actualizado exitosamente!");
                setIsPaidDialogOpen(false);
                setSelectedServiceForPaid(null);
            } else {
                toast.error(updateResponse.message || "Error al actualizar el estado del servicio.");
                toast.warning("ADVERTENCIA: El sistema puede estar en un estado inconsistente. Por favor, verifique manualmente.");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
            toast.error(`Error en el servidor: ${errorMessage}`);
        }
    };

    //* Para tener los costes totales de los servicios
    const totalCost = useMemo(() => {
        if (!services || services.length === 0) return 0;
        return services?.reduce((total, service) => total + (service.serviceCost || 0), 0) || 0;
    }, [services]);

    const handleViewDetails = (service: ServicesModel) => {
        setSelectedServiceView(service ? [service] : []);
        setIsViewDataServiceOpen(true);
    }

    const handleDelete = (service: ServicesModel) => {
        setSelectedServiceForDelete(service);
        setIsDeleteDialogOpen(true);
    }

    const handleConfirmDelete = async () => {
        if (!selectedServiceForDelete) {
            toast.error("No se ha seleccionado ningún servicio para eliminar.");
            return;
        }
        try {
            const response = await deleteServiceAction(selectedServiceForDelete.id);
            if (response.success) {
                setServices(prevServices => prevServices?.filter(s => s.id !== selectedServiceForDelete!.id));
                toast.success("Servicio eliminado exitosamente.");
            } else {
                toast.error(response.message || "Error al eliminar el servicio.");
            }
            setIsDeleteDialogOpen(false);
            setSelectedServiceForDelete(undefined);
        } catch (error) {
            toast.error(`Error al eliminar el servicio: ${error}`);
        }
    }

    const handleViewHistory = (service: ServicesModel) => {
        setSelectedServiceForHistory(service);
        getPaymentServicesAction().then(history => {
            const filteredHistory = history.filter(h => h.serviceId === service.id);
            setCurrentHistoryData(filteredHistory);
        });
        setIsHistoryModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <BookAudio className="h-12 w-12 animate-pulse text-primary" />
                <p className="ml-4 text-lg">Crear servicios ...</p>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-5xl mx-auto my-8">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <CardTitle className="text-2xl font-bold">Lista de servicios</CardTitle>
                        <CardDescription className='p-2'>Gestionar los servicio que tienes creados, para poder tener las cuentas al dia.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <CardDescription className="text-sm font-semibold">Total de gastos:</CardDescription>
                        <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            ${totalCost.toLocaleString()}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <div className="rounded-md border-lg overflow-x-auto m-2">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-emerald-600 pointer-events-none">
                            <TableHead className="text-white">Nombre</TableHead>
                            <TableHead className="text-white" >Costo</TableHead>
                            <TableHead className="text-white">Próximo Vencimiento</TableHead>
                            <TableHead className="text-white">Estado de Vencimiento</TableHead>
                            <TableHead className="text-white">Frecuencia</TableHead>
                            <TableHead className="text-right text-white">Acciones</TableHead>
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
                                const dueDateInfo = getDueDateStatus(service.dueDate);
                                return (
                                    <TableRow key={service.id} className="hover:bg-green-50">
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
                                                <Button variant="outline" size="icon" onClick={() => handleEdit(service)}>
                                                    <EditIcon className="h-4 w-4" />
                                                    <span className="sr-only">Modificar</span>
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => handleDelete(service)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Eliminar</span>
                                                </Button>
                                                <Button variant="default" size="icon" onClick={() => handleViewHistory(service)}>
                                                    <History className="h-4 w-4" />
                                                    <span className="sr-only">Ver pagos</span>
                                                </Button>
                                                <Separator orientation="vertical">|</Separator>
                                                <Button variant="outline" size="icon" onClick={() => handlerPaid(service)}>
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

            {/* Modal para poder ver el historial de pagos de este servicio*/}
            {selectedServiceForHistory && (
                <ServicePaymentHistoryModal
                    isOpen={isHistoryModalOpen}
                    onOpenChange={setIsHistoryModalOpen}
                    serviceName={selectedServiceForHistory.serviceName}
                    historyData={currentHistoryData ? currentHistoryData : []}
                />
            )}

            {/* Modal para ver los detalles del servicio */}
            {selectedServiceView && (
                <ServiceViewModal
                    isOpen={isViewDataServiceOpen}
                    onClose={() => setIsViewDataServiceOpen(false)}
                    onOpenChange={setIsViewDataServiceOpen}
                    serviceData={selectedServiceView ? selectedServiceView : []} // Asegúrate de pasar un objeto válido
                />
            )}

            {/* Renderiza el Dialog de modificiacion aquí del servico */}
            {serviceToEdit && (
                <EditServiceDialog
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    service={serviceToEdit}
                    onUpdateService={handleEdit}
                    onChangeState={handleChangeState}
                />
            )}

            {/* Modal para marcar el servicio como pagado */}
            {selectedServiceForPaid && (
                <AlertDialogModalProps
                    title={`Marcar ${selectedServiceForPaid.serviceName} como pagado`}
                    description={`¿Estás seguro de que deseas marcar el servicio ${selectedServiceForPaid.serviceName} como pagado?`}
                    confirmText="Si, marcar como pagado"
                    isOpen={isPaidDialogOpen}
                    onOpenChange={setIsPaidDialogOpen}
                    onclick={handleMarkAsPaid}
                />
            )}

            {/* Dialogo de confirmacion para eliminar el servicio */}
            <AlertDialogModalProps
                title="¿Estás seguro de eliminar este servicio?"
                description="Esta acción no se puede deshacer. Se eliminará permanentemente el servicio del inventario. Perdiendo todos los datos asociados a este servicio."
                confirmText="Si, eliminar"
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onclick={handleConfirmDelete}
            />
        </Card>
    );
}

