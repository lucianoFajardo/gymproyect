"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export function CreateWorkerForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        position: "",
        salary: "",
        startDate: "",
        contractType: "",
        skills: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Worker Data Submitted:", formData);
        // Aquí puedes añadir lógica para enviar los datos al backend
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-center">
            <div className="w-full max-w-2xl px-4">
                <h1 className="text-2xl font-bold mb-6 text-center">Registrar Trabajador</h1>
                <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nombre Completo
                        </label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ejemplo: Juan Pérez"
                            className="w-full"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary-dark">
                        Registrar Trabajador
                    </Button>
                </form>
            </div>
        </div>
    );
}