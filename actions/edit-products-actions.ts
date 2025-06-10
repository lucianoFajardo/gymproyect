"use server";

import { db } from "@/lib/db";
import { productSchema } from "@/lib/zod";
import { z } from "zod";


type parseEditProduct = z.infer<typeof productSchema>;

export async function editProductAction(idPlanEdit: string , value: parseEditProduct) {
    try {
        const dataValidation = productSchema.safeParse(value);
        if (!dataValidation.success) {
            return {
                success: false,
                error: dataValidation.error,
                message: "Error de validación de datos.",
            }
        }
        const updateProduct = await db.product.update({
            where: {
                id: idPlanEdit, //* el id del producto que se va a editar
            },
            data: {
                nameProduct: value.nameProduct,
                priceProduct: value.priceProduct,
                descriptionProduct: value.descriptionProduct,
                stockProduct: value.stockProduct,
                categoryId: value.categoryProduct, //* el id de la categoria que se va a editar
            }
        });

        if (!updateProduct) {
            return {
                success: false,
                message: "No se pudo actualizar el producto.",
            }
        }

        return {
            success: true,
            data: updateProduct,
            message: "Producto actualizado correctamente.",
        }

    } catch (error) {
        console.error("Error al editar el producto:", error);
        return {
            success: false,
            error: error,
            message: "Error interno del servidor al editar el producto.",
        };
    }
}