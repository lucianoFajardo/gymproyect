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
} from "@/components/ui/alert-dialog" // Asegúrate que la ruta sea correcta
import { Button } from "@/components/ui/button"; // Para botones de acciones
import { Edit, Trash2, } from 'lucide-react'; // Iconos para acciones
import { getAllSubscriptionPlansAction } from '@/actions/get-subscription-plan-action';
import { SubscriptionPlanModel } from '@/Model/Subscription-Plan-model';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from '@radix-ui/react-label';
import { Input } from './input';
import { PlansSchema } from '@/lib/zod';
import { z } from 'zod';
import { editSubscriptionPlanAction } from '@/actions/edit-subsription-plan-action';
import { toast } from 'sonner';
import { deletePlansAction } from '@/actions/delete-plans-action';

export default function PlansTable() {
    // Aquí eventualmente recibirás tus datos como props o los obtendrás de un estado/contexto
    useEffect(() => {
        getAllSubscriptionPlansAction().then((data) => {
            setPlans(data);
            console.log(data);
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
    }); //* Para editar el plan
    const [isDeleteOpenDialog, setIsDeleteOpenDialog] = useState<boolean>(false);
    // Para el dialogo de eliminacion de un plan
    const [planToDeleteId, setPlanToDeleteId] = useState<string | null>(null); // Para almacenar el ID del usuario a eliminar

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
            const updatePlanDb = await editSubscriptionPlanAction(currenPlan.id, valueFormEdit);
            if (updatePlanDb.success) {
                const updatePlan = plans.map((plan) =>
                    plan.id === currenPlan.id
                        ? { ...plan, ...valueFormEdit, price: Number(valueFormEdit.price) }
                        : plan
                );
                setPlans(updatePlan); // Actualizar el estado con el plan editado
                setIsEditDialogOpen(false); // Cerrar el diálogo después de guardar
                setCurrentPlan(null)
                toast.success("datos actualizados correctamente")
                getAllSubscriptionPlansAction().then((data) => setPlans(data))
            } else {
                console.error("Error al actualizar el plan:", updatePlanDb.error);
                toast.error("Error al actualizar el plan. Por favor, inténtalo de nuevo.");
            }


        } catch (error) {
            console.error("Error al guardar los cambios:", error);
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
        <div className="rounded-md border overflow-x-auto m-4">
            <div className="flex justify-between items-center m-4 p-2">
                <h1 className="text-2xl font-bold"> Gestión de Planes</h1>
            </div>

            <div className="rounded-md border overflow-x-auto m-4">
                <Table>
                    <TableCaption>Lista de planes de suscripción disponibles.</TableCaption>
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
                            plans.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell>{plan.name}</TableCell>
                                    <TableCell>{plan.durationDaysPlan}</TableCell>
                                    <TableCell>${plan.price}</TableCell>
                                    <TableCell className="max-w-xs truncate">{plan.description ? plan.description : "N/A"}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditPlans(plan)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                            <AlertDialog open={isDeleteOpenDialog && planToDeleteId === plan.id} onOpenChange={(open) => {
                                                if (!open) {
                                                    setIsDeleteOpenDialog(false);
                                                    setPlanToDeleteId(null); // Limpiar al cerrar
                                                }
                                            }}>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setPlanToDeleteId(plan.id ? plan.id : "");
                                                            setIsDeleteOpenDialog(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Eliminar</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Esto eliminará permanentemente
                                                            al usuario y sus datos de nuestros servidores, perdiendo toda informacion asociada.
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
                    {/* Envolver el contenido en un <form> */}
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
                                        name="name" // Añadir name para accesibilidad y potencial uso con FormData
                                        value={editingPlan?.name || ""}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                    // required // Puedes añadir validación nativa si lo deseas
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="durationDaysPlan">Duracion de dias</Label>
                                    <Input
                                        id="durationDaysPlan"
                                        name="durationDaysPlan"
                                        type="number" // Asegúrate de que sea un número
                                        value={editingPlan?.durationDaysPlan || 0}
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
                                        type="number" // Asegúrate de que sea un número
                                        value={editingPlan?.price || 0}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                                    // required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Descripcion</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        value={editingPlan?.description || ""} // Mantener como string aquí si editForm.age es string
                                        onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                    // min="0" // Validación nativa para edad no negativa
                                    // required
                                    />
                                </div>
                            </div>

                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false); // Cerrar el diálogo sin guardar
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar cambios</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


            {/* AlertDialog para confirmar la eliminación del plan
            <AlertDialog open={isDeleteOpenDialog} onOpenChange={() => console.log('Cerrando dialogo de eliminacion')}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el plan
                            y podría afectar a los usuarios subscritos a este plan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteOpenDialog(false)}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            
                            console.log("Si, Eliminar plan")
                        }} className="bg-red-600 hover:bg-red-700">
                            Sí, eliminar plan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog> */}

        </div>

    );
}

//TODO: Quede en elminar un plan eso es lo que me esta faltando aqui y crear la fn para la base de datos.