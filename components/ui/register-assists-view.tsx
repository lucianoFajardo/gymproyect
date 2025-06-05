"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Scanner } from '@yudiel/react-qr-scanner';
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner';

import { User as UserIcon, CalendarIcon as CalendarLucideIcon, QrCodeIcon} from 'lucide-react'; // Renombrado User a UserIcon para evitar conflicto
import { toast } from 'sonner';
import { useQRCode } from 'next-qrcode';

// Mock data - Reemplazar con datos reales del backend
interface MockUser {
    id: string;
    name: string;
    status: 'activo' | 'inactivo';
    qrCodeValue?: string; // Para simular la búsqueda por QR
}

const MOCK_USERS: MockUser[] = [
    { id: 'user1', name: 'Juan Pérez', status: 'inactivo', qrCodeValue: 'juan_perez_qr_123' },
    { id: 'user2', name: 'Ana Gómez', status: 'inactivo', qrCodeValue: 'ana_gomez_qr_456' },
    { id: 'user3', name: 'Luis Fernández', status: 'activo', qrCodeValue: 'luis_fernandez_qr_789' },
    { id: 'user4', name: 'Maria Rodríguez', status: 'activo', qrCodeValue: 'maria_rodriguez_qr_101' },
];

export default function RegisterAssistsView() {
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [qrCodeInput, setQrCodeInput] = useState<string>("");

    // En un caso real, estos usuarios vendrían de una llamada a la API
    const [users] = useState<MockUser[]>(MOCK_USERS);

    // Simulación de lógica de registro manual
    const handleManualRegister = () => {
       ;
        if (!selectedUserId || !selectedDate) {
            return;
        }
        const user = users.find(u => u.id === selectedUserId);
        if (!user) {
            return;
        }

        if (user.status === 'activo') {
            // Aquí iría la llamada al backend para registrar la asistencia
            console.log(`Registrando asistencia (manual) para ${user.name} el ${selectedDate.toLocaleDateString()}`);
        } else {
        }
    };

    // Simulación de lógica de registro con QR

    const handleQrRegister = (result: IDetectedBarcode[]) => {
        if (!result || result.length === 0) {
            toast.error('No se detectó ningún código QR.');
            return;
        }
        // Suponiendo que el valor del QR está en result[0].rawValue
        const qrValue = result[0].rawValue;
        const user = users.find(u => u.qrCodeValue === qrValue);

        if (user) {
            if (user.status === 'activo') {
                toast.success(`Asistencia registrada con éxito (vía QR) para ${user.name}. ¡Bienvenido/a!`);
                // Aquí iría la lógica real de registro
            } else {
                toast.error(`El usuario ${user.name} está inactivo. No se puede registrar asistencia.`);
            }
        } else {
            toast.error('Usuario no encontrado para el código QR escaneado.');
        }
    };

    const { Canvas } = useQRCode();

    return (
        <Card className="w-full max-w-xl mx-auto my-10 shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold flex items-center justify-center">
                    <QrCodeIcon className="mr-3 h-8 w-8 text-primary" /> Registrar Asistencia
                </CardTitle>
                <CardDescription className="text-md">
                    Elige un método para registrar la asistencia del usuario.
                </CardDescription>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className="font-semibold text-muted-foreground">Qr de cliente:</span>
                    <span> <Canvas
                        text={users[2].qrCodeValue ?? ''} // Aqui tengo que verificar por el id que tengo y en base a eso poder buscar al usuario
                        options={{
                            errorCorrectionLevel: 'M',
                            margin: 2,
                            width: 100,
                            color: {
                                dark: '#000000',
                            },
                        }}
                    /></span>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="qr" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="qr" className="py-3 text-sm">
                            <QrCodeIcon className="mr-2 h-5 w-5" /> Con Código QR
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="py-3 text-sm">
                            <CalendarLucideIcon className="mr-2 h-5 w-5" /> Registro Manual
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="qr">
                        {/* Aqui va el scaneo con el codigo qr */}
                        <Scanner onScan={(result) => {
                            handleQrRegister(result);
                            console.log(result)
                        }} />
                    </TabsContent>

                    <TabsContent value="manual">
                        <div className="space-y-6 p-4 border rounded-md bg-slate-50 dark:bg-slate-800">
                            <div className="space-y-2">
                                <Label htmlFor="userSelect" className="text-base font-semibold">Seleccionar Usuario</Label>
                                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                    <SelectTrigger id="userSelect" className="w-full text-sm">
                                        <SelectValue placeholder="Elige un usuario..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id} className="text-sm">
                                                {user.name} <span className={user.status === 'activo' ? 'text-green-600' : 'text-red-600'}>({user.status})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateSelect" className="text-base font-semibold">Seleccionar Fecha de Asistencia</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="dateSelect"
                                            variant={"outline"}
                                            className={`w-full justify-start text-left font-normal text-sm ${!selectedDate && "text-muted-foreground"}`}
                                        >
                                            <CalendarLucideIcon className="mr-2 h-4 w-4" />
                                            {selectedDate ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : <span>Elige una fecha</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            initialFocus
                                            disabled={(date) => date > new Date() || date < new Date("2023-01-01")} // Ejemplo: deshabilitar fechas futuras y muy antiguas
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button onClick={handleManualRegister} className="w-full py-3 text-base">
                                Registrar Asistencia Manualmente
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}