"use client"
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CartItemProduct, ProductItem } from "@/Model/Product-model";
import { getDataProductsByCart } from "@/actions/get-data-products-action";
import { toast } from "sonner";
import { ShoppingCartIcon } from "lucide-react";
import { createPaymentProductAction } from "@/actions/create-payment-product-action";


export const CreateSalesForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [cart, setCart] = useState<CartItemProduct[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("efectivo");

    useEffect(() => {
        async function fetchProducts() {
            setIsLoading(true);
            try {
                const res = await getDataProductsByCart();
                if (res.length === 0) {
                    toast.error("No hay productos disponibles para la venta.");
                }
                setProducts(res);
            } catch (error) {
                toast.error("Error al cargar los productos. Por favor, inténtalo de nuevo." + error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProducts();
    }, [])

    const handleRemoveFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const handleQuantityChange = (productId: string, value: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === productId
                    ? { ...item, quantity: Math.max(1, value) }
                    : item
            )
        );
    };

    const calculateTotal = () =>
        cart.reduce((total, item) => total + item.priceProduct * item.quantity, 0);

    const handleConfirmSale = async () => {
        const total = calculateTotal();
        let allSuccess = true;
        let errorMessage = "";

        for (const cartProduct of cart) {
            const ventaItem = {
                ...cartProduct,
                totalPrice: total,
                methodPay: paymentMethod,
                stockProduct: cartProduct.stockProduct - cartProduct.quantity, // Actualiza el stock restando la cantidad vendida
            };
            const res = await createPaymentProductAction(ventaItem);
            if (!res.success) {
                allSuccess = false;
                errorMessage = res.message || "Error al procesar la venta.";
                break;
            }
            console.log("Venta procesada exitosamente:", ventaItem);

        }
        if (!allSuccess) {
            toast.error(errorMessage);
            return;
        }
        toast.success("Venta procesada exitosamente.");
        setProducts((prevProducts) =>
            prevProducts.map((product) => {
                const cartItem = cart.find((item) => item.id === product.id);
                if (cartItem) {
                    return {
                        ...product,
                        stockProduct: product.stockProduct - cartItem.quantity,
                    };
                }
                return product;
            })
        );
        setOpenDialog(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ShoppingCartIcon className="h-12 w-12 animate-pulse text-primary" />
                <p className="ml-4 text-lg">Crear productos ...</p>
            </div>
        );
    }

    return (
        <Card className="max-w-5xl mx-auto space-y-2">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <CardTitle className="text-2xl font-bold">Crear venta de productos</CardTitle>
                        <CardDescription>Crear una venta de un producto registrado en el gimnasio.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-row gap-6">
                {/* Columna izquierda: Productos disponibles */}
                <div className="flex-1 p-4">
                    {
                        products.length === 0 ? (
                            <p className="text-muted-foreground mb-2"> Productos no disponibles por el momento. </p>
                        ) : (
                            <Select
                                onValueChange={(productId) => {
                                    const selectedProduct = products.find(p => p.id === productId);
                                    if (!selectedProduct) {
                                        toast.error("Producto no encontrado.");
                                        return;
                                    };
                                    if (selectedProduct) {
                                        setCart([{ ...selectedProduct, quantity: 1 }]); // Solo un producto en el carrito
                                    };
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.nameProduct} -- ${product.priceProduct.toLocaleString()}, (Stock: {product.stockProduct})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )
                    }
                </div>
                {/* Columna derecha: Carrito */}
                <div className="flex-1 p-4">
                    <h2 className="font-semibold mb-2">Carrito de Venta</h2>
                    {cart.length === 0 ? (
                        <p className="text-muted-foreground">No hay productos en el carrito.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                {item.nameProduct}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={cart.find((p) => p.id === item.id)?.stockProduct ?? 0}
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleQuantityChange(item.id, Number(e.target.value))
                                                }
                                                className="w-16"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                ${item.priceProduct.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRemoveFromCart(item.id)}
                                            >
                                                Eliminar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    <div className="text-right mt-2 font-semibold">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-yellow-100 text-yellow-800">
                            Total: ${calculateTotal().toLocaleString()}
                        </span>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                            <AlertDialogTrigger asChild>
                                <Button disabled={cart.length === 0}>
                                    Confirmar Venta
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Seleccionar método de pago</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Por favor, selecciona el método de pago para finalizar la venta.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="my-4">
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona un método de pago" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="efectivo">Efectivo</SelectItem>
                                            <SelectItem value="debito">Débito</SelectItem>
                                            <SelectItem value="credito">Crédito</SelectItem>
                                            <SelectItem value="transferencia">Transferencia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setCart([])}>Cancelar</AlertDialogCancel>
                                    {/* Confirmar la venta y facturar aqui se encuentra la funcion*/}
                                    <AlertDialogAction onClick={handleConfirmSale}>
                                        Confirmar y Facturar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" onClick={() => setCart([])}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};