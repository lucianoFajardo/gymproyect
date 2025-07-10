"use client";
import { useEffect, useMemo, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "../ui/table";
import { format, isSameDay, startOfDay } from "date-fns";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ListFilter, ShoppingCartIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { getSalesProductsAction } from "@/actions/get-sales-products-action";
import { SalesProductModel } from "@/Model/Sales-Product-model";

const ITEMS_PER_PAGE = 10;

export default function SalesProductTable() {
    const [sales, setSales] = useState<SalesProductModel[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedFilterDate, setSelectedFilterDate] = useState<Date | undefined>(startOfDay(new Date()));
    const [filterActive, setFilterActive] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        setIsLoading(true);
        getSalesProductsAction({
            page: currentPage,
            pageSize: ITEMS_PER_PAGE,
            fromDate: filterActive && selectedFilterDate ? startOfDay(selectedFilterDate) : undefined,
            toDate: filterActive && selectedFilterDate ? new Date(selectedFilterDate.getFullYear(), selectedFilterDate.getMonth(), selectedFilterDate.getDate(), 23, 59, 59, 999) : undefined
        }).then((res) => {
            setSales(res.sales);
            setTotalCount(res.totalCount);
            setIsLoading(false);
        }).catch((error) => {
            throw new Error(`Error al obtener las ventas: ${error.message}`);
        });
    }, [currentPage, selectedFilterDate, filterActive]);

    const currentFilterDescription = useMemo(() => {
        if (!filterActive || !selectedFilterDate) return "Mostrando todas las ventas.";
        if (isSameDay(selectedFilterDate, new Date())) return "Mostrando ventas de Hoy.";
        return `Mostrando ventas del ${format(selectedFilterDate, 'PPP', { locale: es })}.`;
    }, [selectedFilterDate, filterActive]);
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleFilterByToday = () => {
        setSelectedFilterDate(startOfDay(new Date()));
        setFilterActive(true);
        setCurrentPage(1);
    };

    // const handleClearFilter = () => {
    //     setSelectedFilterDate(undefined);
    //     setFilterActive(false);
    //     setCurrentPage(1);
    // };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedFilterDate(date ? startOfDay(date) : undefined);
        setFilterActive(!!date);
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ShoppingCartIcon className="h-12 w-12 animate-pulse text-primary" />
                <p className="ml-4 text-lg">Buscando ventas ...</p>
            </div>
        );
    }

    return (
        <Card className="m-4 shadow-lg">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold">Ventas</CardTitle>
                        <CardDescription className='p-2'>{currentFilterDescription}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedFilterDate && filterActive ? format(selectedFilterDate, 'dd/MM/yyyy') : "Seleccionar Fecha"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    locale={es}
                                    mode="single"
                                    selected={selectedFilterDate}
                                    onSelect={handleDateSelect}
                                    initialFocus
                                    disabled={(date) => date > new Date()}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button onClick={handleFilterByToday} variant="secondary" className="w-full sm:w-auto">
                            <ListFilter className="mr-2 h-4 w-4" /> Hoy
                        </Button>
                        {/* Deshabilitado por ahora, ya que esto trae todos las ventas que se realizaron */}
                        {/* <Button onClick={handleClearFilter} variant="ghost" className="w-full sm:w-auto" disabled={!filterActive}>
                            <FilterXIcon className="mr-2 h-4 w-4" /> Limpiar Filtro
                        </Button> */}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-lg shadow">
                    <Table>
                        <TableCaption>
                            {sales.length === 0
                                ? "No hay ventas para mostrar con el filtro actual."
                                : `Mostrando ${sales.length} de ${totalCount} ventas. Página ${currentPage} de ${totalPages}.`}
                        </TableCaption>
                        <TableHeader className="bg-emerald-600 pointer-events-none">
                            <TableRow>
                                <TableHead className="text-white">Producto</TableHead>
                                <TableHead className="text-white">Cantidad</TableHead>
                                <TableHead className="text-white">Total</TableHead>
                                <TableHead className="text-white">Método de pago</TableHead>
                                <TableHead className="text-white">Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.length > 0 ? (
                                sales.map((sale) => (
                                    <TableRow key={sale.id} className="hover:bg-emerald-50">
                                        <TableCell className="font-medium py-3 px-4">
                                            {sale.productName}
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {sale.quantity}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                ${sale.total.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                {sale.method}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {format(sale.date, 'Pp', { locale: es })}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No se encontraron ventas {filterActive && selectedFilterDate ? `para el ${format(selectedFilterDate, 'PPP', { locale: es })}` : ''}.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Controles de Paginación */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4 px-1">
                        <Button
                            variant="link"
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
                            variant="link"
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
    );
}