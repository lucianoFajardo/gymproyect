"use client";

import { UserModel } from "@/Model/User-model";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useQRCode } from "next-qrcode";

interface ViewUserModal {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onClose: () => void;
    data: UserModel;
    expireSubscription: string;
}

export function ViewUserModal({
    isOpen,
    onClose,
    data,
    onOpenChange,
    expireSubscription
}: ViewUserModal) {
    const { Canvas } = useQRCode();

    function formatPhoneForWhatsapp(phone: string) {
        const clean = phone.replace(/\D/g, "");
        if (clean.startsWith("569") && clean.length === 11) return clean;
        if (clean.startsWith("9") && clean.length === 9) return "56" + clean;
        if (clean.length === 8) return "569" + clean;
        if (clean.startsWith("56") && clean.length === 11) return clean;
        return clean;
    }

    const handleShareWhatsApp = () => {
        const message = encodeURIComponent(
            `¡Hola ${data.name}! Aquí tienes tu código QR para ingresar al gimnasio. Bienvenido a nuestra comunidad.`
        );
        window.open(`https://wa.me/${formatPhoneForWhatsapp(data.phone)}/?text=${message}`, "_blank");

    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader key={data.id}>
                    <DialogTitle>Detalles del usuario: {data.name}</DialogTitle>
                    <DialogDescription>
                        Aquí puedes ver los detalles completos del usuario selecionado.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4 max-h-[70vh] overflow-y-auto text-sm pr-2">
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">ID del usuario:</span>
                        <span>{data.id}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">Nombre del usuario:</span>
                        <span className="font-medium">{data.name}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">Telefono:</span>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {data.phone}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">Edad:</span>
                        <span>{data.age}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">Correo electronico:</span>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {data.gmail}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">Usuario Creado:</span>
                        <span>{new Date(data.createdAt).toLocaleDateString()}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">Plan:</span>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {data.subscriptionPlan?.name}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">Inicio Plan:</span>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {new Date(data.startPlan).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">Vencimiento Plan:</span>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {expireSubscription}</span>
                    </div>
                    <hr className="my-1" />
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">Estado Plan:</span>
                        <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${data.statusPlan ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                            {data.statusPlan ? "Activo" : "Inactivo"}
                        </span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">Precio Plan:</span>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            ${Number(data.price).toLocaleString()}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-muted-foreground">QR usuario:</span>
                        <span>
                            <Canvas
                                text={data.id}
                                options={{
                                    errorCorrectionLevel: 'M',
                                    margin: 1,
                                    width: 100,
                                    color: { dark: '#000000' },
                                }}
                            />
                        </span>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={() => {
                            const canvas = document.querySelector("canvas");
                            if (canvas) {
                                const link = document.createElement("a");
                                link.download = `${data.name}-qr.png`;
                                link.href = canvas.toDataURL("image/png");
                                link.click();
                            }
                        }}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Descargar QR
                    </Button>
                    <Button onClick={handleShareWhatsApp} className="ml-2 bg-emerald-600 text-white hover:bg-green-600">
                        Compartir por WhatsApp
                    </Button>
                    <Button onClick={onClose} className="ml-2">
                        Cerrar
                    </Button>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )


}