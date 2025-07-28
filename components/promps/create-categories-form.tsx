"use client";

import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';
import { categorySchema } from '@/lib/zod';
import { createCategoryAction } from '@/actions/create-categorie-action';
import { SquarePen } from 'lucide-react';

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CreateCategoriesForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            nameCategory: "",
        }
    });
    
    setTimeout(() => {
        setIsLoading(false);
    }, 1000);

    const onSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true);
        toast.info("Creando categoría...", { description: "Por favor espera." });
        try {
            const result = await createCategoryAction(data);
            if (result.success) {
                toast.success("Categoría Creada", {
                    description: `La categoría "${data.nameCategory}" ha sido creada exitosamente.`,
                });
                reset(); 
            }
        } catch (error) {
            console.error("Error al enviar el formulario de categoría:", error);
            toast.error("Error Inesperado", {
                description: "Ocurrió un problema al procesar la solicitud.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <SquarePen className="h-12 w-12 animate-pulse text-primary" />
                <p className="ml-4 text-lg">Crear categorias ...</p>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto my-8 shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Crear Nueva Categoría</CardTitle>
                <CardDescription>Ingresa el nombre para la nueva categoría de productos.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <Label htmlFor="category-nameCategory" className='pb-2'>Nombre de la Categoría</Label>
                        <Input
                            id="category-nameCategory"
                            {...register("nameCategory")}
                            placeholder="Ej: Ropa Deportiva, Suplementos"
                            className={errors.nameCategory ? "border-red-500" : ""}
                        />
                        {errors.nameCategory && <p className="text-red-500 text-sm mt-1">{errors.nameCategory.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creando..." : "Crear Categoría"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
