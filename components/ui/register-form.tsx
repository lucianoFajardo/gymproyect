"use client"

import { RegisterSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { registerAction } from '@/actions/register-action'

export default function RegisterForm() {

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
        },
    })

    async function onSubmit(values: z.infer<typeof RegisterSchema>) {
        await registerAction(values);
    }
    return (
        <div className='max-w-md mx-auto  p-8 rounded-md shadow-md justify-center m-10 bg-amber-100'>
            <Form {...form}>
                <h1 className="text-2xl font-semibold text-center m-2">Registrar</h1>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre usuario</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Ingresar</Button>
                </form>
            </Form>
        </div>
    )
}
