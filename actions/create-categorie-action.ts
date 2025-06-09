"use server";

import { db } from "@/lib/db";
import { categorySchema } from "@/lib/zod";
import { z } from "zod";

export const createCategoryAction = async (value: z.infer<typeof categorySchema>) => {
    try {
        const parsed = categorySchema.safeParse(value);

        if (!parsed.success) {
            console.error("Error en la validación de los datos:", parsed.error);
            return {
                success: false,
                message: "Categoría inválida."
            };
        }
        const data = parsed.data;
        const newCategory = await db.category.create({
            data: {
                nameCategory: data.nameCategory,
            }
        })

        if (!newCategory) {
            return {
                success: false,
                message: "No se pudo crear la categoría. Inténtalo de nuevo."
            };
        }

        //* Si todo sale bien, retorna el objeto que contiene la nueva categoria
        return {
            success: true,
            message: "Categoría creada exitosamente.",
            category: newCategory  // Retorno la nueva categoría creada
        };

    } catch (error) {
        console.error("Error al crear la categoría:", error);
        return {
            success: false,
            message: "Ocurrió un error al procesar la solicitud."
        };
    }

}