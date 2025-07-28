/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { SubscriptionPlanModel } from "@/Model/Subscription-Plan-model";
import { UserModel } from "@/Model/User-model";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { editSubscriptionPlanAction } from "@/actions/edit-subsription-plan-action";

interface UpdateSubscriptionDatesModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    user: Omit<UserModel, "lastname" | "age" | "phone" | "gmail" | "createdAt" | "statusPlan">;
    onChangeState: (newPaymentDate: Date) => void;
}

export function UpdateDatesSubscriptionModal({
    isOpen,
    onOpenChange,
    onChangeState,
    user,
}: UpdateSubscriptionDatesModalProps) {

    const [newPaymentDate, setNewPaymentDate] = useState<Date | undefined>(undefined);
    
    const handleSaveSubscription = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formattedDate = new Date(String(newPaymentDate));
            const updateSubscription = await editSubscriptionPlanAction({
                userId: user.id,
                startDate: formattedDate.toISOString()
            });
            
            if (!updateSubscription.success) {
                toast.error("Error al actualizar la suscripción.");
            } else {
                
                toast.success("Suscripción actualizada correctamente.");
                onChangeState(formattedDate);
                onOpenChange(false);
                setNewPaymentDate(undefined); // Reset the date after saving
            }
        } catch (_) {
            toast.error("Error al actualizar la suscripción.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Actualizar Suscripción de: {user.name}</DialogTitle>
                    <DialogDescription>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Fechas de pagos: {user.startPlan ? new Date(user.startPlan).toLocaleDateString() : "No asignado"}.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveSubscription}>
                    <div className="grid gap-6 py-2">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="paymentDate" className="text-right col-span-1">
                                Fecha de Pago
                            </Label>
                            <div className="col-span-3">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newPaymentDate
                                                ? newPaymentDate.toLocaleDateString()
                                                : "Seleccionar fecha"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            locale={es}
                                            mode="single"
                                            selected={newPaymentDate}
                                            onSelect={setNewPaymentDate}
                                            initialFocus
                                            disabled={(date) => date > new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <p className="text-sm text-yellow-600 text-center px-2 py-1 bg-yellow-50 rounded-md">
                            Al guardar, la subscripción con la nueva fecha de pago, se actualizará en la base de datos reajustando la fecha automáticamente.
                            Ten en cuenta esto antes de actualizar la fecha.
                        </p>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit">Guardar Cambios</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}