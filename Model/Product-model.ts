
export interface Product {
    id: string;
    nameProduct: string;
    descriptionProduct?: string;
    priceProduct: number;
    stockProduct: number;
    updateAtProduct?: Date;
    idCategoriProduct: string;
    nameCategoryProduct: string;
}