"use server"

import { db } from "@/lib/db";

export const deleteDataUserAction = async (userId: string) => {

    //TODO: Tener en cuenta la relacion que tenga con las otras tablas ya que sino tengo que eliminar todo registro de todas las tablas.
    try {
        const respondeDataDelete = await db.createClientModel.delete({
            where: {
                id: userId
            }
        });
        //! Si la respuesta no tiene ningu tipo de data, arrojar un error
        if (!respondeDataDelete) {
            return {
                success: false,
                error: respondeDataDelete,
                message: "Error al elimiar el usuario"
            }
        }
        //* Si la respuesta es correcta, retornar mensaje de exito y eliminar el usuario
        return {
            success: true,
            message: "Usuario eliminado correctamente",
        }
    } catch (error) {
        console.log("Error encontrado al elimiar usuario : -> " + error)
        return {
            // Si aqui el servidor no responde o hay un error me retornar un error
            success: false,
            error: error,
            message: "Error interno del servidor al actualizar los datos.",
        }
    }
}