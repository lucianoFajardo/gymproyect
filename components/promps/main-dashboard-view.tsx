"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { getActiveUsersDash, getAssistTodayDash, getexpensesDash, getSubsExpireDash, getTableDataDash, getTotaAmountsDash, getTotalIncomeDash } from "@/actions/dashboard-actions";
import { TrendingDown, TrendingUp, Users, CalendarX, Footprints, Wallet, AppWindow } from "lucide-react";
import { CardInfoModal } from "./card-info-data-modal";

export default function MainDashboardView() {
    const ranOnceRef = useRef(false);
    useEffect(() => {
        if (ranOnceRef.current) return; // evita doble llamada en StrictMode (dev)
        ranOnceRef.current = true;
        let cancelled = false;
        const fetchData = async () => {
            try {
                const results = await Promise.allSettled([
                    getActiveUsersDash(),
                    getTotaAmountsDash(),
                    getSubsExpireDash(),
                    getAssistTodayDash(),
                    getexpensesDash(),
                    getTotalIncomeDash(),
                    getTableDataDash()
                ]);
                if (cancelled) return;
                const [
                    usersRes,
                    amountsRes,
                    subsRes,
                    assistRes,
                    expensesRes,
                    totalIncomeRes,
                    tableDataRes
                ] = results;
                if (usersRes.status === "fulfilled") setActiveUsers(usersRes.value);
                if (amountsRes.status === "fulfilled") setTotalAmounts(amountsRes.value);
                if (subsRes.status === "fulfilled") setSubsExpire(subsRes.value);
                if (assistRes.status === "fulfilled") setAssistToday(assistRes.value);
                if (expensesRes.status === "fulfilled") setExpenses(expensesRes.value);
                if (totalIncomeRes.status === "fulfilled") setTotalIncome(totalIncomeRes.value);
                if (tableDataRes.status === "fulfilled") setRecentSales(tableDataRes.value.recentSales);
                if (tableDataRes.status === "fulfilled") setRecentIncomes(
                    tableDataRes.value.recentUsers.map((user: { name: string; gmail: string; subscriptionPlan: { price: number } | null }) => ({
                        userIncome: {
                            name: user.name,
                            gmail: user.gmail,
                            price: user.subscriptionPlan?.price ?? 0
                        }
                    }))
                );
                if (tableDataRes.status === "fulfilled") setRecentAssists(tableDataRes.value.recentEntry)
            } catch (error) {
                throw new Error("Error fetching dashboard data: " + error);
            }
        };
        fetchData();
        setTimeout(() => setLoading(false), 3000);
        return () => {
            cancelled = true;
        };
    }, []);

    const [activeUsers, setActiveUsers] = useState<{ userActive: number; userActiveToday: number } | null>(null);
    const [totalAmounts, setTotalAmounts] = useState<number | null>(null);
    const [subsExpire, setSubsExpire] = useState<number | null>(null);
    const [assistToday, setAssistToday] = useState<number | null>(null);
    const [expenses, setExpenses] = useState<number | null>(null);
    const [totalIncome, setTotalIncome] = useState<number | null>(null);
    const [recentSales, setRecentSales] = useState<{ product: { nameProduct: string; priceProduct: number; id: string | null } }[]>([]);
    const [recentIncomes, setRecentIncomes] = useState<{ userIncome: { name: string; gmail: string; price: number | 0 } }[]>([]);
    const [recentAssists, setRecentAssists] = useState<{ client: { name: string; subscriptionPlan: { price: number } | null; gmail: string } }[]>([]);
    const [loading, setLoading] = useState(true);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <AppWindow className="h-12 w-12 animate-pulse text-primary" />
                <p className="ml-4 text-lg">Cargando categorias...</p>
            </div>
        )
    };

    return (
        <div className="p-4 md:p-8 min-h-screen border rounded-2xl bg-background">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-accent-foreground">Panel Principal</h1>
                <p className="text-accent-foreground mt-1">Hola Administrador, un gusto volverte a ver. Aquí tienes un resumen de tu gimnasio.</p>
            </div>
            {/* Sección de Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {/* Card Usuarios Activos */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-accent-foreground">Usuarios Activos</CardTitle>
                        <Users className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-accent-foreground">{activeUsers?.userActive || 0}</div>
                        <p className="text-xs text-blue-700 font-semibold">+{activeUsers?.userActiveToday || 0} nuevos hoy</p>
                    </CardContent>
                </Card>
                {/* Card Total del mes */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-accent-foreground">Total del Mes</CardTitle>
                        <Wallet className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-800">${totalIncome?.toLocaleString() || 0}</div>
                        <p className="text-xs text-accent-foreground">Total de ingresos este mes, despues de descuentos </p>
                    </CardContent>
                </Card>

                {/* Card Ingresos */}
                <Card className="bg-green-50 border-green-200 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Ingresos (Mes)</CardTitle>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-700">${totalAmounts?.toLocaleString() || 0}</div>
                        <p className="text-xs text-green-600">Usuarios por regularizar.</p>
                    </CardContent>
                </Card>

                {/* Card Gastos */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-accent-foreground">Gastos (Mes)</CardTitle>
                        <TrendingDown className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-red-600">$-{expenses?.toLocaleString() || 0}</div>
                        <p className="text-xs text-accent-foreground">Total de gastos este mes.</p>
                    </CardContent>
                </Card>

                {/* Card Suscripciones Vencidas */}
                <Card className="bg-red-50 border-red-200 hover:shadow-lg transition-shadow duration-300 ">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-700">Suscripciones Vencidas</CardTitle>
                        <CalendarX className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-red-700">{subsExpire || 0}</div>
                        <p className="text-xs text-red-600">Usuarios por regularizar.</p>
                    </CardContent>
                </Card>

                {/* Card Asistencia Hoy */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-accent-foreground">Asistencia Hoy</CardTitle>
                        <Footprints className="h-5 w-5 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-indigo-600">{assistToday || 0}</div>
                        <p className="text-xs text-gray-500">Usuarios presentes hoy.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CardInfoModal
                    TitleCard="Ingresos Recientes"
                    SubTitleCard="Últimos ingresos registrados."
                    TableHeaderTitle="Usuario"
                    SubTableHeader="Monto"
                    props={"dashboard/assists/manage-assists"}
                    TableData={recentAssists.map(assist => ({
                        NameCard: assist.client.name,
                        SubTitleCard: assist.client.gmail,
                        PriceCard: assist.client.subscriptionPlan?.price || 0
                    }))}
                />

                <CardInfoModal
                    TitleCard="Usuarios Creados Recientemente"
                    SubTitleCard="Últimos 5 usuarios registrados."
                    TableHeaderTitle="Nombre"
                    SubTableHeader="Precio del plan"
                    props={"dashboard/members/view-users"}
                    TableData={recentIncomes.map(user => ({
                        NameCard: user.userIncome.name,
                        SubTitleCard: user.userIncome.gmail,
                        PriceCard: user.userIncome.price || 0
                    }))}
                />

                <CardInfoModal
                    TitleCard="Ventas recientes"
                    SubTitleCard="Últimas 5 ventas registradas."
                    TableHeaderTitle="Nombre"
                    SubTableHeader="Precio de venta"
                    props={"dashboard/sales/manage-sales"}
                    TableData={recentSales.map(products => ({
                        NameCard: products.product.nameProduct,
                        SubTitleCard: products.product.id || "N/A",
                        PriceCard: products.product.priceProduct || 0,
                    }))}
                />
            </div>
        </div>
    );
}