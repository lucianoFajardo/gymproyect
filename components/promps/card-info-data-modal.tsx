"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { Table, TableBody, TableRow, TableHead, TableHeader, TableCell } from "../ui/table";
import { CardDataModel } from "@/Model/Card-Data-model";

interface CardInfoData {
    TitleCard: string;
    SubTitleCard: string;
    TableHeaderTitle: string;
    SubTableHeader: string;
    props: string;
    TableData: CardDataModel[];
}

export function CardInfoModal({ TitleCard, SubTitleCard, SubTableHeader, TableHeaderTitle, TableData, props }: CardInfoData) {
    return (
        <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{TitleCard}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{SubTitleCard}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <a href={props}>
                        Ver todos
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{TableHeaderTitle}</TableHead>
                            <TableHead className="text-right">{SubTableHeader}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {TableData.map((income, index) => (
                            <TableRow key={index} className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                                <TableCell>
                                    <div className="font-medium">{income.NameCard}</div>
                                    <div className="text-xs text-accent-foreground">{income.SubTitleCard}</div>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-gray-700">
                                    <span className="text-xs text-blue-500 bg-blue-100 p-1 rounded">
                                        ${income.PriceCard.toLocaleString()}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

    );
}