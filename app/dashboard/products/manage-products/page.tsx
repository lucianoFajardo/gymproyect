/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit, Trash2, ChevronLeft, ChevronRight, PackageSearch, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Product } from '@/Model/Product-model';
import { Category } from '@/Model/Category-model';
import { productSchema } from '@/lib/zod';
import { getDataProductsAllAction } from '@/actions/get-data-products-action';
import { getAllCategoriesAction } from '@/actions/get-data-categories-action';
import { editProductAction } from '@/actions/edit-products-actions';
import { deleteProductsAction } from '@/actions/delete-products-action';

const ITEMS_PER_PAGE = 10;
export default function ManageProductsPage() {

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>();

    type productFormData = z.infer<typeof productSchema>; //* el esquema que tengo de validacion el zod

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<productFormData>({
        resolver: zodResolver(productSchema),
    });

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getDataProductsAllAction(),
                    getAllCategoriesAction()
                ]);
                setProducts(productsData);
                setCategories(categoriesData);
            } catch (error) {
                throw new Error("Error al cargar los productos o categorías");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    //** Paginacion */
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [products, currentPage]);
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    //** *******************************/

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        reset({ // Cargar datos del producto en el formulario de edición
            nameProduct: product.nameProduct,
            descriptionProduct: product.descriptionProduct || "",
            priceProduct: product.priceProduct,
            stockProduct: product.stockProduct,
            categoryProduct: product.idCategoriProduct || "", // Asegurar de que este campo coincida con el ID de la categoría
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedProduct) return;
        toast.info("Eliminando producto...");
        try {
            const result = await deleteProductsAction(selectedProduct.id);
            if (result.success) {
                setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
                toast.success("Producto eliminado", { description: `"${selectedProduct.nameProduct}" ha sido eliminado.` });
                setIsDeleteDialogOpen(false);
                setSelectedProduct(null);
            } else {
                toast.error("Error al eliminar", { description: result.message || "No se pudo eliminar el producto." });
            }
        } catch (error) {
            toast.error("Error inesperado", { description: "Ocurrió un problema al eliminar." });
        }
    };

    const onEditSubmit = async (data: productFormData) => {

        if (!selectedProduct) return;
        toast.info("Actualizando producto...");
        try {
            const res = await editProductAction(selectedProduct.id, data);
            if (res.success && res.data) {
                setProducts(prev => prev.map(p =>
                    p.id === selectedProduct.id
                        ? {
                            ...p,
                            ...res.data,
                            descriptionProduct: res.data.descriptionProduct ?? "" //* Asegurar que la descripcion no sea undefined
                        }
                        : p
                ));
                toast.success("Producto actualizado", { description: `"${res.data.nameProduct}" ha sido actualizado.` });
                setIsEditDialogOpen(false);
                setSelectedProduct(null);
            } else {
                toast.error("Error al actualizar", { description: res.message || "No se pudo actualizar el producto." });
            }
        } catch (error) {
            toast.error("Error inesperado", { description: "Ocurrió un problema al actualizar." });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <PackageSearch className="h-12 w-12 animate-pulse text-primary" />
                <p className="ml-4 text-lg">Buscando productos ...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <Card className="shadow-lg">
                <CardHeader className="border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold">Gestión de Productos</CardTitle>
                            <CardDescription>Visualiza, edita o elimina los productos de tu inventario.</CardDescription>
                        </div>
                        <Link href="/dashboard/products/create-product" passHref>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Añadir Producto
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableCaption>
                                {products.length === 0
                                    ? "No hay productos para mostrar."
                                    : `Mostrando ${paginatedProducts.length} de ${products.length} productos. Página ${currentPage} de ${totalPages}.`}
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Nombre</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead className="text-right">Precio</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                    <TableHead className='text-center'>Última Modificación</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedProducts.length > 0 ? (
                                    paginatedProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                <span>{product.nameProduct}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    {product.nameCategoryProduct || 'N/A'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">${product.priceProduct.toLocaleString('es-CL')}</TableCell>
                                            <TableCell className="text-right">
                                                <span>
                                                    {product.stockProduct >= 5 ?
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{product.stockProduct}</span>
                                                        : <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{product.stockProduct}</span>}

                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {new Date(product.updateAtProduct!).toLocaleDateString('es-CL')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Editar</span>
                                                    </Button>
                                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(product)}>
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Eliminar</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No se encontraron productos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Anterior
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Diálogo de Edición */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Editar Producto: {selectedProduct?.nameProduct}</DialogTitle>
                        <DialogDescription>Modifica los detalles del producto.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onEditSubmit)} className="grid gap-4 py-4">
                        <div>
                            <Label htmlFor="edit-name">Nombre del Producto</Label>
                            <Input id="edit-name" {...register("nameProduct")} className={errors.nameProduct ? "border-red-500" : ""} />
                            {errors.nameProduct && <p className="text-red-500 text-sm mt-1">{errors.nameProduct.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Descripción</Label>
                            <Textarea id="edit-description" {...register("descriptionProduct")} className={errors.descriptionProduct ? "border-red-500" : ""} />
                            {errors.descriptionProduct && <p className="text-red-500 text-sm mt-1">{errors.descriptionProduct.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-price">Precio</Label>
                                <Input id="edit-price" type="number" {...register("priceProduct")} step="0.01" className={errors.priceProduct ? "border-red-500" : ""} />
                                {errors.priceProduct && <p className="text-red-500 text-sm mt-1">{errors.priceProduct.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="edit-stock">Stock</Label>
                                <Input id="edit-stock" type="number" {...register("stockProduct")} className={errors.stockProduct ? "border-red-500" : ""} />
                                {errors.stockProduct && <p className="text-red-500 text-sm mt-1">{errors.stockProduct.message}</p>}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-category">Categoría</Label>
                            <Select
                                onValueChange={(value) => setValue('categoryProduct', value, { shouldValidate: true })}
                                defaultValue={selectedProduct ? selectedProduct.idCategoriProduct : ""} //* Asegurar que el valor por defecto sea el id de la categoria del producto seleccionado
                            >
                                <SelectTrigger id="edit-category" className={errors.categoryProduct ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.nameCategory}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.categoryProduct && <p className="text-red-500 text-sm mt-1">{errors.categoryProduct.message}</p>}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Diálogo de Confirmación de Eliminación */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de eliminar este producto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el producto ({selectedProduct?.nameProduct}) del inventario.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Sí, eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
