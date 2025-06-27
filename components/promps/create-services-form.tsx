"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { BookAudio, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { serviceSchema } from "@/lib/zod";
import { createServiceAction } from "@/actions/create-service-action";
import { useState } from "react";

export function CreateServiceForm() {
    const [isLoading, setIsLoading] = useState(true);
    interface TypePaymentFrequency {
        value: string;
        label: number;
    }

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

    const form = useForm<z.infer<typeof serviceSchema>>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            serviceName: "",
            serviceCost: 0,
            dueDate: new Date(),
            paymentFrequency: "",
            fixedExpense: "FIJO",
            providerName: "",
            contactPerson: "",
            providerPhoneNumber: "",
            status: "ACTIVO",
            paymentMethod: "",
            notes: "",
        },
    });

    const { formState: { isSubmitting } } = form;

    const onSubmit = async (data: z.infer<typeof serviceSchema>) => {
        const res = await createServiceAction(data);
        if (res.error) {
            toast.error("Error al crear el servicio: " + res.message);
            return;
        } else {
            toast.success("Servicio (detallado) creado exitosamente!", {
                description: `Servicio: ${data.serviceName}, Costo: $${data.serviceCost}`,
            });
        }
        form.reset();
    }
    setTimeout(() => {
        setIsLoading(false);
    }, 1000);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <BookAudio className="h-12 w-12 animate-pulse text-primary" />
                <p className="ml-4 text-lg">Crear servicios ...</p>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-3xl mx-auto my-8 shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Crear Nuevo Servicio Detallado</CardTitle>
                <CardDescription>Completa todos los detalles para añadir un nuevo servicio o gasto recurrente.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="serviceName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Servicio</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Luz, Agua, Mantenimiento" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="serviceCost"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Costo del Servicio ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="Ej: 500.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado del Servicio</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ACTIVO">Activo</SelectItem>
                                            <SelectItem value="INACTIVO">Inactivo</SelectItem>
                                            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                            <SelectItem value="PAGADO">Pagado</SelectItem>
                                        </SelectContent>
                                    </Select>
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

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Añade cualquier detalle relevante..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Creando Servicio..." : "Crear Servicio Detallado"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}