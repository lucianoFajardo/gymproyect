/* eslint-disable @typescript-eslint/no-unused-vars */
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/promps/alert-dialog" // Asegúrate que la ruta sea correcta
import { Button } from "@/components/ui/button"; // Para botones de acciones
import { Edit, Trash2, } from 'lucide-react'; // Iconos para acciones
import { getAllSubscriptionPlansAction } from '@/actions/get-subscription-plan-action';
import { SubscriptionPlanModel } from '@/Model/Subscription-Plan-model';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from '@radix-ui/react-label';
import { Input } from '../ui/input';
import { PlansSchema } from '@/lib/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { deletePlansAction } from '@/actions/delete-plans-action';
import { editPlanAction } from '@/actions/edit-plans-action';
import { Badge } from "../ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export default function PlansTable() {
    // Aquí eventualmente recibirás tus datos como props o los obtendrás de un estado/contexto
    useEffect(() => {
        getAllSubscriptionPlansAction().then((data) => {
            setPlans(data);
        }).catch((error) => {
            throw new Error("Error al obtener los planes de suscripción: " + error);
        })
    }, []);

    const [plans, setPlans] = useState<SubscriptionPlanModel[]>([])
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currenPlan, setCurrentPlan] = useState<SubscriptionPlanModel | null>(null); // Para almacenar el plan actual que se está editando
    const [editingPlan, setEditingPlan] = useState<Omit<SubscriptionPlanModel, "id">>({
        name: "",
        durationDaysPlan: 0,
        price: 0,
        description: "",
    });
    const [isDeleteOpenDialog, setIsDeleteOpenDialog] = useState<boolean>(false);
    // Para el dialogo de eliminacion de un plan
    const [planToDeleteId, setPlanToDeleteId] = useState<string | null>(null);

    // Función para manejar la edición de un plan
    const handleEditPlans = (value: SubscriptionPlanModel) => {
        setEditingPlan(value);
        setCurrentPlan(value);
        console.log('Editando plan:', value);
        setIsEditDialogOpen(true);
    }

    const handleSaveEdit = async (valueFormEdit: z.infer<typeof PlansSchema>) => {
        if (!valueFormEdit || !currenPlan) {
            toast.error("No se pudo guardar los cambios. Plan no encontrado.");
            return;
        }
        try {
            const updatePlanDb = await editPlanAction(currenPlan.id, valueFormEdit);
            if (updatePlanDb.success) {
                const updatePlan = plans.map((plan) =>
                    plan.id === currenPlan.id
                        ? { ...plan, ...valueFormEdit, price: Number(valueFormEdit.price) }
                        : plan
                );
                setPlans(updatePlan);
                setIsEditDialogOpen(false);
                setCurrentPlan(null)
                toast.success("datos actualizados correctamente")
                getAllSubscriptionPlansAction().then((data) => setPlans(data))
            } else {
                console.error("Error al actualizar el plan:", updatePlanDb.error);
                toast.error("Error al actualizar el plan. Por favor, inténtalo de nuevo.");
            }
        } catch (_) {
            toast.error("Error al guardar los cambios. Por favor, inténtalo de nuevo.");
        }
    }

    const handleDelete = async (planId: string) => {
        // Aquí puedes implementar la lógica para eliminar el plan
        console.log('Eliminando plan con ID:', planId);
        setPlanToDeleteId(planId);
        try {
            const deleteDbPlan = await deletePlansAction(planId);
            if (deleteDbPlan.success) {
                // Actualizar el estado para eliminar el plan de la lista
                setPlans(plans.filter((plan) => plan.id !== planId));
                toast.success("Plan eliminado correctamente");
            } else {
                toast.error("Error al eliminar el plan. Por favor, inténtalo de nuevo.");
            }
        } catch (error) {
            console.error("Error al eliminar el plan:", error);
            toast.error("Error al eliminar el plan. Por favor, inténtalo de nuevo.");
        }
    }

    return (
        <Card className="rounded-md border overflow-x-auto m-4">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <CardTitle className="text-2xl font-bold">Gestion de planes</CardTitle>
                        <CardDescription className='p-2'>Gestionar los planes disponibles del gimnasio, editarlos o eliminarlos.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <div className="rounded-md overflow-x-auto m-4">
                <Table>
                    <TableCaption>Lista de planes de suscripción disponibles.</TableCaption>
                    <TableHeader>
                        <TableRow className='bg-emerald-600 pointer-events-none'>
                            <TableHead className='text-white'>Nombre del Plan</TableHead>
                            <TableHead className='text-white'>Duración (Días)</TableHead>
                            <TableHead className='text-white'>Precio</TableHead>
                            <TableHead className='text-white'>Descripción</TableHead>
                            <TableHead className="text-right text-white">Acciones</TableHead>
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
                            plans.map((plan) => (
                                <TableRow key={plan.id} className='hover:bg-green-50'>
                                    <TableCell>
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                            {plan.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className='bg-blue-400 text-white'>
                                            {plan.durationDaysPlan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className='bg-green-100 text-green-800 '>
                                            ${plan.price.toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{plan.description ? plan.description : "N/A"}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-end gap-2 ">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button className='cursor-pointer' variant="outline" size="icon" onClick={() => handleEditPlans(plan)}>
                                                            <Edit className="h-4 w-4 " />
                                                            <span className="sr-only">Editar</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Editar plan</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <AlertDialog open={isDeleteOpenDialog && planToDeleteId === plan.id} onOpenChange={(open) => {
                                                if (!open) {
                                                    setIsDeleteOpenDialog(false);
                                                    setPlanToDeleteId(null); // Limpiar al cerrar
                                                }
                                            }}>
                                                <AlertDialogTrigger asChild>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    className="cursor-pointer"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        setPlanToDeleteId(plan.id ? plan.id : "");
                                                                        setIsDeleteOpenDialog(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">Eliminar</span>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Eliminar plan</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Esto eliminará permanentemente
                                                            los planes y todas sus relaciones de nuestros servidores, perdiendo toda informacion asociada.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => {
                                                            setIsDeleteOpenDialog(false);
                                                            setPlanToDeleteId(null);
                                                        }}>
                                                            Cancelar
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => {
                                                            if (planToDeleteId) {
                                                                handleDelete(planToDeleteId); // Llama a tu función de eliminar
                                                                setIsDeleteOpenDialog(false); // Cierra el diálogo después de la acción
                                                                setPlanToDeleteId(null);
                                                            }
                                                        }}>
                                                            Sí, eliminar plan.
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/**Dialog para poder editar los datos del plan que se seleccione */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle> Editar datos del plan</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault(); // Prevenir el envío por defecto del navegador
                        handleSaveEdit({ ...editingPlan, price: Number(editingPlan.price) });   // Llamar a tu función de guardado que incluye validación Zod
                    }}>
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre Plan</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={editingPlan?.name || ""}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="durationDaysPlan">Duracion de dias</Label>
                                    <Input
                                        id="durationDaysPlan"
                                        name="durationDaysPlan"
                                        type="number"
                                        value={editingPlan?.durationDaysPlan || 0}
                                        min={1}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, durationDaysPlan: Number(e.target.value) })}
                                    // required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="">Precio</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="1000"
                                        value={editingPlan?.price || 0}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Descripcion</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        value={editingPlan?.description || ""}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar cambios</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card >

    );
}

//TODO: Quede en elminar un plan eso es lo que me esta faltando aqui y crear la fn para la base de datos.