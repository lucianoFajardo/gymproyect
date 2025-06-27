
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

export interface CartItemProduct {
    id: string;
    nameProduct: string;
    priceProduct: number;
    quantity: number;
}