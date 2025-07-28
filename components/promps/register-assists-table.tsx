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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { AssistanceRecord } from '@/Model/Register-Assists-model';
import { getAllDataAssistsActions } from '@/actions/get-data-assists-actions';
import { Card, CardDescription, CardTitle } from '../ui/card';

const ITEMS_PER_PAGE = 10;

export default function RegisterAssistsTable() {
    const [Assistances, setAssistances] = useState<AssistanceRecord[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedFilterDate, setSelectedFilterDate] = useState<Date | undefined>(startOfDay(new Date()));
    const [filterActive, setFilterActive] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        getAllDataAssistsActions({
            page: currentPage,
            pageSize: ITEMS_PER_PAGE,
            fromDate: filterActive && selectedFilterDate ? startOfDay(selectedFilterDate) : undefined,
            toDate: filterActive && selectedFilterDate ? new Date(selectedFilterDate.getFullYear(), selectedFilterDate.getMonth(), selectedFilterDate.getDate(), 23, 59, 59, 999) : undefined
        }).then((data) => {
            setAssistances(data.assists);
            setTotalCount(data.totalCount);
        }).catch((error) => {
            throw new Error(`Error al obtener las asistencias: ${error.message}`);
        });
    }, [currentPage, selectedFilterDate, filterActive]);


    const currentFilterDescription = useMemo(() => {
        if (!filterActive || !selectedFilterDate) return "Mostrando todos los registros.";
        if (isSameDay(selectedFilterDate, new Date())) return "Mostrando asistencias de Hoy.";
        return `Mostrando asistencias del ${format(selectedFilterDate, 'PPP', { locale: es })}.`;
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

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedFilterDate(date ? startOfDay(date) : undefined);
        setFilterActive(!!date);
    }

    return (
        <div className='m-5'>
            <Card className="w-full p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold">Gestion de asistencias</CardTitle>
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
                        {/* Deshabilitado por ahora, ya que esto trae todos las asistencias que se registraron */}
                        {/* <Button onClick={handleClearFilter} variant="ghost" className="w-full sm:w-auto" disabled={!filterActive}>
                            <FilterXIcon className="mr-2 h-4 w-4" /> Limpiar Filtro
                        </Button> */}
                    </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <Table>
                        <TableCaption>
                            {Assistances.length === 0
                                ? "No hay asistencias para mostrar con el filtro actual."
                                : `Mostrando ${Assistances.length} de ${Assistances.length} asistencias. Página ${currentPage} de ${totalPages}.`}
                        </TableCaption>
                        <TableHeader>
                            <TableRow className="bg-emerald-600 pointer-events-none">
                                <TableHead className="w-[200px] text-white font-semibold">Nombre Usuario</TableHead>
                                <TableHead className="text-white font-semibold">Fecha de ingreso</TableHead>
                                <TableHead className="text-white font-semibold">Fecha de salida</TableHead>
                                <TableHead className="text-white font-semibold">Correo electrónico</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Assistances.length > 0 ? (
                                Assistances.map((assistance) => (
                                    <TableRow
                                        key={assistance.id}
                                        className='hover:bg-green-50'
                                    >
                                        <TableCell className="font-medium py-3 px-4">
                                            {assistance.userName || 'Usuario Desconocido'}
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {format(assistance.admissionDate, 'Pp', { locale: es })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {assistance.exitDate.getTime() === assistance.admissionDate.getTime()
                                                ? <span className="text-yellow-600 font-semibold">Aún en el gimnasio</span>
                                                : <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    {format(assistance.exitDate, 'Pp', { locale: es })} </span>
                                            }
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            {assistance.gmailUser ? (
                                                <a href={`mailto:${assistance.gmailUser}`} className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 hover:underline">
                                                    {assistance.gmailUser}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 italic">No disponible</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-gray-400">
                                        No se encontraron registros de asistencia {filterActive && selectedFilterDate ? `para el ${format(selectedFilterDate, 'PPP', { locale: es })}` : ''}.
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
                        <span className="text-sm text-gray-500">
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
            </Card>
        </div>
    );
}