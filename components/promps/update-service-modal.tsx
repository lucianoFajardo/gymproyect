"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import { ServicesModel } from "@/Model/Services-model";
import { toast } from "sonner";
import { updateServiceAction } from "@/actions/update-services-action";
import { serviceUpdateSchema } from "@/lib/zod";

type FormValues = z.infer<typeof serviceUpdateSchema>;

interface EditServiceDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    service: ServicesModel;
    onUpdateService: (values: ServicesModel) => void;
    onChangeState: (value: ServicesModel) => void;
}

interface TypePaymentFrequency {
    value: string;
    label: number;
}

export function EditServiceDialog({ isOpen, onOpenChange, service, onChangeState }: EditServiceDialogProps) {
    const typePaymentFrecuency = [
        {
            value: "Semanal",
            label: 7,
        }, {
            value: "Mensual",
            label: 30,
        }, {
            value: "Trimestral",
            label: 90,
        }, {
            value: "Anual",
            label: 360,
        }] as TypePaymentFrequency[];

    const form = useForm<FormValues>({
        resolver: zodResolver(serviceUpdateSchema),
    });

    useEffect(() => {
        if (service) {
            form.reset({
                serviceName: service.serviceName,
                serviceCost: service.serviceCost,
                dueDate: new Date(service.dueDate),
                paymentFrequency: service.paymentFrequency,
                providerName: service.providerName || "N/A",
                contactPerson: service.contactPerson || "N/A",
                paymentMethod: service.paymentMethod || "N/A",
                providerPhoneNumber: service.providerPhoneNumber || "N/A",
            });
        }
    }, [service, form]);

    async function onSubmit(values: FormValues) {
        try {
            if (!service || !service.id) {
                toast.error("Servicio no encontrado o ID no válido.");
                return;
            }
            const safeValues = {
                ...values,
                fixedExpense: values.fixedExpense || "FIJO",
                providerName: values.providerName ?? "N/A",
                contactPerson: values.contactPerson ?? "N/A",
                paymentMethod: values.paymentMethod ?? "N/A",
                providerPhoneNumber: values.providerPhoneNumber ?? "N/A",
            };
            const response = await updateServiceAction(service.id, safeValues);
            if (response.success) {
                toast.success(response.message);
                onChangeState({
                    ...service,
                    ...safeValues,
                    dueDate: safeValues.dueDate ? new Date(safeValues.dueDate) : service.dueDate,
                });
            } else {
                toast.error(response.message || "Error al actualizar el servicio.");
            }
        } catch (error) {
            toast.error(`Error al actualizar el servicio: ${error}`);
        }
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Servicio</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del servicio. Haz clic en guardar cuando termines.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">

                        <FormField control={form.control} name="serviceName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Servicio</FormLabel>
                                <FormControl><Input placeholder="Ej: Agua, Luz, etc..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="serviceCost" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Costo del Servicio</FormLabel>
                                <FormControl><Input type="number" placeholder="$20000" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Próxima Fecha de Vencimiento</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn("w-full md:w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                >
                                                    {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es} />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fixedExpense"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Gasto</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="FIJO">Fijo</SelectItem>
                                            <SelectItem value="BASICO">Básico</SelectItem>
                                            <SelectItem value="VARIABLE">Variable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentFrequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Frecuencia de Pago</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona la frecuencia" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {typePaymentFrecuency.map((item) => {
                                                return (
                                                    <SelectItem key={item.value} value={String(item.label)}>
                                                        {item.value}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="providerName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Proveedor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Energía del Sol S.A." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contactPerson"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Persona de Contacto (Proveedor)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Juan Pérez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="providerPhoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono del Proveedor</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="Ej: +56912345678" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Método de Pago (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Débito automático, Transferencia" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}