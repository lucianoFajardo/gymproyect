"use client";

import { UserModel } from "@/Model/User-model";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useEffect, } from "react";
import { z } from "zod";
import { UpdateClientSchema } from "@/lib/zod";
import { toast } from "sonner";
import { updateUserAction } from "@/actions/update-data-user-action";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

type FormValue = z.infer<typeof UpdateClientSchema>;

interface UpdateUserModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserModel; // Cambia 'any' por el tipo de usuario adecuado
    onChangeState: (value: UserModel) => void;
}

export function UpdateUserModal({
    isOpen,
    onOpenChange,
    user,
    onChangeState,
}: UpdateUserModalProps) {


    const form = useForm<FormValue>({
        resolver: zodResolver(UpdateClientSchema),
    })

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                phone: user.phone,
                lastname: user.lastname,
                age: Number(user.age), // Convertir a string para el input
                gmail: user.gmail,
            })
        }
    }, [user, form]);

    // Guardar cambios de edición
    const onSubmit = async (value: FormValue) => {
        try {
            if (!user || !user.id) {
                toast.error("Error", { description: "No hay datos de usuario para Modificar." });
                return;
            }
            const safeValue = {
                ...value,
                age: Number(value.age), // Asegurarse de que la edad sea un número
            }
            const updateUserDb = await updateUserAction(user.id, safeValue); //funcion de actualizar los datos

            if (updateUserDb.success) {
                toast.success("Datos actualizados correctamente",);
                //Para actualizar el estado del usuario en el componente padre
                onChangeState({
                    ...user,
                    ...safeValue,
                    age: String(safeValue.age),
                })
                onOpenChange(false);
            } else {
                if (updateUserDb.error) {
                    throw new Error("Error al actualizar el usuario: " + updateUserDb.error);
                }
                toast.error("Error al actualizar datos", {
                    description: "Por favor, corrige los datos y vuelve a intentarlo , el formulario presenta errores.",
                    duration: 5000,
                });
            }
        } catch (error) {
            throw new Error("Error encontrado : -> " + error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar datos de usuario: {user.name} {user.lastname}</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del Usuario. Haz clic en guardar cuando termines.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="lastname" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido</FormLabel>
                                <FormControl><Input placeholder="Apellido" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telefono</FormLabel>
                                <FormControl><Input placeholder="Telefono" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="age" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Edad</FormLabel>
                                <FormControl>
                                    <Input placeholder="Edad" min={1} type="number" step={1}{...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="gmail" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correo electronico</FormLabel>
                                <FormControl><Input placeholder="Correo electronico" type="email"{...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        name="name" // Añadir name para accesibilidad y potencial uso con FormData
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    // required // Puedes añadir validación nativa si lo deseas
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastname">Apellido</Label>
                                    <Input
                                        id="lastname"
                                        name="lastname"
                                        value={editForm.lastname}
                                        onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                                    // required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    // required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="age">Edad</Label>
                                    <Input
                                        id="age"
                                        name="age"
                                        type="number"
                                        value={editForm.age} // Mantener como string aquí si editForm.age es string
                                        onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} // Guardar como string
                                    // min="0" // Validación nativa para edad no negativa
                                    // required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gmail">Email</Label>
                                <Input
                                    id="gmail"
                                    name="gmail"
                                    type="email"
                                    value={editForm.gmail}
                                    onChange={(e) => setEditForm({ ...editForm, gmail: e.target.value })}
                                // required
                                />
                            </div>
                        </div> */}
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Guardar cambios</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}