"use client"

import "@/app/globals.css"
import React from "react"
import { LoginForm } from "@/components/promps/login-form"
import { HandCoins } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-green-50">
            <div className="flex w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
                {/* seccion de la izquierda */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-green-700 text-white p-8">
                    <h1 className="text-4xl font-bold mb-4">Bienvenido!</h1>
                    <p className="text-lg text-center mb-6">
                        Asegura tu cuenta y disfruta de servicios personalizados para la gestión y monitoreo de tu GYM.
                    </p>
                    <div className="flex items-center justify-center">
                        {/* SVG ilustrativo */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            className="w-3/4 h-auto"
                            fill="white"
                        >
                            <path d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zm0 416c-105.9 0-192-86.1-192-192S150.1 64 256 64s192 86.1 192 192-86.1 192-192 192zm-64-224h128c8.8 0 16-7.2 16-16s-7.2-16-16-16H192c-8.8 0-16 7.2-16 16s7.2 16 16 16zm0 96h128c8.8 0 16-7.2 16-16s-7.2-16-16-16H192c-8.8 0-16 7.2-16 16s7.2 16 16 16z" />
                        </svg>
                    </div>
                </div>

                {/* seccion de la derecha */}
                <div className="flex flex-1 flex-col items-center justify-center bg-white p-8">
                    <a href="/" className="flex items-center gap-2 self-center font-medium mb-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500 text-white">
                            <HandCoins />
                        </div>
                        <span className="text-xl font-bold text-green-700">GymProyect</span>
                    </a>
                    <LoginForm />
                    <p className="text-center text-sm text-green-700 mt-4">
                        ¿No tienes una cuenta?{" "}
                        <a href="/register" className="text-green-600 underline">
                            Regístrate
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

//* aqui ocuparia el formulario de shadcn y zod para integrarlo
//*