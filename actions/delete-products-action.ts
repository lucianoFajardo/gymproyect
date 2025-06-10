"use server";
import { db } from "@/lib/db";

export async function deleteProductsAction(idPlanDelete: string) {
    try {
        const deleteProduct = await db.product.deleteMany({
            where: {
                id: idPlanDelete
            }
        });

        if (!deleteProduct) {
            return {
                success: false,
                message: "No se encontraron productos para eliminar",
            }
        };

        return {
            success: true,
            message: "Producto eliminado con éxito",
            data: deleteProduct,
        }

    } catch (error) {
        console.error("Error al eliminar el producto", error);
        return {
            success: false,
            message: "Error al eliminar el producto. Por favor, intente nuevamente más tarde.",
        }
    }

}