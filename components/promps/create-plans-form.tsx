/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PlansSchema } from "@/lib/zod"
import { createSubscriptionPlanAction } from "@/actions/create-subscription-plan-action"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { useState } from "react"

export default function CreatePlansForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof PlansSchema>>({
        resolver: zodResolver(PlansSchema), defaultValues: {
            name: "",
            price: 0,
            description: "",
            durationDaysPlan: 0,
        },
    })
    const onSubmit = async (value: z.infer<typeof PlansSchema>) => {
        try {
            setIsSubmitting(true);
            toast.info("Creando plan de suscripción...", { description: "Por favor espera." });
            const res = await createSubscriptionPlanAction(value);
            if (res.error) {
                toast.error("Error al crear el plan de subscripcion");
                return;
            }
            setTimeout(() => {
                toast.success("Plan de suscripción creado con exito");
                form.reset();
                setIsSubmitting(false);
            }, 1500);
        }
        catch (_) {
            console.error("Error al crear el plan de suscripción");
        }
    }

    return (
        <div className="flex flex-col m-10 items-center justify-center">
            <div className="w-full max-w-2xl px-4">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                                <CardTitle className="text-2xl font-bold">Crear Plan del gimnasio</CardTitle>
                                <CardDescription>Crear un plan para el gimnasio para poder asignarlo a los clientes.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                className="space-y-8 m-4"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre del Plan</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ingrese nombre del plan: ejemplo (Plan mensual)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Precio</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ingrese cuanto costara el tipo de plan: ejemplo ($20000)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="durationDaysPlan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duracion del plan</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Ingrese cuantos dias durara el plan: ejemplo (20 dias)" {...field}
                                                    min={1}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripcion Plan</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Descripcion breve del plan: (Opcional)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "Creando Producto..." : "Crear Producto"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
