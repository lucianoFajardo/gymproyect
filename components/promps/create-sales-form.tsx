"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const products = [
    { id: 1, name: "Producto 1", price: 10, stock: 20 },
    { id: 2, name: "Producto 2", price: 15, stock: 10 },
    { id: 3, name: "Proteína", price: 50, stock: 5 },
    { id: 4, name: "Creatina", price: 30, stock: 8 },
];

type CartItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
};

export const CreateSalesForm = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("efectivo");

    const handleAddToCart = (product: typeof products[0]) => {
        setCart((prev) => {
            const found = prev.find((item) => item.id === product.id);
            if (found) {
                return prev.map((item) =>
                    item.id === product.id && item.quantity < product.stock
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const handleRemoveFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const handleQuantityChange = (productId: number, value: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === productId
                    ? { ...item, quantity: Math.max(1, value) }
                    : item
            )
        );
    };

    const calculateTotal = () =>
        cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleConfirmSale = () => {
        // Aquí puedes manejar la lógica de guardar la venta con el método de pago seleccionado
        setCart([]);
        setOpenDialog(false);
        setPaymentMethod("efectivo");
        // Puedes mostrar un toast o mensaje de éxito aquí si lo deseas
    };

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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No hay productos disponibles.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>${product.price}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddToCart(product)}
                                                disabled={
                                                    cart.find((item) => item.id === product.id)?.quantity ===
                                                    product.stock
                                                }
                                            >
                                                Agregar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
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
                                    <TableHead>Total</TableHead>
                                    <TableHead>Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={products.find((p) => p.id === item.id)?.stock ?? 1}
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleQuantityChange(item.id, Number(e.target.value))
                                                }
                                                className="w-16"
                                            />
                                        </TableCell>
                                        <TableCell>${item.price}</TableCell>
                                        <TableCell>${item.price * item.quantity}</TableCell>
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
                    <div className="text-right mt-2 font-bold">
                        Total: ${calculateTotal()}
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
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
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