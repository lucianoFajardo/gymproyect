"use server";

import { db } from "@/lib/db";
import { Category } from "@/Model/Category-model";

export async function getAllCategoriesAction(): Promise<Category[]> {
    try {
        //* Realizamos la consulta a la db y la guardamos en la variable 
        const categoriesDb = await db.category.findMany({
            select: {
                id: true,
                nameCategory: true
            }
        });
        //* Parseo la informacion de la db para poder ocuparla con mi modelo que cree de category
        const parsedCategories: Category[] = categoriesDb.map(categoriesDb => {
            return {
                id: String(categoriesDb.id),
                nameCategory: String(categoriesDb.nameCategory)
            }
        }
        );
        if(parsedCategories.length === 0) {
            console.error("No se encontraron categorías.");
            return []; //* Si no hay categorias, retorno un array vacio
        }

        return parsedCategories; //* Retorno las categorias parseadas

    } catch (error) {
        console.error("Error al obtener las categorías:", error);
        throw new Error("No se pudieron obtener las categorías.");
    }
}