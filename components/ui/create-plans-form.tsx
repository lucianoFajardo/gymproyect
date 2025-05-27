/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

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

export default function CreatePlansForm() {
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
            //Aqui va el POST para crear el plan
            const res = await createSubscriptionPlanAction(value);
            if (res.error) {
                toast.error("Error al crear el plan de subscripcion");
                return;
            }
            toast.success("Plan de suscripción creado con éxito");
            form.reset();
        }
        catch (_) {
            console.error("Error al crear el plan de suscripción");
        }
    }

    return (
        <div className="flex flex-col m-10 items-center justify-center">
            <div className="w-full max-w-2xl px-4">
                <h1 className="text-2xl font-bold mb-6 text-center">Crear Planes</h1>
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
                                        <Input type="number" placeholder="Ingrese cuantos dias durara el plan: ejemplo (20 dias)" {...field} />
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
                        <Button type="submit" >Crear Plan</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
