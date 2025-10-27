import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";

import { z } from "zod";
import { createTrainingRequest, getAllTrainingRequests, getTrainingRequestById, getAllNotificationEmails, addNotificationEmail, removeNotificationEmail } from "./db";
import { calculateQuotation } from "./travelCalculator";
import { sendTrainingRequestEmail } from "./emailService";

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
        
        // Send email notification about new training request (non-blocking)
        try {
          await sendTrainingRequestEmail({
            companyName: input.companyName,
            contactPerson: input.contactPerson,
            email: input.email,
            phone: input.phone,
            address: input.address,
            machineBrand: input.machineBrand,
            machineModel: input.machineModel,
            controllerModel: input.controllerModel,
            machineType: input.machineType,
            programmingType: input.programmingType,
            trainingDays: input.trainingDays,
            knowledgeLevel: input.knowledgeLevel,
            totalPrice: input.totalPrice,
            oemName: input.oemName,
            oemContact: input.oemContact,
            oemEmail: input.oemEmail,
          });
        } catch (error) {
          console.error('Error sending email notification:', error);
          // Continue anyway - email failure shouldn't block form submission
        }
        
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

  notificationEmails: router({
    list: protectedProcedure.query(async () => {
      return await getAllNotificationEmails();
    }),

    add: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        return await addNotificationEmail(input.email);
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await removeNotificationEmail(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

