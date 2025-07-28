/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useEffect, useState } from 'react';
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
import { CalendarDays, CheckCircle, ChevronLeft, ChevronRight, History, Replace } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { getDataUserActionWithSubscription } from '@/actions/get-data-user-action';
import { UserModel } from '@/Model/User-model';
import checkSubscriptionExpiration from '@/actions/expiration-subscription-action';
import { toast } from 'sonner';
import { SubscriptionPlanModel } from '@/Model/Subscription-Plan-model';
import { getAllSubscriptionPlansAction } from '@/actions/get-subscription-plan-action';
import { UpdateSubscriptionModal } from './update-subscription-modal';

import { UpdateDatesSubscriptionModal } from './update-dates-subscriptions-modal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialogModalProps } from './alert-dialog-modal';
import { createPaymentSubscriptionAction } from '@/actions/create-payment-subscription-action';
import { SubscriptionHistoryPaymentModel } from '@/Model/Payment-subscription-model';
import { getDataPaymentsSubscriptionAction } from '@/actions/get-data-payments-subscription-action';
import { get } from 'http';
import { HistoryModalPaymentSubs } from './history-modal-payment-subs';

export default function UserSubscriptionManagerTable() {
    const ITEMS_PER_PAGE = 15;
    type dataFlitred = Omit<UserModel, "lastname" | "age" | "phone" | "gmail" | "createdAt" | "statusPlan">;
    const [dataUserSubscription, setDataUserSubscription] = useState<dataFlitred[]>([]);
    const [expireSubscription, setExpireSubscription] = useState<Record<string, string>>({});
    const [userStatusMap, setUserStatusMap] = useState<Record<string, string>>({});

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentUserToEdit, setCurrentUserToEdit] = useState<dataFlitred | null>(null);

    const [currentUserPayment, setCurrentUserPayment] = useState<dataFlitred | null>(null);
    const [isPaidDialogOpen, setIsPaidDialogOpen] = useState(false);

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [currentHistoryData, setCurrentHistoryData] = useState<SubscriptionHistoryPaymentModel[] | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [_, setAvailablePlans] = useState<SubscriptionPlanModel[]>([]);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<dataFlitred | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanModel | null>(null);

    const handleOpenUpdateModal = (user: dataFlitred, plan: SubscriptionPlanModel) => {
        setSelectedUser(user);
        setSelectedPlan(plan);
        setIsUpdateModalOpen(true);
    };

    // Cargar planes solo una vez
    useEffect(() => {
        getAllSubscriptionPlansAction().then(data => setAvailablePlans(data));
    }, []);

    // Cargar usuarios paginados
    useEffect(() => {
        getDataUserActionWithSubscription({ page: currentPage, pageSize: ITEMS_PER_PAGE }).then((data) => {
            if (!data || !data.users || data.users.length === 0) {
                toast.error("No se encontraron usuarios con suscripciones.");
                setDataUserSubscription([]);
                setTotalUsers(0);
                return;
            }
            setDataUserSubscription(data.users);
            setTotalUsers(data.total);
        });
    }, [currentPage]);

    // Calcular expiración y estado de cada usuario de la página actual
    useEffect(() => {
        if (dataUserSubscription.length > 0) {
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

    const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleOpenEditDialogSubscription = (user: dataFlitred) => {
        setCurrentUserToEdit(user);
        setIsEditDialogOpen(true);
    };

    const handlePaid = (user: dataFlitred) => {
        setCurrentUserPayment(user);
        setIsPaidDialogOpen(true);
    }

    const handleSavePaymentSubscription = async () => {
        if (!currentUserPayment) return;
        try {
            const paymentData = {
                id: currentUserPayment.id,
                paymentServiceDate: new Date(),
                paymentServiceAmount: currentUserPayment.subscriptionPlan!.price,
                paymentServicetype: "N/A",
                userId: currentUserPayment.id,
            };
            const response = await createPaymentSubscriptionAction(paymentData);
            if (response.success) {
                toast.success(response.message);
                console.log("Pago de suscripción registrado:", response.data);
                setIsPaidDialogOpen(false);
                setCurrentUserPayment(null);
                setDataUserSubscription((prev) =>
                    prev.map((user) =>
                        user.id === currentUserPayment!.id
                            ? { ...user, startPlan: response.data?.newStartPlan ? new Date(response.data.newStartPlan).toISOString() : user.startPlan }
                            : user
                    )
                );
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Error al registrar el pago de la suscripción.");
        }
    }

    const handleViewPaymentHistory = async (userData: dataFlitred) => {
        setIsHistoryModalOpen(true);
        getDataPaymentsSubscriptionAction().then(data => {
            const filtredData = data.filter(payment => payment.userId === userData.id);
            if (filtredData.length === 0) {
                toast.info("No hay historial de pagos para este usuario.");
                setCurrentHistoryData([]);
                return;
            }
            setCurrentHistoryData(filtredData);
            console.log("Historial de pagos:", filtredData);
        }).catch((error) => {
            toast.error("Error al obtener el historial de pagos: " + error.message);
        })
    }


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
                <div className="overflow-x-auto rounded-lg">
                    <Table>
                        <TableCaption>Lista de subcripciones disponibles.</TableCaption>
                        <TableHeader>
                            <TableRow className='bg-emerald-600 pointer-events-none'>
                                <TableHead className="w-[200px] text-white">Usuario</TableHead>
                                <TableHead className='text-white'>Plan Actual</TableHead>
                                <TableHead className='text-white'>Fecha Pago</TableHead>
                                <TableHead className='text-white'>Fecha de Vencimiento</TableHead>
                                <TableHead className='text-white'>Estado Plan</TableHead>
                                <TableHead className="text-right text-white">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dataUserSubscription.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                        Cargando usuarios...
                                    </TableCell>
                                </TableRow>
                            ) : (
                                dataUserSubscription.map((user) => (
                                    <TableRow key={user.id} className='hover:bg-green-50'>
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="icon">
                                                        <span className="sr-only">Acciones</span>
                                                        {/* Puedes usar un icono de tres puntos */}
                                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                                            <circle cx="4" cy="10" r="2" />
                                                            <circle cx="10" cy="10" r="2" />
                                                            <circle cx="16" cy="10" r="2" />
                                                        </svg>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className='hover:bg-gray-100' onClick={() => handleOpenEditDialogSubscription(user)}>
                                                        <CalendarDays className="h-4 w-4 mr-2 text-purple-600" /> Cambiar fechas de pago
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className='hover:bg-gray-100' onClick={() => handleOpenUpdateModal(user, user.subscriptionPlan!)}>
                                                        <Replace className="h-4 w-4 mr-2 text-blue-600" /> Cambiar plan
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className='hover:bg-gray-100' onClick={() => handlePaid(user)}>
                                                        <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" /> Registrar pago
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className='hover:bg-gray-100' onClick={() => handleViewPaymentHistory(user)}>
                                                        <History className="h-4 w-4 mr-2 text-gray-600" /> Historial de pagos
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {dataUserSubscription.length === 0 && (
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

            {
                // Modal para ver historial de pagos del usuario
                isHistoryModalOpen && currentHistoryData && (
                    <HistoryModalPaymentSubs
                        isOpen={isHistoryModalOpen}
                        onOpenChange={setIsHistoryModalOpen}
                        data={currentHistoryData}
                    />
                )
            }

            {
                // Modal para editar fechas de pago
                currentUserToEdit && (
                    <UpdateDatesSubscriptionModal
                        isOpen={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        user={currentUserToEdit}
                        onChangeState={(newPaymentDate) => {
                            setDataUserSubscription((prev) =>
                                prev.map((user) =>
                                    user.id === currentUserToEdit.id
                                        ? { ...user, startPlan: newPaymentDate?.toISOString() || user.startPlan }
                                        : user
                                )
                            );
                        }}
                    />
                )
            }

            { // Modal para actualizar la suscripción
                selectedUser && selectedPlan && (
                    <UpdateSubscriptionModal
                        isOpen={isUpdateModalOpen}
                        onOpenChange={setIsUpdateModalOpen}
                        user={selectedUser}
                        plan={selectedPlan}
                        onChangeState={(newPlan) => {
                            setSelectedPlan(newPlan);
                            setDataUserSubscription((prev) =>
                                prev.map((user) =>
                                    user.id === selectedUser.id
                                        ? { ...user, subscriptionPlan: newPlan }
                                        : user
                                )
                            );
                        }}
                    />
                )}

            { // Modal para registrar el pago de la suscripción
                currentUserPayment && (
                    <AlertDialogModalProps
                        isOpen={isPaidDialogOpen}
                        onOpenChange={setIsPaidDialogOpen}
                        title="Registrar Pago de Suscripción"
                        description={`¿Estás seguro de que deseas marcar la suscripción de ${currentUserPayment.name} como pagada?. 
                        Una vez registrado el pago se almacenará en el historial de pagos, asegurate de que el pago se haya realizado antes de continuar.`}
                        confirmText="Si, registrar pago"
                        onclick={handleSavePaymentSubscription}
                    />
                )
            }

        </Card>
    );
}