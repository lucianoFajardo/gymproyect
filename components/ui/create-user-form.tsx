"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CreateClientSchema } from "@/lib/zod"
import { toast } from "sonner"
import { Check, ChevronsUpDown } from "lucide-react"
import { crateClientAction } from "@/actions/create-client-action"
import { useEffect, useState } from "react"
import { getSubscriptionPlanAction } from "@/actions/get-subscription-plan-action"

export default function ProfileForm() {
    interface Plans {
        value: string,
        label: string,
    }
    const [valuesPlan, setValuesPlan] = useState<Plans[]>([]);

    useEffect(() => {
        //* Este useEffect se encarga de traer los planes que el gym tiene disponibles los transforma a el formato que necesitamos.
        const fetchSubscriptionPlans = async () => {
            try {
                const subscriptionPlans = await getSubscriptionPlanAction();
                // Verificar que existan planes de suscripción disponibles.
                if (!subscriptionPlans || subscriptionPlans.length === 0) {
                    throw new Error("No se encontraron planes de suscripción disponibles.");
                }
                // Mapear los planes para el select
                const mappedPlans = subscriptionPlans.map((plan) => ({
                    value: plan.id,
                    label: plan.namePlan,
                }));
                setValuesPlan(mappedPlans);
            } catch (error) {
                console.error("Error al obtener los planes de suscripción:", error);
            }
        };
        fetchSubscriptionPlans();
    }, []);

    const paymentMethods = [
        { value: "debit", label: "Tarjeta de débito" },
        { value: "credit", label: "Tarjeta de crédito" },
        { value: "cash", label: "Efectivo" },
        { value: "transfer", label: "Transferencia" },
    ];

    const form = useForm<z.infer<typeof CreateClientSchema>>({
        resolver: zodResolver(CreateClientSchema), defaultValues: {
            name: "",
            lastname: "",
            phone: "",
            age: 0,
            gmail: "",
            startPlan: "",
            subscriptionPlanId: '',
            methodpay: "",
        },
    })

    const onSubmit = async (value: z.infer<typeof CreateClientSchema>) => {
        try {
            await crateClientAction(value);
            toast.success("Cliente creado con éxito", {
                description: 'Cliente creado con exito y registrado en la base de datos.',
            })
            setTimeout(() => {
                form.reset() // Resetea todos los campos del formulario
            }, 2000) // 3 segundos para mostr
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
            toast.error("No se puede crear el cliente", {
                description: 'Revisar formulario de ingreso.',
            })
        }
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center">
            <div className="w-full max-w-2xl px-4">
                <h1 className="text-2xl font-bold mb-6 text-center">Crear Cliente</h1>
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
                                    <FormLabel>Nombre de usuario</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingrese nombre de usuario" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apellido</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingrese apellido de usuario" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefono</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingrese numero de telefono" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Edad</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Ingrese edad de usuario" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="gmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo electronico</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Correo electronico de usuario" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subscriptionPlanId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de plan</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full justify-between"
                                                >
                                                    {field.value
                                                        ? valuesPlan.find((plan) => plan.value === field.value)?.label
                                                        : "Selecciona un tipo de plan"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Selecciona un tipo de plan..." className="h-9" />
                                                    <CommandList>
                                                        <CommandEmpty>No se encontró un plan disponible</CommandEmpty>
                                                        <CommandGroup>
                                                            {valuesPlan.map((plan) => (
                                                                <CommandItem
                                                                    key={plan.value}
                                                                    onSelect={() => field.onChange(plan.value)}
                                                                >
                                                                    {plan.label}
                                                                    {field.value === plan.value && (
                                                                        <Check className="ml-auto h-4 w-4 text-primary" />
                                                                    )}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="startPlan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de ingreso</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                >
                                                    {field.value
                                                        ? format(new Date(field.value), "P")
                                                        : "Selecciona una fecha"}
                                                </Button>
                                            </PopoverTrigger>
                                            {/* Queda pendiendte trasnformar los datos de data a String para que se pueda almacenar en la base de datos */}
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            const dateString = date.toISOString();
                                                            field.onChange(dateString); // Set the value as a string
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="methodpay"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Método de pago</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full justify-between"
                                                >
                                                    {field.value
                                                        ? paymentMethods.find((method) => method.value === field.value)?.label
                                                        : "Selecciona un método de pago"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar método de pago..." className="h-9" />
                                                    <CommandList>
                                                        <CommandEmpty>No se encontraron métodos de pago.</CommandEmpty>
                                                        <CommandGroup>
                                                            {paymentMethods.map((method) => (
                                                                <CommandItem
                                                                    key={method.value}
                                                                    onSelect={() => field.onChange(method.value)}
                                                                >
                                                                    {method.label}
                                                                    {field.value === method.value && (
                                                                        <Check className="ml-auto h-4 w-4 text-primary" />
                                                                    )}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" >Crear cliente</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

//TODO : ya se puede obtener el plan y crear un cliente , estoy en una rama distinta a la main