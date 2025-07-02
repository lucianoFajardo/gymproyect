"use server";

import { db } from "@/lib/db";
import { CartItemProduct } from "@/Model/Product-model";

export async function createPaymentProductAction(products: CartItemProduct) {
    try {
        if (!products) {
            throw new Error("No hay productos en el carrito para procesar el pago.");
        };
        const newPaymentProduct = await db.productSale.create({
            data: {
                totalPay: products.totalPrice || 0,
                methodPay: products.methodPay || "N/A",
                quantity: products.quantity,
                productId: products.id,
            }
        });
        if (!newPaymentProduct) {
            return {
                success: false,
                message: "No se pudo registrar el pago del producto"
            };
        };
        await db.product.update({
            where: { id: products.id },
            data: {
                stockProduct: {
                    decrement: products.quantity
                }
            }
        })
        return {
            success: true,
            message: "Pago del producto registrado exitosamente",
            data: newPaymentProduct
        };
    } catch (error) {
        console.error("Error creating payment product:", error);
        throw new Error("Error de servidor al registrar el pago del producto");
    }
}