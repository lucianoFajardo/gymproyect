/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreatePlansSchema } from "@/lib/zod";
import { z } from "zod";

export const editSubscriptionPlanAction = async (value: z.infer<typeof CreatePlansSchema>) => {}