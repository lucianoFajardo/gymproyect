"use client";

//TODO :  Este es el modal para que podamos ver los datos de los pagos del servicio en especifico, aqui trabajamos con los GET que le pasamos en el componente service-manage
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button"; 
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PaymentServiceHistoryModel } from "@/Model/Paymet-Service-model";

interface ServicePaymentHistoryModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    serviceName: string;
    historyData: PaymentServiceHistoryModel[];
}

export function ServicePaymentHistoryModal({
    isOpen,
    onOpenChange,
    serviceName,
    historyData,
}: ServicePaymentHistoryModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Historial de Pagos: {serviceName}</DialogTitle>
                    <DialogDescription>
                        Aquí se muestra el historial de pagos realizados para el servicio {serviceName}.
                    </DialogDescription>
                </DialogHeader>
                {historyData.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        No hay historial de pagos para este servicio.
                    </div>
                ) : (
                    <ScrollArea className="h-[400px] w-full pr-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID de pago</TableHead>
                                    <TableHead>Fecha de Pago</TableHead>
                                    <TableHead className="text-right">Monto Pagado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyData.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full  bg-gray-100 text-gray-800">
                                                {payment.id}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full  bg-blue-100 text-blue-800">
                                                {format(payment.paymentServiceDate, "PPP", { locale: es })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full  bg-purple-100 text-purple-800">
                                                ${payment.paymentServiceAmount}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                )}
                <DialogFooter className="sm:justify-start mt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}