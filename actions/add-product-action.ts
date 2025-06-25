"use server";

import { db } from "@/lib/db";

export async function addProductAction(idProduct: string, quantity: number) {
    try {
        const product = await db.product.findUnique({
            where: {
                id: idProduct,
            },
        });
        if (!product) {
            return {
                success: false,
                message: "Producto no encontrado.",
            };
        }
        const updatedStock = product.stockProduct + quantity;
        const updatedProduct = await db.product.update({
            where: {
                id: idProduct,
            },
            data: {
                stockProduct: updatedStock,
            },
        });
        return {
            success: true,
            data: updatedProduct,
            message: "Cantidad agregada con al stock actual.",
        };
    } catch (error) {
        console.error("Error al agregar producto:", error);
        return {
            success: false,
            error: error,
            message: "Error interno del servidor al agregar el producto.",
        };
    }
}