"use client"

// TODO: Aqui esta el apartado de las rutas del sidebar
import * as React from "react"
import {
  CalendarCogIcon,
  GalleryVerticalEnd,
  User,
  ScanQrCodeIcon,
  LucideShoppingBasket,
  ContactRoundIcon,
  Rabbit,
  HandCoins,
  SquareActivity,
} from "lucide-react"

import { NavMain } from "@/components/ui/nav-main"
import { NavUser } from "@/components/ui/nav-user"
import { TeamSwitcher } from "@/components/ui/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "DashboardGyms",
      logo: GalleryVerticalEnd,
      plan: "Administrador de gimnasios",
    },
  ],
  navMain: [
    {
      title: "Menu rapido",
      url: "#",
      icon: Rabbit,
      items: [
        {
          title: "Crear venta",
          url: "/dashboard/manage-plans",
        },
        {
          title: "Registrar asistencia",
          url: "/dashboard/manage-subscriptions",
        },
        {
          title: "Activar subscripcion",
          url: "#",
        },
      ],
    },
    {
      title: "Usuario",
      url: "#",
      icon: User,
      isActive: true,
      items: [
        {
          title: "Crear usuario",
          url: "/dashboard/create-user",
        },
        {
          title: "Gestionar usuarios",
          url: "/dashboard/view-users",
        },
        {
          //* Aqui tendria que tener algun apartado para poder crear un reporte en formato pdf o excel.
          title: "Generar reporte usuarios",
          url: "#",
        },
      ],
    },
    {
      title: "Planes y subscripciones",
      url: "#",
      icon: CalendarCogIcon,
      items: [
        {
          title: "Crear planes",
          url: "/dashboard/manage-plans",
        },
        {
          title: "Gestionar planes",
          url: "/dashboard/manage-plans/rud-plans",
        },
        {
          title: "Gestionar subscripciones", //Aqui se tiene que poder actualizar las subscripciones de los usuarios para que puedan ingresar o no al gym
          url: "/dashboard/manage-subscriptions",
        },
        {
          title: "Generar reportes",
          url: "#",
        },
      ],
    },
    {
      title: "Asistencias y reportes",
      url: "#",
      icon: ScanQrCodeIcon,
      items: [
        {
          title: "Ingresar asistencias", // Aqui se tendria que agregar un apartado para poder escanear el qr de los usuarios.
          url: "/dashboard/manage-plans",
        },
        {
          title: "Gestionar asistencias",
          url: "/dashboard/manage-subscriptions",
        },
        {
          title: "Generar reportes",
          url: "#",
        },
      ],
    },
    {
      title: "Productos y servicios",
      url: "#",
      icon: LucideShoppingBasket,
      items: [
        {
          title: "Crear productos",
          url: "/dashboard/manage-plans",
        },
        {
          title: "Crear servicios",
          url: "/dashboard/manage-plans",
        },
        {
          title: "Gestionar servicios",
          url: "/dashboard/manage-plans",
        },
        {
          title: "Gestionar productos",
          url: "/dashboard/manage-subscriptions",
        },
        {
          title: "Generar reportes",
          url: "#",
        },
      ],
    },
    {
      title: "Trabajadores",
      url: "#",
      icon: ContactRoundIcon,
      items: [
        {
          title: "Agregar ficha trabajador",
          url: "/dashboard/manage-plans",
        },
        {
          title: "Gestionar trabajadores",
          url: "/dashboard/manage-subscriptions",
        },
        {
          title: "Generar reportes",
          url: "#",
        },
      ],
    },
    {
      title: "Ventas y Cierre de caja",
      url: "#",
      icon: HandCoins,
      items: [
        {
          title: "Crear venta",
          url: "/dashboard/manage-plans",
        },
        {
          title: "Gestionar ventas",
          url: "/dashboard/manage-subscriptions",
        },
        {
          title: "Generar cierre de caja",
          url: "#",
        },
        {
          title: "Generar reporte",
          url: "#",
        },
      ],
    },
    {
      title: "Gestion del gimnasio",
      url: "#",
      icon: SquareActivity,
      items: [
        {
          title: "Ingresos y Egresos",
          url: "/dashboard/manage-plans",
        },
        {
          title: "Sueldos y pagos",
          url: "/dashboard/manage-subscriptions",
        },
        {
          title: "Gastos mensuales",
          url: "#",
        },
        {
          title: "Deudores",
          url: "#",
        },
      ],
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
