"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"

export default function EditAccount() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const { data: session } = useSession();

    useEffect(() => {
        const data = session?.user || {};
        console.log(data)
    }, [session])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.")
            return
        }
        setError("")
        console.log("Cuenta actualizada", { name, email, password })
    }

    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardHeader>
                <CardTitle className="text-xl text-center">Editar Información</CardTitle>
                <CardDescription className="text-center text-sm text-muted-foreground">
                    Actualiza tu información personal y de cuenta.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6 p-2">
                    <div>
                        <Label htmlFor="name" className="text-sm">Nombre</Label>
                        <Input
                            id="name"
                            value={session?.user?.name || name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email" className="text-sm">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            value={session?.user?.email || email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tucorreo@example.com"
                        />
                    </div>
                    <div>
                        <Label htmlFor="password" className="text-sm">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            value={session?.user?.id || password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nueva contraseña"
                        />
                    </div>
                    <div>
                        <Label htmlFor="confirmPassword" className="text-sm">Confirmar Contraseña</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <Button type="submit" className="w-full">Guardar</Button>
                </form>
            </CardContent>
        </Card>
    )
}
