"use client";

import { Product } from "@/Model/Product-model";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { addProductAction } from "@/actions/add-product-action";
import { toast } from "sonner";

interface ProductDialogModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    onStockUpdate: (productId: string, newStock: number) => void;
}

export function ProductDialogModal({
    isOpen,
    onClose,
    product,
    onStockUpdate,
}: ProductDialogModalProps) {
    const [quantity, setQuantity] = useState<number>(1);

    async function handleAddProduct() {
        try {
            toast.info("Agregando producto al stock...");
            if (quantity <= 0) {
                toast.error("La cantidad debe ser mayor a 0.");
                return;
            }
            const res = await addProductAction(product.id, quantity);
            if (!res.success) {
                toast.error("Error al agregar producto al stock: " + res.message);
                return;
            }
            toast.success("Producto agregado al stock correctamente.");
            if (onStockUpdate) {
                onStockUpdate(product.id, quantity); // <-- Actualiza el state en el padre
            }
            onClose();
        } catch (error) {
            throw new Error("Error en el servidor al agregar producto: " + error);
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Agregar Producto al stock</DialogTitle>
                        <DialogDescription>
                            Aquí puedes agregar la cantidad de productos al stock del inventario.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <form onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 border rounded-lg p-4 bg-gray-50">
                                <h3 className="font-semibold text-lg mb-2">{product.nameCategoryProduct}</h3>
                                <p className="text-gray-600 text-sm">{product.descriptionProduct}</p>
                                <p className="text-sm mt-2">
                                    <span className="font-medium">Stock actual: </span>
                                    <span className="text-blue-600 font-semibold">{product.stockProduct}</span>
                                </p>
                            </div>
                            <div className="col-span-2">
                                <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                                    Cantidad a agregar
                                </label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    placeholder="Ingrese la cantidad"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Nuevo stock: {product.stockProduct + quantity}
                                </p>
                            </div>
                            <DialogFooter className="col-span-2 flex justify-end space-x-2">
                                <Button variant="outline" onClick={onClose}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    Agregar al Stock
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}