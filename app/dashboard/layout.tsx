"use client"

import { AppSidebar } from "@/components/ui/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { FullPageLoader } from "@/components/ui/spinner";
import { Separator } from "@radix-ui/react-separator";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { Toaster } from "sonner";

export default function DashboardPage({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SidebarProvider>
                <AppSidebar />  {/* Aqui estan las rutas de mi pagina */}
                <SidebarInset>
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Toaster richColors theme="light" />
                    <Suspense fallback={<FullPageLoader/>}>  {/* Aqui se carga el spinner */}
                        {children}
                    </Suspense>
                </SidebarInset>
            </SidebarProvider>
        </SessionProvider>
    )
}

