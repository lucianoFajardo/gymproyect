import { Category } from "./Category-model";

export interface Product {
    readonly id: string;
    nameProduct: string;
    descriptionProduct?: string;
    priceProduct: number;
    stockProduct: number;
    categoryProduct:  Category | null;
}