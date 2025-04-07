"use client"

import { Toaster } from "sonner";

export function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}
                <Toaster />
            </body>
        </html>
    );
} import { AppSidebar } from "@/components/ui/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@radix-ui/react-separator";
import { SessionProvider } from "next-auth/react";


export default function DashboardPage({ children }: { children: React.ReactNode }) {

    return (
        <SessionProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </SessionProvider>
    )
}

