"use client";

import { SubscriptionHistoryPaymentModel } from "@/Model/Payment-subscription-model";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface HistoriModalPaymentSubs {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data: SubscriptionHistoryPaymentModel[];
}

export function HistoryModalPaymentSubs({
    isOpen,
    onOpenChange,
    data,
}: HistoriModalPaymentSubs) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                {data.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        No hay historial de pagos para este usuario.
                    </div>
                ) : (
                    <><DialogHeader>
                        <DialogTitle>Historial de Pagos del usuario: {data[0].userName}</DialogTitle>
                        <DialogDescription>
                            Aquí se muestra el historial de pagos realizados por el usuario
                        </DialogDescription>
                    </DialogHeader><ScrollArea className="h-[400px] w-full pr-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID de pago</TableHead>
                                        <TableHead>Fecha de Pago</TableHead>
                                        <TableHead className="text-right">Monto Pagado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((payment: SubscriptionHistoryPaymentModel) => (
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
                        </ScrollArea></>
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

// TODO: Implementar la lógica para mostrar el historial de pagos en el modal. para poder ver los pagos realizado por el usuario