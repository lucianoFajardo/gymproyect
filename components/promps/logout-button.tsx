'use client';

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { toast } from "sonner";

export default function LogoutButton() {
    const handlerClick = async () => {
        try {
            await signOut({
                callbackUrl: "/login", //* Redirige al inicio de sesion
            });
            toast.success("Cierre de sesión exitoso");
            setTimeout(() => {
                window.location.href = "/login";
            }, 5000); //* Redirige al inicio de sesion pero con una demora de 3ms 
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return <Button onClick={handlerClick}>Cerrar sesión</Button>;
}