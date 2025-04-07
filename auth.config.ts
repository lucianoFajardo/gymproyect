import type { NextAuthConfig } from 'next-auth'
import Credentials from "next-auth/providers/credentials"
import { LoginSchema } from './lib/zod'
import { db } from './lib/db';
import bcrypt from "bcryptjs";

export default {
    providers: [
        Credentials({
            authorize: async (credentials) => {
                const { data, success } = LoginSchema.safeParse(credentials);
                //VERIFICAR SI LOS DATOS SON VALIDOS o NO SI EXISTE UN ERROR
                if (!success) {
                    throw new Error("Credenciales invalidas de usuario")
                }
                //VERIFICAR SI EL USUARIO EXISTE EN LA BASE DE DATOS
                const user = await db.user.findFirst({
                    where: {
                        email: data.email,
                    },
                })
                if (!user) {
                    throw new Error("Usuario no encontrado")
                }
                //VERIFICAR SI EL USUARIO EXISTE O NO EN LA BASE DE DATOS
                if (!user || !user.password) {
                    throw new Error("Credenciales invalidas usuario o contraseña")
                }
                //VERIFICAR SI LA CONTRASEÑA ES VALIDA O NO
                const isValid = await bcrypt.compare(data.password, user.password);
                if (!isValid) {
                    throw new Error("contraseña invalida")
                }
                return user;
            }
        })
    ],
} satisfies NextAuthConfig