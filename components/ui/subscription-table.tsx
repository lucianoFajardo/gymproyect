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
import { Edit } from 'lucide-react'; // Añadir más iconos si es necesario
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // Importar Tooltip
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { getDataUserActionWithSubscription } from '@/actions/get-data-user-action';
import { UserModel } from '@/Model/User-model';
import checkSubscriptionExpiration from '@/actions/expiration-subscription-action';



export default function UserSubscriptionManagerTable() {

    type dataFlitred = Omit<UserModel, "lastname" | "age" | "phone" | "gmail" | "createdAt" | "statusPlan">;
    const [dataUserSubscription, setDataUserSubscription] = useState<dataFlitred[]>();
    const [expireSubscription, setExpireSubscription] = useState<Record<string, string>>({});
    const [userStatusMap, setUserStatusMap] = useState<Record<string, string>>({});

    // Primer useEffect para obtener los datos de los usuarios con subscripcion
    useEffect(() => {
        getDataUserActionWithSubscription().then((data) => {
            setDataUserSubscription(data)
            console.log("data->", data)
        })
    }, []);

    // Segundo useEffect para calcular las fechas de expiracion de las subscripciones
    useEffect(() => {
        if (dataUserSubscription && dataUserSubscription!.length > 0) {
            // Procesar todas las fechas de inicio de los planes
            Promise.all(
                dataUserSubscription!.map(async (user) => {
                    const endPlanDay = user.subscriptionPlan?.durationDaysPlan || 0;  //obtengo la duracion del plan y sino me retorna 0
                    console.log("Duracion del plan: ", endPlanDay);
                    const result = await checkSubscriptionExpiration(user.id, user.startPlan, endPlanDay); // aqui guardo el result de la fn
                    return { id: user.id, expireDate: result.expireDate, status: result.status }; // Retornar el ID y la fecha de expiración
                })
            ).then((results) => {
                // Crear el objeto con las fechas de expiración por ID de usuario que tengo registrado
                const expirationMap = results.reduce((acc, { id, expireDate }) => {
                    acc[id] = expireDate;
                    return acc;
                }, {} as Record<string, string>); // Typar los datos con la [Key - value] = Type 
                setExpireSubscription(expirationMap);

                // Crear el objeto con los estados de vencimiento de plan de usuario que tengo registrado
                const statusMap = results.reduce((acc, { id, status }) => {
                    acc[id] = status;
                    return acc;
                }, {} as Record<string, string>); // Typar los datos con la [Key - value] = Type 
                setUserStatusMap(statusMap);
            }).catch(error => {
                console.error("Error calculating subscription expirations:", error);
                // Opcionalmente, manejar el error en la UI
            });
        }
    }, [dataUserSubscription]); // Este useEffect se ejecuta cada vez que el estado 'users' cambia
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
                                <TableHead>Estado Plan</TableHead>
                                <TableHead>Fecha Pago</TableHead>
                                <TableHead>Fecha de Vencimiento</TableHead>
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
                                        {userStatusMap[user.id] ? (
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${userStatusMap[user.id] === "Activo" ? "bg-green-100 text-green-800 " :
                                                    userStatusMap[user.id] === "Inactivo" ? "bg-red-100 text-red-800" :
                                                        "bg-gray-100 text-gray-800" // Estilo por defecto 
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
                                    <TableCell className="text-right">
                                        <TooltipProvider>
                                            <div className="flex justify-end gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => alert(`Editar suscripción de ${user.name}`)}>
                                                            <Edit className="h-4 w-4" />
                                                            <span className="sr-only">Editar</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Editar Suscripción</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
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
        </Card>
    );
}


