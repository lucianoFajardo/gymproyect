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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FilterXIcon, ListFilter, ChevronLeft, ChevronRight } from 'lucide-react'; // Añadir iconos para paginación y QrCodeIcon
import { format, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { AssistanceRecord } from '@/Model/Register-Assists-model'; // Asegúrate que este modelo tenga 'registeredByMethod'
import { getAllDataAssistsActions } from '@/actions/get-data-assists-actions';

const ITEMS_PER_PAGE = 10; //* aqui se ve cuantas paginas se veran por defecto

export default function RegisterAssistsTable() {
    const [allAssistances, setAllAssistances] = useState<AssistanceRecord[]>([]);
    const [filteredAssistances, setFilteredAssistances] = useState<AssistanceRecord[]>([]);
    const [selectedFilterDate, setSelectedFilterDate] = useState<Date | undefined>(startOfDay(new Date()));
    const [filterActive, setFilterActive] = useState<boolean>(true);

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        getAllDataAssistsActions().then(data => setAllAssistances(data));
    }, []);

    useEffect(() => {
        if (!filterActive || !selectedFilterDate) {
            setFilteredAssistances(allAssistances);
        } else {
            const filtered = allAssistances.filter(assistance =>
                isSameDay(assistance.date, selectedFilterDate)
            );
            setFilteredAssistances(filtered);
        }
        setCurrentPage(1); //* Resetear a la primera página cuando los filtros cambian
    }, [selectedFilterDate, allAssistances, filterActive]);

    const currentFilterDescription = useMemo(() => {
        if (!filterActive || !selectedFilterDate) return "Mostrando todos los registros.";
        if (isSameDay(selectedFilterDate, new Date())) return "Mostrando asistencias de Hoy.";
        return `Mostrando asistencias del ${format(selectedFilterDate, 'PPP', { locale: es })}.`;
    }, [selectedFilterDate, filterActive]);

    //* Lógica de paginación de la tabla
    const totalPages = Math.ceil(filteredAssistances.length / ITEMS_PER_PAGE);
    const paginatedAssistances = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredAssistances.slice(startIndex, endIndex);
    }, [filteredAssistances, currentPage]);

    //* para la siguiente pagina
    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    //* para la pagina anterior
    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleFilterByToday = () => {
        setSelectedFilterDate(startOfDay(new Date()));
        setFilterActive(true);
    };

    const handleClearFilter = () => {
        setSelectedFilterDate(undefined);
        setFilterActive(false);
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedFilterDate(date ? startOfDay(date) : undefined);
        setFilterActive(!!date);
    }

    return (
        <Card className="m-4 shadow-lg">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold">Registros de Asistencia</CardTitle>
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
                        <Button onClick={handleClearFilter} variant="ghost" className="w-full sm:w-auto" disabled={!filterActive}>
                            <FilterXIcon className="mr-2 h-4 w-4" /> Limpiar Filtro
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableCaption>
                            {filteredAssistances.length === 0
                                ? "No hay asistencias para mostrar con el filtro actual."
                                : `Mostrando ${paginatedAssistances.length} de ${filteredAssistances.length} asistencias. Página ${currentPage} de ${totalPages}.`}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Nombre Usuario</TableHead>
                                <TableHead>Fecha y Hora</TableHead>
                                <TableHead>Correo electrónico</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedAssistances.length > 0 ? (
                                paginatedAssistances.map((assistance) => (
                                    <TableRow key={assistance.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium py-3 px-4">
                                            {assistance.userName || 'Usuario Desconocido'}
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {format(assistance.date, 'Pp', { locale: es })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 ">
                                            {assistance.gmailUser ? (
                                                <a href={`mailto:${assistance.gmailUser}`} className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 hover:underline">
                                                    {assistance.gmailUser}
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground italic">No disponible</span>
                                            )}
                                        </TableCell>

                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No se encontraron registros de asistencia {filterActive && selectedFilterDate ? `para el ${format(selectedFilterDate, 'PPP', { locale: es })}` : ''}.
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
