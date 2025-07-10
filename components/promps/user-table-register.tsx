"use client"

//TODO : -> aqui mañana optimizar lo mas posible este codigo de aqui para poder mejorarlo de alguna manera

import { useEffect, useState } from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Edit, EyeIcon, Mail, Phone, PlusCircle, Trash, UserSearch } from "lucide-react"
import { getDataUserAction } from "@/actions/get-data-user-action"
import { UserModel } from "../../Model/User-model"
import checkSubscriptionExpiration from "@/actions/expiration-subscription-action"
import { toast } from "sonner"
import { deleteDataUserAction } from "@/actions/delete-data-user-action"
import { Badge } from "../ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import Link from "next/link"
import { ViewUserModal } from "./view-user-modal"
import { AlertDialogModalProps } from "./alert-dialog-modal"
import { UpdateUserModal } from "./update-user-modal"

export default function UserTable() {
    const ITEMS_PER_PAGE = 20; // Define cuántos usuarios mostrar por página
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<UserModel[]>([])
    const [totalUsers, setTotalUsers] = useState(0); // Nuevo estado
    const [expireSubscription, setExpireSubscription] = useState<Record<string, string>>({});
    const [userStatusMap, setUserStatusMap] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState<number>(1);

    //* Obtener los datos de los usuarios al cargar el componente
    useEffect(() => {
        setIsLoading(true); // Iniciar el estado de carga
        getDataUserAction({ page: currentPage, pageSize: ITEMS_PER_PAGE }).then((data) => {
            if (!data) {
                toast.error("Error al cargar los usuarios", {
                    description: "No se pudieron obtener los datos de los usuarios.",
                    duration: 5000,
                });
                setIsLoading(false);
                setUsers([]);
                setTotalUsers(0);
                return;
            }
            setUsers(data.users); // Asignar los usuarios obtenidos
            setTotalUsers(data.total); // Asignar el total de usuarios
            setIsLoading(false); // Finalizar el estado de carga
        })
    }, [currentPage]);

    // Estado para el diálogo de eliminación
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [SelectedToDeleted, setSelectedToDeleted] = useState<UserModel>();

    // Estados para edición
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    // Nuevos estados para el diálogo de "ver detalles"
    const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState<UserModel | null>(null);
    
    const [userToEdit, setUserToEdit] = useState<UserModel | null>(null);

    const handleChangeState = (value: UserModel) => {
        setUsers(prev => prev.map(
            user => user.id === value.id ? {
                ...user, ...value, age: String(value.age)
            }
                : user));
    }

    // fn para manejar la vista de detalles del usuario
    const handleViewDetails = (user: UserModel) => {
        setViewingUser(user);
        setIsViewDetailsDialogOpen(true);
    };

    const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE); // Calcular el total de páginas
    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Estado para manejar la fecha de inicio del plan y su vencimiento
    useEffect(() => {
        if (users.length > 0) {
            // Procesar todas las fechas de inicio de los planes
            Promise.all(
                users.map(async (user) => {
                    const endPlanDay = user.subscriptionPlan?.durationDaysPlan || 0;  //obtengo la duracion del plan y sino me retorna 0
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
                throw new Error("Error al calcular la fecha de vencimiento de los planes: " + error);
            });
        }
    }, [users]); // Este useEffect se ejecuta cada vez que el estado 'users' cambia


    const handleToEdit = (user: UserModel) => {
        setUserToEdit(user);
        setIsEditDialogOpen(true)
    }

    const handleToDeleted = (user: UserModel) => {
        setSelectedToDeleted(user);
        setIsDeleteDialogOpen(true);
    }

    // Eliminar usuario
    const handleDeleted = async () => {
        if (!SelectedToDeleted) {
            toast.error("Error", { description: "No hay usuario seleccionado para eliminar." });
            return;
        }
        try {
            const res = await deleteDataUserAction(SelectedToDeleted.id); // Llamar a la función de eliminación
            if (res.success) {
                // Actualizar el estado de usuarios eliminando el usuario eliminado
                setUsers((prevUsers) => prevUsers.filter((user) => user.id !== SelectedToDeleted.id));
                setIsDeleteDialogOpen(false);
                setSelectedToDeleted(undefined); // Limpiar el usuario seleccionado para eliminar
                toast.success("Usuario eliminado", {
                    description: "El usuario ha sido eliminado correctamente.",
                    duration: 5000,
                });
            } else {
                toast.error("Error al eliminar usuario", {
                    description: "No se pudo eliminar el usuario, por favor intente nuevamente.",
                    duration: 5000,
                });
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

    return (
        <Card className="rounded-md border overflow-x-auto m-2">
            <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold">Gestiónar usuario</CardTitle>
                        <CardDescription>Visualiza, edita o elimina los datos del usuario asociados al gimnasio.</CardDescription>
                    </div>
                    <Link href="/dashboard/members/create-user" passHref>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear usuarios
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <div className="rounded-lg overflow-x-auto m-2">
                <Table>
                    <TableCaption>Lista de usuarios disponibles.</TableCaption>
                    <TableHeader>
                        <TableRow className="bg-emerald-600 pointer-events-none">
                            <TableHead className="text-white">Nombre</TableHead>
                            <TableHead className="text-white">Apellido</TableHead>
                            <TableHead className="text-white">Teléfono</TableHead>
                            <TableHead className="text-white"> Edad</TableHead>
                            <TableHead className="text-white">Email</TableHead>
                            <TableHead className="text-white">Inicio Plan</TableHead>
                            <TableHead className="text-white">Vencimiento plan</TableHead>
                            <TableHead className="text-white">Estado(Membresia)</TableHead>
                            <TableHead className="text-right text-white">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                                    No hay usuarios para mostrar
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.lastname}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-gray-200 text-gray-800 dark:bg-green-600 dark:text-green-200">
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
                                    {/* aqui tiene que calcular la fecha de los clientes y sacarle cuando se le vence la subscripcion */}
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
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Aqui mostrar informacion mas detallada del usuario */}
                                            <Button variant="outline" size="icon" onClick={() => handleViewDetails(user)}>
                                                <EyeIcon className="h-4 w-4" />
                                                <span className="sr-only">Ver</span>
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleToEdit(user)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => { handleToDeleted(user) }}>
                                                <Trash className="h-4 w-4" />
                                                <span className="sr-only">Eliminar</span>
                                            </Button>
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

            {/* Modal para editar al usuario */}
            {
                userToEdit && (
                    <UpdateUserModal
                        isOpen={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        user={userToEdit}
                        onChangeState={handleChangeState}
                    />
                )}

            {/* Modal para elminiar al usuario  */}
            <AlertDialogModalProps
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Eliminar usuario"
                description={`¿Estás seguro de que deseas eliminar a ${SelectedToDeleted?.name} ${SelectedToDeleted?.lastname}? Esta acción no se puede deshacer.
                    una vez eliminado, no podras recuperar los datos de este usuario.
                `}
                confirmText="Si, eliminar"
                onclick={handleDeleted}
            />

            {/* Modal para ver detalles del usuario */}
            {
                viewingUser && (
                    <ViewUserModal
                        isOpen={isViewDetailsDialogOpen}
                        expireSubscription={expireSubscription[viewingUser.id]}
                        onOpenChange={setIsViewDetailsDialogOpen}
                        data={viewingUser}
                        onClose={() => setIsViewDetailsDialogOpen(false)}
                    />
                )
            }
        </Card>
    )
}
