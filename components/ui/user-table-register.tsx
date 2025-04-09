"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Trash2 } from "lucide-react"
import { getDataUserAction } from "@/actions/get-data-user-action"

// Cambiar el tipo User para que coincida con el nuevo modelo de datos
interface User {
    id: string,
    name: string,
    gmail: string,
    statusPlan: string,
    subscriptionPlan: {
        namePrice: string | null,
    },
    createdAt: Date,
}

export default function UserTable() {

    const [data, setData] = useState<User[]>([])

    useEffect(() => {
        getDataUserAction().then((e) => {
            setData(e)
            console.log(data);
        })
    },)
    // Actualizar los datos de ejemplo
    const [users, setUsers] = useState<User[]>([
        {
            id: 'dassdas',
            name: "Carlos",
            lastname: "Rodríguez",
            phone: "555-123-4567",
            age: '15',
            gmail: "carlos@ejemplo.com",
            startPlan: "2023-01-15",
            statusPlan: "Activo",
            subscriptionPlan: "Premium",
            methodpay: "Tarjeta",
        },
        {
            id: 'dda458766',
            name: "María",
            lastname: "López",
            phone: "555-234-5678",
            age: '15',
            gmail: "maria@ejemplo.com",
            startPlan: "2023-03-22",
            statusPlan: "Activo",
            subscriptionPlan: "Básico",
            methodpay: "PayPal",
        },
        {
            id: '4d86a22s5d',
            name: "Juan",
            lastname: "Pérez",
            phone: "555-345-6789",
            age: '15',
            gmail: "juan@ejemplo.com",
            startPlan: "2022-11-05",
            statusPlan: "Inactivo",
            subscriptionPlan: "Premium",
            methodpay: "Transferencia",
        },
        {
            id: 'dd87q9s26<',
            name: "Ana",
            lastname: "Martínez",
            phone: "555-456-7890",
            age: '15',
            gmail: "ana@ejemplo.com",
            startPlan: "2023-05-10",
            statusPlan: "Activo",
            subscriptionPlan: "Familiar",
            methodpay: "Tarjeta",
        },
        {
            id: '89wwrcatgha',
            name: "Roberto",
            lastname: "Sánchez",
            phone: "555-567-8901",
            age: '15',
            gmail: "roberto@ejemplo.com",
            startPlan: "2023-02-18",
            statusPlan: "Activo",
            subscriptionPlan: "Básico",
            methodpay: "PayPal",
        },
    ])

    // Estado para selección de filas
    const [selectedRows, setSelectedRows] = useState<string[]>([])

    // Estados para edición
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)

    // Actualizar el estado inicial del formulario de edición
    const [editForm, setEditForm] = useState<Omit<User, "id">>({
        name: "",
        lastname: "",
        phone: "",
        age: '',
        gmail: "",
        startPlan: "",
        statusPlan: "",
        subscriptionPlan: "",
        methodpay: "",
    })

    // Manejar selección de fila
    const handleRowSelect = (id: string) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
        } else {
            setSelectedRows([...selectedRows, id])
        }
    }

    // Manejar selección de todas las filas
    const handleSelectAll = () => {
        if (selectedRows.length === users.length) {
            setSelectedRows([])
        } else {
            setSelectedRows(users.map((user) => user.id))
        }
    }

    // Actualizar la función handleEdit para incluir todos los campos
    const handleEdit = (user: User) => {
        setCurrentUser(user)
        setEditForm({
            name: user.name,
            lastname: user.lastname,
            phone: user.phone,
            age: user.age,
            gmail: user.gmail,
            startPlan: user.startPlan,
            statusPlan: user.statusPlan,
            subscriptionPlan: user.subscriptionPlan,
            methodpay: user.methodpay,
        })
        setIsEditDialogOpen(true)
    }

    // Guardar cambios de edición
    const handleSaveEdit = () => {
        if (!currentUser) return
        const updatedUsers = users.map((user) => (user.id === currentUser.id ? { ...user, ...editForm } : user))
        setUsers(updatedUsers)
        setIsEditDialogOpen(false)
        setCurrentUser(null)
    }

    // Eliminar usuario
    const handleDelete = (id: string) => {
        setUsers(users.filter((user) => user.id !== id))
        setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
    }

    // Eliminar usuarios seleccionados
    const handleDeleteSelected = () => {
        setUsers(users.filter((user) => !selectedRows.includes(user.id)))
        setSelectedRows([])
    }

    // Reemplazar la estructura de la tabla con los nuevos campos
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-center">Gestión de Usuarios</h1>
                <div className="space-x-2">
                    {selectedRows.length > 0 && (
                        <Button variant="destructive" onClick={handleDeleteSelected} size="sm">
                            Eliminar seleccionados ({selectedRows.length})
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedRows.length === users.length && users.length > 0}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Seleccionar todos"
                                />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Apellido</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Edad</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Inicio Plan</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Método Pago</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
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
                                <TableRow key={user.id} className={selectedRows.includes(user.id) ? "bg-muted/50" : ""}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRows.includes(user.id)}
                                            onCheckedChange={() => handleRowSelect(user.id)}
                                            aria-label={`Seleccionar ${user.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.lastname}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>{user.age}</TableCell>
                                    <TableCell>{user.gmail}</TableCell>
                                    <TableCell>{user.startPlan}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${user.statusPlan === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                        >
                                            {user.statusPlan}
                                        </span>
                                    </TableCell>
                                    <TableCell>{user.subscriptionPlan}</TableCell>
                                    <TableCell>{user.methodpay}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                                                <Trash2 className="h-4 w-4" />
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

            {/* Actualizar el diálogo de edición con todos los campos */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Suscriptor</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastname">Apellido</Label>
                                <Input
                                    id="lastname"
                                    value={editForm.lastname}
                                    onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="age">Edad</Label>
                                <Input
                                    id="age"
                                    type="text"
                                    value={editForm.age}
                                    onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="gmail">Email</Label>
                            <Input
                                id="gmail"
                                type="email"
                                value={editForm.gmail}
                                onChange={(e) => setEditForm({ ...editForm, gmail: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="startPlan">Inicio del Plan</Label>
                            <Input
                                id="startPlan"
                                type="date"
                                value={editForm.startPlan}
                                onChange={(e) => setEditForm({ ...editForm, startPlan: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="statusPlan">Estado del Plan</Label>
                                <Input
                                    id="statusPlan"
                                    value={editForm.statusPlan}
                                    onChange={(e) => setEditForm({ ...editForm, statusPlan: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="subscriptionPlan">Plan de Suscripción</Label>
                                <Input
                                    id="subscriptionPlan"
                                    value={editForm.subscriptionPlan}
                                    onChange={(e) => setEditForm({ ...editForm, subscriptionPlan: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="methodpay">Método de Pago</Label>
                            <Input
                                id="methodpay"
                                value={editForm.methodpay}
                                onChange={(e) => setEditForm({ ...editForm, methodpay: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveEdit}>Guardar cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
