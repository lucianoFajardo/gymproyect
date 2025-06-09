"use server";

import { db } from "@/lib/db";
import { productSchema } from "@/lib/zod";
import { z } from "zod";

export const createProductAction = async (value: z.infer<typeof productSchema>) => {
    try {
        const parsed = productSchema.safeParse(value);
        if(!parsed.success) {
            console.error("error en la validacion de los datos:", parsed.error);
            return {
                success: false,
                message: "productos invalidos."
            };
        }
        const data = parsed.data;
        console.log("Data validada:", data);

        const newProduct = await db.product.create({
            data:{
                nameProduct: data.nameProduct,
                descriptionProduct: data.descriptionProduct || null,
                priceProduct: data.priceProduct,
                stockProduct: data.stockProduct,
                categoryId: data.categoryProduct, // categoriaID que tenga almacenada en la base de datos
            }
        })
        return {
            success: true,
            message: "Producto creado exitosamente.",
            product: newProduct  // retorno el nuevo producto creado
        }
    } catch (error) {
        console.error("Error al crear el producto:", error);
        return {
            success: false,
            message: error
        };   
    }
}