"use server";

import { db } from "@/lib/db";
import { Product } from "@/Model/Product-model";

export async function getDataProductsAllAction(): Promise<Product[]> {
    try {

        const productsDb = await db.product.findMany({
            select:{
                id: true,
                nameProduct: true,
                descriptionProduct: true,
                priceProduct: true,
                stockProduct: true,
                updateAt: true,
                category:{
                    select: {
                        id: true,
                        nameCategory: true
                    }
                }
            }
        });

        const parsedDataProducts: Product[] = productsDb.map(products => {
            return {
                id: String(products.id),
                nameProduct: String(products.nameProduct),
                descriptionProduct: String(products.descriptionProduct || ""),
                priceProduct: Number(products.priceProduct),
                stockProduct: Number(products.stockProduct),
                updateAtProduct: products.updateAt ? new Date(products.updateAt) : undefined,
                idCategoriProduct: String(products.category!.id),
                nameCategoryProduct: String(products.category!.nameCategory)
            }
        }); 

        if(parsedDataProducts.length === 0) {
            console.error("No se encontraron productos de datos");
            throw new Error("No se encontraron productos de datos");
        };

        return parsedDataProducts; //* Si tengo los datos los puedo retornar

    } catch (error) {
        console.error("Error al obtener los productos de datos:", error);
        throw new Error("Error de servidor al obtener los productos de datos");
    }
}