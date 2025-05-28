"use server"

import { db } from "@/lib/db";

export const deletePlansAction = async (planId: string) => {
    try {
        const planDeleteDb = await db.subscriptionPlan.delete({
            where:{
                id: planId
            }
        })
        return{
            success: true,
            message: "Plan elminado con exito",
            data: planDeleteDb,
        }
    } catch (error) {
        console.error("Error deleting plan:", error);
        return {
            success: false,
            message: "Failed to delete plan. Please try again later."
        }
    }
}