
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

export interface ProductItem {
    id: string;
    nameProduct: string;
    priceProduct: number;
    stockProduct: number;
    quantity: number;
}

export interface CartItemProduct {
    id: string;
    nameProduct: string;
    priceProduct: number;
    stockProduct: number;
    methodPay?: string;
    quantity: number;
    totalPrice?: number
}