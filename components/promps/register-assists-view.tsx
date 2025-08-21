"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
import { Scanner } from '@yudiel/react-qr-scanner';
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { CalendarIcon as CalendarLucideIcon, QrCodeIcon } from 'lucide-react';
import { toast } from 'sonner';
import { registerAssistsQrAction } from '@/actions/register-assists-action';

export default function RegisterAssistsView() {
    //* logica de registro manual
    // const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
    // const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleManualRegister = () => {
        // if (!selectedUserId || !selectedDate) {
        //     return;
        // }
        // const user = users.find(u => u.id === selectedUserId);
        // if (!user) {
        //     return;
        // }
        // if (user.status === 'activo') {
        //     // Aquí iría la llamada al backend para registrar la asistencia
        //     console.log(`Registrando asistencia (manual) para ${user.name} el ${selectedDate.toLocaleDateString()}`);
        // } else {
        //     toast.error(`El usuario ${user.name} no está activo. No se puede registrar asistencia.`);
        // }
    };

    //* logica de registro con QR
    const handleQrRegister = async (result: IDetectedBarcode[]) => {
        if (!result || result.length === 0) {
            toast.error('No se detectó ningún código QR.');
            return;
        }
        //* guardar el valor que registra el qr
        const qrValueId = result[0].rawValue;
        //* Fecha actual para el registro de asistencia
        const dataNow = new Date();
        try {
            const response = await registerAssistsQrAction(qrValueId, dataNow);
            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error("Error al registrar la asistencia , " + response.message);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
            toast.error("Error al registrar la asistencia. Por favor, inténtalo de nuevo.");
        }
    };

    return (
        <Card className="w-full max-w-xl mx-auto shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold flex items-center justify-center">
                    <QrCodeIcon className="mr-3 h-8 w-8 text-primary" /> Registrar Asistencia
                </CardTitle>
                <CardDescription className="text-md">
                    Elige un método para registrar la asistencia del usuario.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="qr" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="qr" className="py-3 text-sm">
                            <QrCodeIcon className="mr-2 h-5 w-5" /> Con Código QR
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="py-3 text-sm">
                            <CalendarLucideIcon className="mr-2 h-5 w-5" /> Registro Manual
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="qr">
                        <Scanner onScan={(result) =>  handleQrRegister(result) } />
                    </TabsContent>
                    <TabsContent value='manual'>
                        <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-700 text-lg font-semibold rounded-lg shadow-inner p-4">
                            <p>🚀 ¡Próximamente!</p>
                        </div>
                    </TabsContent>
                    {/* PARA REGISTRAR MANUALMENTE LA ASISTENCIA DEL USUARIO */}
                    {/* <TabsContent value="manual">
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
                    </TabsContent> */}
                </Tabs>
            </CardContent>
        </Card>
    );
}