"use client"

import { LoginForm } from '@/components/promps/login-form'
import { HandCoins } from 'lucide-react'
//import LoginForm from '@/components/ui/login-form'
import React from 'react'

export default function LoginPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <HandCoins/>
                    </div>
                    Devilcorp
                </a>
                <LoginForm />
            </div>
        </div>
    )
}


//* aqui ocuparia el formulario de shadcn y zod para integrarlo
//* 