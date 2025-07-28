/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { SubscriptionPlanModel } from "@/Model/Subscription-Plan-model";
import { toast } from "sonner";
import { editPlanSubscriptionAction } from "@/actions/edit-plans-action";
import { UserModel } from "@/Model/User-model";
import { getAllSubscriptionPlansAction } from "@/actions/get-subscription-plan-action";

interface UpdateSubscriptionModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    user: Omit<UserModel, "lastname" | "age" | "phone" | "gmail" | "createdAt" | "statusPlan">;
    plan: SubscriptionPlanModel;
    onChangeState: (value: SubscriptionPlanModel) => void;
}

export function UpdateSubscriptionModal({
    isOpen,
    onOpenChange,
    onChangeState,
    user,
    plan,
}: UpdateSubscriptionModalProps) {

    const [selectedPlanIdForChange, setSelectedPlanIdForChange] = useState<string | undefined>();
    const [availablePlans, setAvailablePlans] = useState<SubscriptionPlanModel[]>([]);

    useEffect(() => {
        if (plan) {
            setSelectedPlanIdForChange(plan.id);
        }
    }, [plan]);

    useEffect(() => {
        if (isOpen) {
            getAllSubscriptionPlansAction().then(setAvailablePlans);
        }
    }, [isOpen]);

    const handleSavePlanChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlanIdForChange) {
            toast.error("Selecciona un plan.");
            return;
        }
        try {
            const response = await editPlanSubscriptionAction(user.id, selectedPlanIdForChange);
            if (response && response.success) {
                const updatedPlan = availablePlans.find(p => p.id === selectedPlanIdForChange);
                if (updatedPlan) {
                    onChangeState({
                        ...updatedPlan
                    });
                    toast.success("Plan actualizado correctamente.");
                    onOpenChange(false);
                } else {
                    toast.error("No se encontró el plan actualizado.");
                }
            } else {
                toast.error("Error al actualizar el plan.");
            }
        } catch (error) {
            toast.error("Error en el servidor al actualizar el plan.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Cambiar Plan de: {user.name}</DialogTitle>
                    <DialogDescription>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Plan actual: {plan?.name || "No asignado"}.
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
                    <p className="text-sm m-4 text-yellow-600 text-center px-2 py-1 bg-yellow-50 rounded-md">
                        Al guardar la suscripción con el nuevo plan, se actualizará en la base de datos
                        y se modificará la fecha de pago automáticamente.
                    </p>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit">Guardar Plan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}