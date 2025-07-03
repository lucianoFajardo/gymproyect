"use server"
import { db } from "@/lib/db";
import { SalesProductModel } from "@/Model/Sales-Product-model";

export async function getSalesProductsAction({
    page = 1,
    pageSize = 10,
    fromDate,
    toDate,
}: { page?: number; pageSize?: number; fromDate?: Date; toDate?: Date }) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (fromDate && toDate) {
            where.createAt = {
                gte: new Date(fromDate.setHours(0, 0, 0, 0)),
                lte: new Date(toDate.setHours(23, 59, 59, 999)),
            };
        } else if (fromDate) {
            where.createAt = {
                gte: new Date(fromDate.setHours(0, 0, 0, 0)),
            };
        } else if (toDate) {
            where.createAt = {
                lte: new Date(toDate.setHours(23, 59, 59, 999)),
            };
        }
        // Si no hay filtro, trae todo (¡cuidado con esto en tablas grandes!)

        const [getSalesProduct, totalCount] = await Promise.all([
            db.productSale.findMany({
                where,
                select: {
                    id: true,
                    quantity: true,
                    methodPay: true,
                    createAt: true,
                    totalPay: true,
                    product: { select: { nameProduct: true } }
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createAt: "desc" }
            }),
            db.productSale.count({ where }),
        ]);

        const saleProductParsed: SalesProductModel[] = getSalesProduct.map((sale) => ({
            id: sale.id,
            productName: sale.product.nameProduct,
            quantity: sale.quantity,
            total: sale.totalPay,
            method: sale.methodPay,
            date: new Date(sale.createAt)
        }));

        return {
            sales: saleProductParsed,
            totalCount,
        };
    } catch (error) {
        console.error("Error fetching sales products:", error);
        throw new Error("Failed to fetch sales products");
    }
}