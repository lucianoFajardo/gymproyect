"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoginSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { loginAction } from '@/actions/auth-action'
import { AlertCircle } from "lucide-react"

export function LoginForm({

}: React.ComponentPropsWithoutRef<"div">) {

    const [error, setError] = useState<string | null>(null);
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof LoginSchema>) {
        const response = await loginAction(values);
        if (response.error) {
            setError('Error de inicio de sesión, intente nuevamente');
        }
    }

    return (
        <div className={cn("flex flex-col gap-6")} >
            <Card>
                <CardContent>
                    <Form {...form}>
                        <h1 className="text-2xl font-semibold text-center m-2">Iniciar sesion</h1>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid gap-4">
                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Correo electronico</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Correo electronico" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Contraseña" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}>
                                        </FormField>
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Ingresar
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            {error && <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>}
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                Si tienes alguna duda o consulta contactate con nosotros, <a href="#">DevilCorp</a>{" "}
            </div>
        </div>
    )
}
