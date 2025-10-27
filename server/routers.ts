import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createTrainingRequest, getAllTrainingRequests, getTrainingRequestById } from "./db";
import { calculateQuotation } from "./travelCalculator";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  trainingRequest: router({
    calculateQuotation: publicProcedure
      .input(z.object({
        address: z.string(),
        trainingDays: z.number(),
      }))
      .mutation(async ({ input }) => {
        const quotation = calculateQuotation(input.address, input.trainingDays);
        return quotation;
      }),

    create: publicProcedure
      .input(z.object({
        // Company Information
        companyName: z.string(),
        contactPerson: z.string(),
        address: z.string(),
        phone: z.string(),
        email: z.string().email(),
        machineBrand: z.string().optional(),
        machineModel: z.string().optional(),
        
        // OEM Information (Optional)
        oemName: z.string().optional(),
        oemAddress: z.string().optional(),
        oemContact: z.string().optional(),
        oemEmail: z.string().email().optional().or(z.literal('')),
        oemPhone: z.string().optional(),
        
        // Training Details
        controllerModel: z.string().optional(),
        machineType: z.string().optional(),
        programmingType: z.string().optional(),
        trainingDays: z.number().optional(),
        trainees: z.number().optional(),
        knowledgeLevel: z.string().optional(),
        
        // Signature and Acceptance
        applicantName: z.string().optional(),
        applicationDate: z.date().optional(),
        signatureData: z.string().optional(),
        termsAccepted: z.boolean(),
        
        // Quotation Details
        trainingPrice: z.number().optional(),
        travelTime: z.number().optional(),
        travelTimeHours: z.number().optional(),
        travelExpenses: z.number().optional(),
        hotelCost: z.number().optional(),
        foodCost: z.number().optional(),
        carRentalCost: z.number().optional(),
        flightCost: z.number().optional(),
        totalPrice: z.number().optional(),
        nearestAirport: z.string().optional(),
        
        // Metadata
        language: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const request = await createTrainingRequest(input);
        return request;
      }),

    list: protectedProcedure.query(async () => {
      return await getAllTrainingRequests();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getTrainingRequestById(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;

