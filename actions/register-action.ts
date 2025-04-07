"use server"

import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { z } from "zod";


export const registerAction = async (values: z.infer<typeof RegisterSchema>) => {

    const { data, success } = await RegisterSchema.safeParse(values);

    if (!success) {
        console.log("Error de validacion", data);
        return;
    }
    const user = await db.user.findUnique({
        where: {
            email: data.email,
        },
    })
    if (user) {
        console.log("El usuario ya existe", user);
        return;
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

    console.log("Usuario creado", newUser);

    return newUser;

};