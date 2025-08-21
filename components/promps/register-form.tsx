"use client";

import { RegisterSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
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
import { registerAction } from "@/actions/register-action";
import { UserPlus } from "lucide-react";

export default function RegisterForm() {
    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
        },
    });

    async function onSubmit(values: z.infer<typeof RegisterSchema>) {
        await registerAction(values);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-green-50">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <div className="flex items-center justify-center mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <UserPlus size={24} />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                    Crear Cuenta
                </h1>
                <p className="text-center text-sm text-gray-500 mb-6">
                    Únete a nuestra comunidad y comienza tu viaje con GymProyect.
                </p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700">Nombre</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ingresa tu nombre"
                                            {...field}
                                            className="border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700">Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Ingresa tu correo"
                                            {...field}
                                            className="border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
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
                                    <FormLabel className="text-gray-700">Contraseña</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Crea una contraseña"
                                            {...field}
                                            className="border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-md"
                        >
                            Registrarse
                        </Button>
                    </form>
                </Form>
                <p className="mt-6 text-center text-sm text-gray-500">
                    ¿Ya tienes una cuenta?{" "}
                    <a href="/login" className="text-emerald-500 hover:underline">
                        Inicia sesión
                    </a>
                </p>
            </div>
        </div>
    );
}
