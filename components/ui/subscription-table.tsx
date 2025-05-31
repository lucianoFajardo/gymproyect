"use client"

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { getDataUserActionWithSubscription } from '@/actions/get-data-user-action';
import { UserModel } from '@/Model/User-model'; // Asumiendo que SubscriptionPlan está en UserModel o importado por separado
import checkSubscriptionExpiration from '@/actions/expiration-subscription-action';
import { Label } from './label';
import { Input } from './input';

import { editSubscriptionPlanAction } from '@/actions/edit-subsription-plan-action';
import { toast } from 'sonner';
// Asumiré que tienes una acción para actualizar la suscripción, por ejemplo:
// import { updateUserSubscriptionAction } from '@/actions/update-user-subscription-action';

export default function UserSubscriptionManagerTable() {

    type dataFlitred = Omit<UserModel, "lastname" | "age" | "phone" | "gmail" | "createdAt" | "statusPlan">;
    const [dataUserSubscription, setDataUserSubscription] = useState<dataFlitred[]>();
    const [expireSubscription, setExpireSubscription] = useState<Record<string, string>>({});
    const [userStatusMap, setUserStatusMap] = useState<Record<string, string>>({});

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentUserToEdit, setCurrentUserToEdit] = useState<dataFlitred | null>(null);
    const [newPaymentDate, setNewPaymentDate] = useState<string>("");



    // Función para recargar los datos (opcional, pero útil después de una actualización)
    const fetchData = () => {
        getDataUserActionWithSubscription().then((data) => {
            setDataUserSubscription(data);
            console.log("Datos de usuarios con suscripciones:", data);
            // El segundo useEffect se encargará de recalcular las expiraciones y estados
        });
        // En una aplicación real, también podrías obtener los planes disponibles aquí si son dinámicos
        // getAvailablePlansAction().then(setAvailablePlans);
    };

    useEffect(() => {
        fetchData();
    }, []);

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
                console.error("Error calculating subscription expirations:", error);
            });
        }
    }, [dataUserSubscription]);

    const handleOpenEditDialog = (user: dataFlitred) => {
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

    return (
        <Card className="m-4">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Gestión de Suscripciones</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
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
                            {dataUserSubscription?.map((user) => (
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
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(user)}>
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Editar</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Actualizar Suscripción</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {dataUserSubscription?.length === 0 && (
                    <p className="text-center text-gray-500 mt-6 py-4">No hay usuarios para mostrar.</p>
                )}
            </CardContent>
            {currentUserToEdit && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Actualizar Suscripción de: {currentUserToEdit.name}</DialogTitle>
                            <DialogDescription>
                                <span className="font-semibold">
                                    Plan actual: {currentUserToEdit.subscriptionPlan?.name || "No asignado"}.
                                </span>
                                <span className="font-semibold block mt-1">
                                    Fecha limite a vencimiento de subscripcion: {expireSubscription[currentUserToEdit.id]}.
                                </span>
                                <span className={`block px-2 py-1 rounded-full text-xs ${userStatusMap[currentUserToEdit.id] === "Activo" ? "bg-green-100 text-green-800 " :
                                    userStatusMap[currentUserToEdit.id] === "Inactivo" ? "bg-red-100 text-red-800" :
                                        "bg-gray-100 text-gray-800" // Estilo por defecto 
                                    }`}>
                                    Estado: {userStatusMap[currentUserToEdit.id] || "N/A"}.
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSaveSubscription}>
                            <div className="grid gap-6 py-2">
                                {/* <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="planId" className="text-right col-span-1">
                                        Cambiar Plan
                                    </Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={newPlanId}
                                            onValueChange={(value) => setNewPlanId(value)}
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
                                </div> */}

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
                                {/* {(userStatusMap[currentUserToEdit.id] === "Inactivo" || currentUserToEdit.subscriptionPlan?.id !== newPlanId) && newPlanId && (
                                    <p className="text-sm text-yellow-600 text-center px-2 py-1 bg-yellow-50 rounded-md">
                                        Al guardar, la suscripción se {userStatusMap[currentUserToEdit.id] === "Inactivo" ? "Reactivará" : "Actualizará"} con el nuevo plan y fecha de pago,
                                        tener en cuenta esto antes de actualizar el plan.
                                    </p>
                                )} */}
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
            )}
        </Card>

    );
}