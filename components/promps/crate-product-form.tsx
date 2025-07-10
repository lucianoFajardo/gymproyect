"use client";

import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { productSchema } from '@/lib/zod';
import { createProductAction } from '@/actions/create-product-action';
import { getAllCategoriesAction } from '@/actions/get-data-categories-action';
import { Category } from '@/Model/Category-model';
import { ShoppingBasket } from 'lucide-react';

type ProductFormData = z.infer<typeof productSchema>;

export default function CreateProductForm() {
    useEffect(() => {
        getAllCategoriesAction()
            .then(data => setProductCategories(data))
            .catch(error => { throw new Error("Error al cargar las categorías: " + error.message) });
        setIsLoading(false);
    }, [])

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productCategories, setProductCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            nameProduct: "",
            descriptionProduct: "",
            priceProduct: 0,
            stockProduct: 0,
            categoryProduct: "",
        }
    });

    const onSubmit = async (data: ProductFormData) => {
        setIsSubmitting(true);
        toast.info("Creando producto...", { description: "Por favor espera." });
        await createProductAction(data);
        setTimeout(() => {
            toast.success("Producto creado (simulado)", { description: `El producto "${data.nameProduct}" ha sido añadido.` });
            reset();
            setIsSubmitting(false);
        }, 1500);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ShoppingBasket className="h-12 w-12 animate-pulse text-primary" />
                <p className="ml-4 text-lg">Crear productos ...</p>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto my-8 shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Crear Nuevo Producto</CardTitle>
                <CardDescription>Completa los detalles para añadir un nuevo producto al inventario del gimnasio.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <Label htmlFor="nameProduct" className='pb-2'>Nombre del Producto</Label>
                        <Input
                            id="nameProduct"
                            {...register("nameProduct")}
                            placeholder="Ej: Proteína Whey Vainilla 1kg"
                            className={errors.nameProduct ? "border-red-500" : ""}
                        />
                        {errors.nameProduct && <p className="text-red-500 text-sm mt-1">{errors.nameProduct.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="descriptionProduct" className='pb-2'>Descripción (Opcional)</Label>
                        <Textarea
                            id="descriptionProduct"
                            {...register("descriptionProduct")}
                            placeholder="Describe brevemente el producto, sus beneficios, etc."
                            className={errors.descriptionProduct ? "border-red-500" : ""}
                        />
                        {errors.descriptionProduct && <p className="text-red-500 text-sm mt-1">{errors.descriptionProduct.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="priceProduct" className='pb-2'>Precio Unitario</Label>
                            <Input
                                id="priceProduct"
                                type="number"
                                {...register("priceProduct")}
                                placeholder="Ej: 25000"
                                step="0.01"
                                className={errors.priceProduct ? "border-red-500" : ""}
                            />
                            {errors.priceProduct && <p className="text-red-500 text-sm mt-1">{errors.priceProduct.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="stockProduct" className='pb-2'>Cantidad en Stock</Label>
                            <Input
                                id="stockProduct"
                                type="number"
                                {...register("stockProduct")}
                                placeholder="Ej: 50"
                                className={errors.stockProduct ? "border-red-500" : ""}
                            />
                            {errors.stockProduct && <p className="text-red-500 text-sm mt-1">{errors.stockProduct.message}</p>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="category" className='pb-2'>Categoría</Label>
                        <Select
                            onValueChange={(value) => setValue('categoryProduct', value, { shouldValidate: true })}
                        // {...register("category")} // No se usa register directamente con el Select de Shadcn si se usa onValueChange
                        >
                            <SelectTrigger id="category" className={errors.categoryProduct ? "border-red-500" : ""}>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {productCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.nameCategory}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.categoryProduct && <p className="text-red-500 text-sm mt-1">{errors.categoryProduct.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creando Producto..." : "Crear Producto"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
