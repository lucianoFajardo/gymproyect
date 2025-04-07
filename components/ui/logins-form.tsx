"use client"

import { LoginSchema } from '@/lib/zod'
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
import { loginAction } from '@/actions/auth-action'



export default function LoginForm() {

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof LoginSchema>) {
        await loginAction(values)
    }
    return (
        <div className='max-w-md mx-auto  p-8 rounded-md shadow-md justify-center m-10 bg-amber-100'>
            <Form {...form}>
                <h1 className="text-2xl font-semibold text-center m-2">Iniciar sesion</h1>
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
                    <Button type="submit">Ingresar</Button>
                </form>
            </Form>
        </div>
    )
}
