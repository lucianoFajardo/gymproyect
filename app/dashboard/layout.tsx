"use client"
import "@/app/globals.css";

import { AppSidebar } from "@/components/ui/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { FullPageLoader } from "@/components/ui/spinner";
import { Wave } from "@/components/ui/wave";
import { Separator } from "@radix-ui/react-separator";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";

export default function DashboardPage({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex flex-col min-h-screen bg-background">
                        <div className="flex items-center p-2">
                            <SidebarTrigger />
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Toaster richColors theme="light" />
                        </div>
                        <Suspense fallback={<FullPageLoader />}>
                            <main className="flex-grow p-4 bg-card">
                                <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                                    {children}
                                </ThemeProvider>
                            </main>
                        </Suspense>
                        <Wave />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </SessionProvider>

    );
}