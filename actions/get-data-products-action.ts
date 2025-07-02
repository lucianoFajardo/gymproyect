/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { db } from "@/lib/db";
import { CartItemProduct, Product, ProductItem } from "@/Model/Product-model";

export async function getDataProductsAllAction(): Promise<Product[]> {
    try {
        const productsDb = await db.product.findMany({
            select: {
                id: true,
                nameProduct: true,
                descriptionProduct: true,
                priceProduct: true,
                stockProduct: true,
                updateAt: true,
                category: {
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
        if (parsedDataProducts.length === 0) {
            throw new Error("No se encontraron productos de datos");
        };
        return parsedDataProducts; //* Si tengo los datos los puedo retornar
    } catch (error) {
        throw new Error("Error de servidor al obtener los productos de datos");
    }
}

export async function getDataProductsByCart(): Promise<ProductItem[]> {
    try {
        const cartsDataProduct = await db.product.findMany({
            select: {
                id: true,
                nameProduct: true,
                priceProduct: true,
                stockProduct: true,
            }
        });
        if (cartsDataProduct.length === 0) {
            console.error("No se encontraron productos en el carrito");
            throw new Error("No se encontraron productos en el carrito");
        }
        const parsedDataProducts: ProductItem[] = cartsDataProduct.map(product => {
            return {
                id: String(product.id),
                nameProduct: String(product.nameProduct),
                priceProduct: Number(product.priceProduct),
                stockProduct: Number(product.stockProduct),
                quantity: 1
            }
        });
        return parsedDataProducts; //* Si tengo los datos los puedo retornar
    } catch (error) {
        throw new Error("Error de servidor al obtener los productos del carrito");
    }
}