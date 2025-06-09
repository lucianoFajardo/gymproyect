"use server";
import { db } from "@/lib/db";
import { AssistanceRecord } from "@/Model/Register-Assists-model";

export async function getAllDataAssistsActions(): Promise<AssistanceRecord[]> {
    try {
        const assistsDb = await db.assists.findMany({
            select: {
                id: true,
                date: true,
                client: {
                    select: {
                        name: true,
                        gmail: true,
                    }
                }
            }
        });
        //? Parseo la informacion de la base de datos en mi modelo de asistencias y lo puedo enviar
        const parsedAssists: AssistanceRecord[] = assistsDb.map(assist => {
            return {
                id: String(assist.id),
                userName: String(assist.client.name || ""),
                gmailUser: String(assist.client.gmail || ""),
                date: new Date(assist.date)
            }
        });

        if(parsedAssists.length === 0){
            console.error("No se encontraron registros de asistencia.");
            return []; //* como no tengo datos no puedo retornar nada, retorno un array vacio
        }

        return parsedAssists;

    } catch (error) {
        console.error("Error al obtener los registros de asistencia:", error);
        throw new Error("No se pudieron obtener los registros de asistencia.");
    }
}