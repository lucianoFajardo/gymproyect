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
import { CalendarIcon, FilterXIcon, ListFilter } from 'lucide-react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale'; // Para formato de fecha en español
import { AssistanceRecord } from '@/Model/Register-Assists-model';
import { getAllDataAssistsActions } from '@/actions/get-data-assists-actions';

export default function RegisterAssistsTable() {
    const [allAssistances, setAllAssistances] = useState<AssistanceRecord[]>([]);
    const [filteredAssistances, setFilteredAssistances] = useState<AssistanceRecord[]>([]);
    const [selectedFilterDate, setSelectedFilterDate] = useState<Date | undefined>(startOfDay(new Date())); // Filtro inicial: día actual
    const [filterActive, setFilterActive] = useState<boolean>(true); // Para saber si hay un filtro de fecha activo

    useEffect(() => {
        getAllDataAssistsActions().then(data => {
            console.log("Datos de asistencia obtenidos:", data);
            setAllAssistances(data)
        });


    }, []);

    // Aplicar filtro cuando cambie la fecha seleccionada o los datos base
    useEffect(() => {
        if (!filterActive || !selectedFilterDate) {
            setFilteredAssistances(allAssistances);
        } else {
            const filtered = allAssistances.filter(assistance =>
                isSameDay(assistance.date, selectedFilterDate)
            );
            setFilteredAssistances(filtered);
        }
    }, [selectedFilterDate, allAssistances, filterActive]);

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

    const currentFilterDescription = useMemo(() => {
        if (!filterActive || !selectedFilterDate) return "Mostrando todos los registros.";
        if (isSameDay(selectedFilterDate, new Date())) return "Mostrando asistencias de Hoy.";
        return `Mostrando asistencias del ${format(selectedFilterDate, 'PPP', { locale: es })}.`;
    }, [selectedFilterDate, filterActive]);

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
                                    disabled={(date) => date > new Date()} // No permitir fechas futuras
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
                        <TableCaption>{filteredAssistances.length === 0 ? "No hay asistencias para mostrar con el filtro actual." : `Total de asistencias mostradas: ${filteredAssistances.length}`}</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Nombre Usuario</TableHead>

                                <TableHead>Fecha y Hora</TableHead>
                                <TableHead>Correo electronico</TableHead>
                                <TableHead>Registrado por</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAssistances.length > 0 ? (
                                filteredAssistances.map((assistance) => (
                                    <TableRow key={assistance.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium py-3 px-4">
                                            {assistance.userName || 'Usuario Desconocido'}
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                {format(new Date(assistance.date), 'Pp', { locale: es })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            {assistance.gmailUser ? (
                                                <a href={`mailto:${assistance.gmailUser}`} className="px-2 py-1 inline-flex leading-5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 hover:underline">
                                                    {assistance.gmailUser}
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground italic">No disponible</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-3 px-4">
                                            <span className="px-2 py-1 inline-flex leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Qr
                                            </span>
                                        </TableCell>

                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    {/* Asegúrate que colSpan coincida con el número de TableHead (ahora 4) */}
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No se encontraron registros de asistencia {filterActive && selectedFilterDate ? `para el ${format(selectedFilterDate, 'PPP', { locale: es })}` : ''}.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}