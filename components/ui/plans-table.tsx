"use client";

import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"; // Ajusta la ruta si es diferente
import { Button } from "@/components/ui/button"; // Para botones de acciones
import { Edit, Trash2, EyeIcon } from 'lucide-react'; // Iconos para acciones
import { getAllSubscriptionPlansAction } from '@/actions/get-subscription-plan-action';
import { SubscriptionPlanModel } from '@/Model/Subscription-Plan-model';


// Datos de ejemplo (reemplazarás esto con tus datos reales)
const examplePlans = [
    { id: "plan1", name: "Plan Básico", duration: 30, price: 29.99, description: "Acceso básico al gimnasio." },
    { id: "plan2", name: "Plan Premium", duration: 90, price: 79.99, description: "Acceso completo y clases." },
    { id: "plan3", name: "Plan Anual", duration: 365, price: 299.99, description: "Todo incluido por un año." },
];

export default function PlansTable() {
    // Aquí eventualmente recibirás tus datos como props o los obtendrás de un estado/contexto

    const [planse, setPlans] = useState<SubscriptionPlanModel[]>([])

    useEffect(() => {
        getAllSubscriptionPlansAction().then((data) => {
            setPlans(data);
            console.log(data);
        })
    }, []);

    const plans = examplePlans; // Usando datos de ejemplo por ahora

    return (
        <div className="rounded-md border overflow-x-auto m-4">
            <div className="flex justify-between items-center m-4 p-2">
                <h1 className="text-2xl font-bold"> Gestión de Planes</h1>
            </div>
            <div className="rounded-md border overflow-x-auto m-4">
                <Table>
                    <TableCaption> Lista de planes de suscripción disponibles.</TableCaption>
                    <TableHeader>
                        <TableRow>

                            <TableHead>Nombre del Plan</TableHead>
                            <TableHead>Duración (Días)</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No hay planes disponibles.
                                </TableCell>
                            </TableRow>
                        ) : (
                            planse.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell>{plan.name}</TableCell>
                                    <TableCell>{plan.durationDaysPlan}</TableCell>
                                    <TableCell>${plan.price.toFixed(0)}</TableCell>
                                    <TableCell className="max-w-xs truncate">{plan.description ? plan.description : "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => console.log('Ver', plan.id)}>
                                                <EyeIcon className="h-4 w-4" />
                                                <span className="sr-only">Ver</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => console.log('Editar', plan.id)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => console.log('Eliminar', plan.id)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Eliminar</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}