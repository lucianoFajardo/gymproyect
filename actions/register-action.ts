"use server"

import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { z } from "zod";


export const registerAction = async (values: z.infer<typeof RegisterSchema>) => {

    const { data, success } = await RegisterSchema.safeParse(values);

    if (!success) {
        throw new Error("Error de validacion");
    }
    const user = await db.user.findUnique({
        where: {
            email: data.email,
        },
    })
    if (user) {
        throw new Error("El usuario ya existe");
    }

    //HASHEAR LA CONTRASEÑA
    const hashedPassword = await bcrypt.hash(data.password, 10);

    //CREAR EL USUARIO EN LA BASE DE DATOS
    const newUser = await db.user.create({
        data: {
            email: data.email,
            name: data.name,
            password: hashedPassword,
        },
    });
    return newUser;
};