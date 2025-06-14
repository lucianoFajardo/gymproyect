"use client"

import { useEffect, useMemo, useState } from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Edit, EyeIcon, Mail, Phone, Trash2, UserSearch } from "lucide-react"
import { getDataUserAction } from "@/actions/get-data-user-action"
import { UserModel } from "../../Model/User-model"
import checkSubscriptionExpiration from "@/actions/expiration-subscription-action"
import { useQRCode } from 'next-qrcode';
import { toast } from "sonner"
import { updateUserAction } from "@/actions/update-data-user-action"
import { UpdateClientSchema } from "@/lib/zod"
import { z } from "zod"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog" // Asegúrate que la ruta sea correcta
import { deleteDataUserAction } from "@/actions/delete-data-user-action"
import { Badge } from "./badge"
import { Card, CardDescription, CardHeader, CardTitle } from "./card"

//TODO : Seguir aqui despues tengo que pulir unas cuantas cosas mas y estariamos listos , recordar que downgraidie el reactDom y react 
export default function UserTable() {

    const ITEMS_PER_PAGE = 15; // Define cuántos usuarios mostrar por página
    const [isLoading, setIsLoading] = useState(true);

    const [users, setUsers] = useState<UserModel[]>([])
    const [expireSubscription, setExpireSubscription] = useState<Record<string, string>>({});
    const [userStatusMap, setUserStatusMap] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState<number>(1); //* Estado para la página actual

    //* Obtener los datos de los usuarios al cargar el componente
    useEffect(() => {
        setIsLoading(true); // Iniciar el estado de carga
        getDataUserAction().then((data) => {
            if (!data || data.length === 0) {
                toast.error("Error", { description: "No se encontraron usuarios en la base de datos." });
                setUsers([])
                return;
            }
            setUsers(data)
            setCurrentPage(1); // Reiniciar a la primera página al cargar los datos
            setIsLoading(false); // Finalizar el estado de carga
        });
    }, []);
    const { Canvas } = useQRCode();
    // Estado para el diálogo de eliminación
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);


    const [selectedRows, setSelectedRows] = useState<string[]>([])
    // Estados para edición
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState<UserModel | null>(null)
    // Nuevos estados para el diálogo de "ver detalles"
    const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState<UserModel | null>(null);

    // Actualizar el estado inicial del formulario de edición
    const [editForm, setEditForm] = useState<Omit<UserModel, "id" | "statusPlan" | "startPlan" | "subscriptionPlan" | "createdAt" | "price">>({
        name: "",
        phone: "",
        lastname: "",
        age: "",
        gmail: "",
    })

    // fn para manejar la vista de detalles del usuario
    const handleViewDetails = (user: UserModel) => {
        setViewingUser(user);
        setIsViewDetailsDialogOpen(true);
    };

    //* Lógica de paginación
    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return users.slice(startIndex, endIndex);
    }, [users, currentPage]);

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    // Estado para manejar la fecha de inicio del plan y su vencimiento
    useEffect(() => {
        if (users.length > 0) {
            // Procesar todas las fechas de inicio de los planes
            Promise.all(
                users.map(async (user) => {
                    const endPlanDay = user.subscriptionPlan?.durationDaysPlan || 0;  //obtengo la duracion del plan y sino me retorna 0
                    console.log("Duracion del plan: ", endPlanDay);
                    const result = await checkSubscriptionExpiration(user.id, user.startPlan, endPlanDay); // aqui guardo el result de la fn
                    return { id: user.id, expireDate: result.expireDate, status: result.status }; // Retornar el ID y la fecha de expiración
                })
            ).then((results) => {
                // Crear el objeto con las fechas de expiración por ID de usuario que tengo registrado
                const expirationMap = results.reduce((acc, { id, expireDate }) => {
                    acc[id] = expireDate;
                    return acc;
                }, {} as Record<string, string>); // Typar los datos con la [Key - value] = Type 
                setExpireSubscription(expirationMap);

                // Crear el objeto con los estados de vencimiento de plan de usuario que tengo registrado
                const statusMap = results.reduce((acc, { id, status }) => {
                    acc[id] = status;
                    return acc;
                }, {} as Record<string, string>); // Typar los datos con la [Key - value] = Type 
                setUserStatusMap(statusMap);

            }).catch(error => {
                console.error("Error calculating subscription expirations:", error);
                // Opcionalmente, manejar el error en la UI
            });
        }
    }, [users]); // Este useEffect se ejecuta cada vez que el estado 'users' cambia

    // Actualizar la función handleEdit para incluir todos los campos
    const handleEdit = (user: UserModel) => {
        setCurrentUser(user)
        setEditForm({
            name: user.name,
            phone: user.phone,
            lastname: user.lastname,
            age: user.age.toString(),
            gmail: user.gmail,
        })
        setIsEditDialogOpen(true)
    }

    // Guardar cambios de edición
    const handleSaveEdit = async (editForm: z.infer<typeof UpdateClientSchema>) => {
        if (!currentUser || !editForm) {
            toast.error("Error", { description: "No hay datos de usuario para Modificar." });
            return;
        }
        try {
            const updateUserDb = await updateUserAction(currentUser.id, editForm); //funcion de actualizar los datos
            if (updateUserDb.success) {
                const updatedUsers = users.map((user) =>
                    user.id === currentUser.id ? { ...user, ...updateUserDb } : user
                );
                setUsers(updatedUsers);
                setIsEditDialogOpen(false);
                setCurrentUser(null);
                toast.success("Usuario actualizado", {
                    description: "Datos de usuarios actualizados con exito",
                    duration: 5000,
                })
                getDataUserAction().then((data) => setUsers(data));
            } else {
                if (updateUserDb.error) {
                    console.log("Error de validación:", updateUserDb.error);
                }
                toast.error("Error al actualizar datos", {
                    description: "Por favor, corrige los datos y vuelve a intentarlo , el formulario presenta errores.",
                    duration: 5000,
                });
                // NO cerrar el diálogo aquí, para que el usuario vea los errores
            }
        } catch (error) {
            throw new Error("Error encontrado : -> " + error)
        } finally {
            // 4. Cerrar el diálogo y limpiar estados
            setIsEditDialogOpen(false);
            setCurrentUser(null);
        }

    }

    // Eliminar usuario
    const handleDelete = async (id: string) => {
        try {
            setUsers(users.filter((user) => user.id !== id))
            setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
            const res = await deleteDataUserAction(id);
            if (res.success) {
                toast.success("Usuario eliminado", {
                    description: "Usuario eliminado correctamente",
                    duration: 5000,
                })
            } else {
                toast.error("Error al eliminar usuario", {
                    description: "No se pudo eliminar el usuario, por favor intente nuevamente.",
                    duration: 5000,
                })
            }
        } catch (error) {
            console.error("Error al eliminar el usuario:", error);
            toast.error("Error al eliminar usuario", {
                description: "No se pudo eliminar el usuario, por favor intente nuevamente.",
                duration: 5000,
            })
        }
    }


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <UserSearch className="h-12 w-12 animate-pulse text-primary" />
                <p className="ml-4 text-lg">Buscando Usuarios ...</p>
            </div>
        );
    }

    //
    return (
        <Card className="rounded-md border overflow-x-auto m-2">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <CardTitle className="text-2xl font-bold">Gestion de usuarios</CardTitle>
                        <CardDescription className='p-2'>Gestionar los datos de usuario, editarlos o eliminarlos.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <div className="rounded-md border overflow-x-auto m-2">
                <Table>
                    <TableCaption>Lista de usuarios disponibles.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Apellido</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Edad</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Inicio Plan</TableHead>
                            <TableHead>Vencimiento plan</TableHead>
                            <TableHead>Estado(Membresia)</TableHead>
                            <TableHead>Plan(Nombre)</TableHead>
                            <TableHead>Plan(Precio)</TableHead>
                            {/* <TableHead>Codigo QR</TableHead> */}
                            <TableHead className="text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                                    No hay usuarios para mostrar
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedUsers.map((user) => (
                                <TableRow key={user.id} className={selectedRows.includes(user.id) ? "bg-muted/50" : ""}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.lastname}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-200">
                                            <Phone />
                                            {user.phone}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-blue-400 text-white dark:bg-blue-600">
                                            {user.age}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-gray-200 text-gray">
                                            <Mail />
                                            {user.gmail}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {new Date(user.startPlan).toLocaleDateString()}
                                        </span>
                                    </TableCell>
                                    {/* aqui tiene que calcular la fecha de los clientes y sacarle cuando se le vende la subscripcion */}
                                    <TableCell>
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            {expireSubscription[user.id]}
                                        </span>
                                    </TableCell>
                                    {/* Cambiar el color del estado del plan según su valor */}
                                    <TableCell>
                                        {userStatusMap[user.id] ? (
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${userStatusMap[user.id] === "Activo" ? "bg-green-200 text-green-800 " :
                                                    userStatusMap[user.id] === "Inactivo" ? "bg-red-200 text-red-800" :
                                                        "bg-gray-100 text-gray-800" // Estilo por defecto 
                                                    }`}
                                            >
                                                {userStatusMap[user.id]}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                                Calculando...
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                            {user.subscriptionPlan?.name ?? "N/A"}
                                        </span>
                                    </TableCell>
                                    <TableCell>{user.price ? `$${user.price}` : "N/A"}</TableCell>
                                    {/* Aqui genero el codigo qr para poder scanear al usuario */}
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Aqui mostrar informacion mas detallada del usuario */}
                                            <Button variant="outline" size="icon" onClick={() => handleViewDetails(user)}>
                                                <EyeIcon className="h-4 w-4" />
                                                <span className="sr-only">Ver</span>
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(user)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                            <AlertDialog open={isDeleteDialogOpen && userToDeleteId === user.id} onOpenChange={(open) => {
                                                if (!open) {
                                                    setIsDeleteDialogOpen(false);
                                                    setUserToDeleteId(null); // Limpiar al cerrar
                                                }
                                            }}>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => {
                                                            setUserToDeleteId(user.id);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Eliminar</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Esto eliminará permanentemente
                                                            al usuario y sus datos de nuestros servidores, perdiendo toda informacion asociada.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => {
                                                            setIsDeleteDialogOpen(false);
                                                            setUserToDeleteId(null);
                                                        }}>
                                                            Cancelar
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => {
                                                            if (userToDeleteId) {
                                                                handleDelete(userToDeleteId); // Llama a tu función de eliminar
                                                            }
                                                            setIsDeleteDialogOpen(false); // Cierra el diálogo después de la acción
                                                            setUserToDeleteId(null);
                                                        }}>
                                                            Sí, eliminar usuario.
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Controles de Paginación */}
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4 px-1">
                    <Button
                        variant="link"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="link"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* Actualizar el diálogo de edición con todos los campos */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar datos de usuario</DialogTitle>
                    </DialogHeader>
                    {/* Envolver el contenido en un <form> */}
                    <form onSubmit={(e) => {
                        e.preventDefault(); // Prevenir el envío por defecto del navegador
                        handleSaveEdit({ ...editForm, age: Number(editForm.age) });   // Llamar a tu función de guardado que incluye validación Zod
                    }}>
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
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
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false); // Permitir siempre cerrar con Cancelar
                                    setCurrentUser(null);     // Limpiar usuario actual
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar cambios</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Nuevo Diálogo para Ver Detalles del Usuario */}
            {viewingUser && (
                <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Detalles de usuario</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto text-sm">
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Nombre:</span>
                                <span>{viewingUser.name}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Apellido:</span>
                                <span>{viewingUser.lastname}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Teléfono:</span>
                                <Badge className="bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-200">
                                    <Phone />
                                    {viewingUser.phone}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Edad:</span>
                                <span>{viewingUser.age}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Email:</span>
                                <span>{viewingUser.gmail}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Inicio Plan:</span>
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"> {new Date(viewingUser.startPlan).toLocaleDateString()}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Vencimiento Plan:</span>
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{expireSubscription[viewingUser.id] || "N/D"}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Estado Membresía:</span>
                                {userStatusMap[viewingUser.id] ? (
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${userStatusMap[viewingUser.id] === "Activo" ? "bg-green-100 text-green-800" :
                                            userStatusMap[viewingUser.id] === "Inactivo" ? "bg-red-100 text-red-800" :
                                                "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {userStatusMap[viewingUser.id]}
                                    </span>
                                ) : (
                                    <span>Calculando...</span>
                                )}
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Plan (Nombre):</span>
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                    {viewingUser.subscriptionPlan!.name ? viewingUser.subscriptionPlan?.name : "N/A"}
                                </span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Plan (Precio):</span>
                                <span>{viewingUser.price ? `$${viewingUser.price}` : "N/A"}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Registrado el:</span>
                                <span>{new Date(viewingUser.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <span className="font-semibold text-muted-foreground">Qr de cliente:</span>
                                <span> <Canvas
                                    text={viewingUser.id} // Aqui tengo que verificar por el id que tengo y en base a eso poder buscar al usuario
                                    options={{
                                        errorCorrectionLevel: 'M',
                                        margin: 2,
                                        width: 100,
                                        color: {
                                            dark: '#000000',
                                        },
                                    }}
                                /></span>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setIsViewDetailsDialogOpen(false)}>
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    )
}
