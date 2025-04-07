import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const invoices = [
    {
        id: 'klldosd234',
        name: 'Luciano fajardo',
        lastname: 'Sanchez',
        phone: '956338546',
        age: '15 años',
        gmail: 'gg.@gm.com',
        startPlasn: '15/02/2025',
        cancelPlan: '15/03/2025',
        plan: 4,
        statusPlan: 'Cancelado',
        pay: '$ 35.000',
        methodpay: 'transferencia',
        qrCode: 'img:code.ko',
        createdFor: '',
        createDateAt: '',
        updateDateAt: '',
    },
]

export default function TableDemo() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Miembros</h1>
            <div className="overflow-x-auto">
                <Table className="min-w-full border border-gray-200">
                    <TableCaption className="text-gray-500">
                        Tabla de información de los miembros del gym.
                    </TableCaption>
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            <TableHead className="px-4 py-2 text-left">Nombre</TableHead>
                            <TableHead className="px-4 py-2 text-left">Apellido</TableHead>
                            <TableHead className="px-4 py-2 text-left">Teléfono</TableHead>
                            <TableHead className="px-4 py-2 text-left">Edad</TableHead>
                            <TableHead className="px-4 py-2 text-left">Correo</TableHead>
                            <TableHead className="px-4 py-2 text-left">Fecha Ingreso</TableHead>
                            <TableHead className="px-4 py-2 text-left">Fecha Término Plan</TableHead>
                            <TableHead className="px-4 py-2 text-left">Plan</TableHead>
                            <TableHead className="px-4 py-2 text-left">Precio</TableHead>
                            <TableHead className="px-4 py-2 text-left">QR Code</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow
                                key={invoice.id}
                                className="hover:bg-gray-50 even:bg-gray-100"
                            >
                                <TableCell className="px-4 py-2 font-medium">
                                    {invoice.name}
                                </TableCell>
                                <TableCell className="px-4 py-2">{invoice.lastname}</TableCell>
                                <TableCell className="px-4 py-2">{invoice.phone}</TableCell>
                                <TableCell className="px-4 py-2">{invoice.age}</TableCell>
                                <TableCell className="px-4 py-2">{invoice.gmail}</TableCell>
                                <TableCell className="px-4 py-2">{invoice.startPlasn}</TableCell>
                                <TableCell className="px-4 py-2">{invoice.cancelPlan}</TableCell>
                                <TableCell className="px-4 py-2">{invoice.plan + " meses"}</TableCell>
                                <TableCell className="px-4 py-2">{invoice.pay}</TableCell>
                                <TableCell className="px-4 py-2">
                                    <img
                                        src={invoice.qrCode}
                                        alt="QR Code"
                                        className="w-10 h-10 object-contain"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="bg-gray-100">
                            <TableCell colSpan={8} className="px-4 py-2 font-medium">
                                Total
                            </TableCell>
                            <TableCell className="px-4 py-2 font-medium">$2,500.00</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    )
}
