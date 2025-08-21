"use server";

import { db } from "@/lib/db";

export async function getActiveUsersDash() {
    // Obtener el numero total de usuarios en el gym totales
    try {
        const userActive = await db.createClientModel.count();
        const userActiveToday = await db.createClientModel.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)) // Filtrar por usuarios creados desde el inicio del día
                }
            }
        })
        if (!userActive && !userActiveToday) {
            throw new Error("No se encontraron usuarios activos en el dashboard");
        };
        return { userActive, userActiveToday };
    } catch (error) {
        throw new Error("Error al obtener los usuarios activos del dashboard", error as Error);
    }
}

export async function getTotaAmountsDash() {
    try {
        // pago de las subscripciones 
        const totalPaymentsSubs = await db.paymentSubscription.findMany({
            where: {
                createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth(), 1)),
                    lt: new Date(new Date().setMonth(new Date().getMonth() + 1, 1))
                }
            },
            select: {
                amountPaid: true
            }
        });
        const salesTotal = await db.productSale.findMany({
            where: {
                createAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth(), 1)),
                    lt: new Date(new Date().setMonth(new Date().getMonth() + 1, 1))
                }
            },
            select: {
                totalPay: true
            }
        });
        if (!totalPaymentsSubs.length && !salesTotal.length) {
            throw new Error("No se encontraron montos totales en el dashboard");
        }
        const totalPaymentAmount = totalPaymentsSubs.reduce((acc, payment) => acc + payment.amountPaid, 0);
        const totalSalesAmount = salesTotal.reduce((acc, sale) => acc + sale.totalPay, 0);
        const totalIncome = totalPaymentAmount + totalSalesAmount;
        return totalIncome;
    } catch (error) {
        throw new Error("Error al obtener los montos totales del dashboard", error as Error);
    }
}

export async function getSubsExpireDash() {
    try {
        const currentDate = new Date();
        const data = await db.createClientModel.findMany({
            select: {
                startPlan: true,
                subscriptionPlan: {
                    select: {
                        durationDaysPlan: true
                    }
                }
            }
        });
        const getSubs = data.filter(subs => {
            const startDate = new Date(subs.startPlan);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + (subs.subscriptionPlan?.durationDaysPlan || 0));
            return endDate < currentDate;
        });
        if (!getSubs.length) {
            throw new Error("No se encontraron subscripciones por vencer en el dashboard");
        };
        const returnDataLength = getSubs.length;
        return returnDataLength;
    } catch (error) {
        throw new Error("Error al obtener las subscripciones por vencer del dashboard", error as Error);
    }
}

export async function getAssistTodayDash() {
    try {
        const currentDate = new Date();
        const data = await db.assists.findMany({
            where: {
                createdAt: {
                    gte: new Date(currentDate.setHours(0, 0, 0, 0)),
                    lt: new Date(currentDate.setHours(23, 59, 59, 999))
                }
            },
        });
        if (!data.length && data.length === 0) {
            return 0;
        }
        const assistTodayCount = data.length;
        return assistTodayCount;

    } catch (error) {
        throw new Error("Error al obtener la asistencia de hoy del dashboard", error as Error);
    }
}

export async function getexpensesDash() {
    try {
        const data = await db.servicePayment.findMany({
            where: {
                createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth(), 1)),
                    lt: new Date(new Date().setMonth(new Date().getMonth() + 1, 1))
                }
            },
            select: {
                amountPaid: true
            }
        });
        if (!data.length) {
            throw new Error("No se encontraron gastos en el dashboard");
        };
        const totalExpenses = data.reduce((acc, payment) => acc + payment.amountPaid, 0);
        return totalExpenses;

    } catch (error) {
        throw new Error("Error al obtener los gastos del dashboard", error as Error);
    }
}

export async function getTotalIncomeDash() {
    try {
        const totalIncome = await getTotaAmountsDash();
        const totalExpenses = await getexpensesDash();
        const totalIncomeNet = totalIncome - totalExpenses;
        if (totalIncomeNet < 0) {
            throw new Error("El ingreso neto es negativo, verifique los datos");
        }
        return totalIncomeNet;
    } catch (error) {
        throw new Error("Error al obtener el ingreso total del dashboard", error as Error);
    }
}

export async function getTableDataDash() {
    try {
        const [recentEntry, recentUsers, recentSales] = await Promise.all([

            db.assists.findMany({
                orderBy: { createdAt: 'asc' },
                select: {
                    client: {
                        select: {
                            name: true,
                            subscriptionPlan: {
                                select: {
                                    price: true
                                }
                            },
                            gmail: true
                        }
                    }
                },
                take: 5
            }),

            db.createClientModel.findMany({
                orderBy: { createdAt: 'desc' },
                select: {
                    name: true,
                    gmail: true,
                    subscriptionPlan: {
                        select: {
                            price: true
                        }
                    }
                },
                take: 5
            }),

            db.productSale.findMany({
                orderBy: { createAt: 'desc' },
                select: {
                    product: {
                        select: {
                            nameProduct: true,
                            id: true,
                            priceProduct: true
                        }
                    }
                },
                take: 5
            })
        ]);
        if (!recentEntry.length && !recentUsers.length && !recentSales.length) {
            throw new Error("No se encontraron datos para la tabla del dashboard");
        }
        return { recentEntry, recentUsers, recentSales };
    } catch (error) {
        throw new Error("Error al obtener los datos de la tabla del dashboard", error as Error);
    }
}