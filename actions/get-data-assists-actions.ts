"use server";
import { db } from "@/lib/db";
import { AssistanceRecord } from "@/Model/Register-Assists-model";

export async function getAllDataAssistsActions(
    {
        page = 1,
        pageSize = 10,
        fromDate,
        toDate,
    }: { page?: number; pageSize?: number; fromDate?: Date; toDate?: Date }
) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (fromDate && toDate) {
            where.createdAt = {
                gte: new Date(fromDate.setHours(0, 0, 0, 0)),
                lte: new Date(toDate.setHours(23, 59, 59, 999)),
            };
        } else if (fromDate) {
            where.createdAt = {
                gte: new Date(fromDate.setHours(0, 0, 0, 0)),
            };
        } else if (toDate) {
            where.createdAt = {
                lte: new Date(toDate.setHours(23, 59, 59, 999)),
            };
        }
        const [assistsDb, totalCount] = await Promise.all([
            db.assists.findMany({
                where,
                select: {
                    id: true,
                    admissionDate: true,
                    exitDate: true,
                    client: {
                        select: {
                            name: true,
                            gmail: true,
                        }
                    }
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { admissionDate: "desc" }
            }),
            db.assists.count({ where }),
        ])
        //? Parseo la informacion de la base de datos en mi modelo de asistencias y lo puedo enviar
        const parsedAssists: AssistanceRecord[] = assistsDb.map(assist => {
            return {
                id: String(assist.id),
                userName: String(assist.client.name || ""),
                gmailUser: String(assist.client.gmail || ""),
                admissionDate: new Date(assist.admissionDate),
                exitDate: new Date(assist.exitDate),
            }
        });
        return {
            assists: parsedAssists,
            totalCount, //? Total de registros encontrados
        }
    } catch (_) {
        throw new Error("No se pudieron obtener los registros de asistencia."+ _);
    }
}