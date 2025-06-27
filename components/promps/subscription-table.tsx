"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CalendarDays, ChevronLeft, ChevronRight, Replace } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { getDataUserActionWithSubscription } from '@/actions/get-data-user-action';
import { UserModel } from '@/Model/User-model';
import checkSubscriptionExpiration from '@/actions/expiration-subscription-action';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

import { editSubscriptionPlanAction } from '@/actions/edit-subsription-plan-action';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SubscriptionPlanModel } from '@/Model/Subscription-Plan-model';
import { getAllSubscriptionPlansAction } from '@/actions/get-subscription-plan-action';
import { editPlanSubscriptionAction } from '@/actions/edit-plans-action';

export default function UserSubscriptionManagerTable() {

    const ITEMS_PER_PAGE = 15; // Define cuántos usuarios mostrar por página
    type dataFlitred = Omit<UserModel, "lastname" | "age" | "phone" | "gmail" | "createdAt" | "statusPlan">;
    const [dataUserSubscription, setDataUserSubscription] = useState<dataFlitred[]>();
    const [expireSubscription, setExpireSubscription] = useState<Record<string, string>>({});
    const [userStatusMap, setUserStatusMap] = useState<Record<string, string>>({});
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentUserToEdit, setCurrentUserToEdit] = useState<dataFlitred | null>(null);
    const [newPaymentDate, setNewPaymentDate] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1); //* Estado para la página actual

    //* Función para recargar los datos (opcional, pero útil después de una actualización)
    const fetchData = () => {
        getDataUserActionWithSubscription().then((data) => {
            if (!data || data.length === 0) {
                toast.error("No se encontraron usuarios con suscripciones.");
                setDataUserSubscription([]);
                return;
            }
            setDataUserSubscription(data);
            setCurrentPage(1); // Reiniciar a la primera página al cargar nuevos datos
        });
        // Obtener los planes de subscripcion disponibles
        getAllSubscriptionPlansAction().then(data => setAvailablePlans(data));
    }

    useEffect(() => {
        fetchData();
    }, []);

    //* Lógica de paginación */
    const totalPages = Math.ceil((dataUserSubscription?.length ?? 0) / ITEMS_PER_PAGE);
    const paginatedSubs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return (dataUserSubscription ?? []).slice(startIndex, endIndex);
    }, [dataUserSubscription, currentPage]);
    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };
    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };
    //************************************************ */
    
    useEffect(() => {
        if (dataUserSubscription && dataUserSubscription.length > 0) {
            Promise.all(
                dataUserSubscription.map(async (user) => {
                    const endPlanDay = user.subscriptionPlan!.durationDaysPlan;
                    const result = await checkSubscriptionExpiration(user.id, user.startPlan!, endPlanDay);
                    return { id: user.id, expireDate: result.expireDate, status: result.status };
                })
            ).then((results) => {
                const expirationMap = results.reduce((acc, { id, expireDate }) => {
                    acc[id] = expireDate;
                    return acc;
                }, {} as Record<string, string>);
                setExpireSubscription(expirationMap);

                const statusMap = results.reduce((acc, { id, status }) => {
                    acc[id] = status;
                    return acc;
                }, {} as Record<string, string>);
                setUserStatusMap(statusMap);
            }).catch(error => {
                toast.error("Error al verificar las suscripciones: " + error.message);
            });
        }
    }, [dataUserSubscription]);

    const handleOpenEditDialogSubscription = (user: dataFlitred) => {
        setCurrentUserToEdit(user);
        const currentStartPlanDate = user.startPlan ? new Date(user.startPlan).toISOString().split('T')[0] : "";
        setNewPaymentDate(currentStartPlanDate);
        setIsEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false);
        setCurrentUserToEdit(null);
        setNewPaymentDate("");
    };
    //* --- Función para editar la suscripción (Fechas de pago)---
    const handleSaveSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Guardando suscripción para el usuario:", currentUserToEdit);
        try {
            // Llamar a la nueva acción con los datos correctos
            const formattedDate = new Date(newPaymentDate);
            const updateSubscription = await editSubscriptionPlanAction({
                userId: currentUserToEdit!.id,
                startDate: formattedDate.toISOString()
            })
            if (!updateSubscription.success) {
                console.error("Error al actualizar la suscripción:", updateSubscription.error);
                toast.error("Error al actualizar la suscripción.");
            }
            toast.success("Suscripción actualizada correctamente.");
            console.log("Suscripción actualizada:", updateSubscription.data);
            fetchData();
            handleCloseEditDialog();
        } catch (error) {
            console.error("Error al actualizar la suscripción:", error);
            alert("Error al actualizar la suscripción.");
        }
    };

    //* --- Estados para el diálogo de cambio de plan ---
    const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false);
    const [currentUserToChangePlan, setCurrentUserToChangePlan] = useState<dataFlitred | null>(null);
    const [selectedPlanIdForChange, setSelectedPlanIdForChange] = useState<string | undefined>();
    const [availablePlans, setAvailablePlans] = useState<SubscriptionPlanModel[]>();

    //* --- Funciones para cambiar plan ---
    const handleOpenChangePlanDialog = (user: dataFlitred) => {
        setCurrentUserToChangePlan(user);
        console.log("id Plan Actual:", user.subscriptionPlan?.id);
        setSelectedPlanIdForChange(user.subscriptionPlan?.id); // Preseleccionar plan actual

        //  setAvailablePlans(user.subscriptionPlan ? [user.subscriptionPlan] : []); // Asumir que el usuario tiene un plan asignado
        setIsChangePlanDialogOpen(true);
    };

    const handleCloseChangePlanDialog = () => {
        setIsChangePlanDialogOpen(false);
        setCurrentUserToChangePlan(null);
        setSelectedPlanIdForChange(undefined);
    };

    const handleSavePlanChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("id plan nuevo:", selectedPlanIdForChange);
        if (!currentUserToChangePlan || !selectedPlanIdForChange) {
            toast.error("Por favor, selecciona un usuario y un nuevo plan.");
            return;
        }
        try {
            const updatePlan = await editPlanSubscriptionAction(currentUserToChangePlan.id, selectedPlanIdForChange);
            if (!updatePlan.success) {
                console.error("Error al cambiar el plan:", updatePlan.error);
                toast.error("Error al cambiar el plan.");
                return;
            }
            toast.success("Plan cambiado correctamente.");
            console.log("Plan cambiado:", updatePlan.data);

            fetchData();
            handleCloseChangePlanDialog();
        } catch (error) {
            console.error("Error al cambiar el plan:", error);
            toast.error("Error interno al cambiar el plan.");
        }
    };

    return (
        <Card className="m-4">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <CardTitle className="text-2xl font-bold">Gestion de subscripciones</CardTitle>
                        <CardDescription className='p-2'>Gestionar los datos de subscripciones, cambiar fechas de pago y planes</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableCaption>Lista de subcripciones disponibles.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Usuario</TableHead>
                                <TableHead>Plan Actual</TableHead>
                                <TableHead>Fecha Pago</TableHead>
                                <TableHead>Fecha de Vencimiento</TableHead>
                                <TableHead>Estado Plan</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedSubs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                        Cargando usuarios...
                                    </TableCell>
                                </TableRow>
                            ) :
                                (paginatedSubs.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                {user.subscriptionPlan?.name}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {user.startPlan ? new Date(user.startPlan).toLocaleDateString() : "No disponible"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                {expireSubscription[user.id]}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {userStatusMap[user.id] ? (
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${userStatusMap[user.id] === "Activo" ? "bg-green-100 text-green-800 " :
                                                        userStatusMap[user.id] === "Inactivo" ? "bg-red-100 text-red-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {userStatusMap[user.id]}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                                    Calculando...
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialogSubscription(user)}>
                                                            <CalendarDays className="h-4 w-4" />
                                                            <span className="sr-only">Fechas de pago</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Fechas de pago</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenChangePlanDialog(user)}>
                                                            <Replace className="h-4 w-4" />
                                                            <span className="sr-only">Cambiar plan</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Cambiar Plan</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                )))}
                        </TableBody>
                    </Table>
                </div>
                {dataUserSubscription?.length === 0 && (
                    <p className="text-center text-gray-500 mt-6 py-4">No hay usuarios para mostrar.</p>
                )}

                {/* Controles de Paginación */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4 px-1">
                        <Button
                            variant="link"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button
                            variant="link"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </CardContent>
            {/* Diálogo para editar la suscripción */}
            {currentUserToEdit && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Actualizar Suscripción de: {currentUserToEdit.name}</DialogTitle>
                            <DialogDescription>
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                    Plan actual: {currentUserToEdit.subscriptionPlan?.name || "No asignado"}.
                                </span>
                                <span className="block m-1 px-2 py-1  text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Fecha limite a vencimiento de subscripcion: {expireSubscription[currentUserToEdit.id]}.
                                </span>
                                <span className={`block px-2 py-1 rounded-full text-xs ${userStatusMap[currentUserToEdit.id] === "Activo" ? "bg-green-100 text-green-800 m-1" :
                                    userStatusMap[currentUserToEdit.id] === "Inactivo" ? "bg-red-100 text-red-800 m-1" :
                                        "bg-gray-100 text-gray-800" // Estilo por defecto 
                                    }`}>
                                    Estado: {userStatusMap[currentUserToEdit.id] || "N/A"}.
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSaveSubscription}>
                            <div className="grid gap-6 py-2">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="paymentDate" className="text-right col-span-1">
                                        Fecha de Pago
                                    </Label>
                                    <Input
                                        id="paymentDate"
                                        type="date"
                                        value={newPaymentDate}
                                        onChange={(e) => setNewPaymentDate(e.target.value)}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <p className="text-sm text-yellow-600 text-center px-2 py-1 bg-yellow-50 rounded-md">
                                    Al guardar, la suscripción con la nueva fecha de pago, se actualizara en la base de datos reajustando la fecha automaticamente
                                    tener en cuenta esto antes de actualizar la fecha.
                                </p>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" onClick={handleCloseEditDialog}>
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit">Guardar Cambios</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )};

            {/* Diálogo para Cambiar Plan */}
            {currentUserToChangePlan && (
                <Dialog open={isChangePlanDialogOpen} onOpenChange={setIsChangePlanDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Cambiar Plan de: {currentUserToChangePlan.name}</DialogTitle>
                            <DialogDescription>
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                    Plan actual: {currentUserToChangePlan.subscriptionPlan?.name || "No asignado"}.
                                </span>
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSavePlanChange}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="changePlanSelect" className="text-right col-span-1">
                                        Nuevo Plan
                                    </Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={selectedPlanIdForChange}
                                            onValueChange={setSelectedPlanIdForChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccionar un plan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availablePlans?.map((plan) => (
                                                    <SelectItem key={plan.id} value={plan.id}>
                                                        {plan.name} (${plan.price})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm m-4
                             text-yellow-600 text-center px-2 py-1 bg-yellow-50 rounded-md">
                                Al guardar la suscripción con el nuevo plan , se actualizara en la base de datos
                                y se modificara la fecha de pago automaticamente, tener en cuenta esto antes de actualizar el plan.
                            </p>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" onClick={handleCloseChangePlanDialog}>
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit">Guardar Plan</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </Card>

    );
}
