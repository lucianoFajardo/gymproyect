"use client";

//TODO :  Este es el modal para que podamos ver los datos de los pagos del servicio en especifico, aqui trabajamos con los GET que le pasamos en el componente service-manage
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter, // Opcional, si necesitas botones en el pie
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area"; // Para historiales largos
import { Button } from "@/components/ui/button"; // Si necesitas un botón de cierre
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PaymentServiceHistoryModel } from "@/Model/Paymet-Service-model";

export interface PaymentHistoryEntry {
    paymentId: string;
    paymentDate: Date;
    amountPaid: number;
    dueDateCovered: Date;
    notes?: string | null;
}

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
            <DialogContent className="sm:max-w-2xl"> {/* Ajusta el ancho según necesites */}
                <DialogHeader>
                    <DialogTitle>Historial de Pagos: {serviceName}</DialogTitle>
                    <DialogDescription>
                        Aquí se muestran todos los pagos registrados para este servicio.
                    </DialogDescription>
                </DialogHeader>

                {historyData.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        No hay historial de pagos para este servicio.
                    </div>
                ) : (
                    <ScrollArea className="h-[400px] w-full pr-4"> {/* Ajusta la altura */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha de Pago</TableHead>
                                    <TableHead className="text-right">Monto Pagado</TableHead>
                                    <TableHead>Vencimiento Cubierto</TableHead>
                                    <TableHead>Notas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyData.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{format(payment.paymentServiceDate, "PPP", { locale: es })}</TableCell>
                                        <TableCell className="text-right">${payment.paymentServiceAmount}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            Datos
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                )}
                <DialogFooter className="sm:justify-start mt-4">
                     {/* Podrías tener un botón de cierre si no quieres depender solo del clic fuera o la 'X' */}
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}