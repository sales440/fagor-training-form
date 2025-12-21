import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";

import { z } from "zod";
import { createTrainingRequest, getAllTrainingRequests, getTrainingRequestById, getAllNotificationEmails, addNotificationEmail, removeNotificationEmail, generateReferenceCode, getTrainingRequestByReferenceCode } from "./db";
import { calculateQuotation } from "./travelCalculator";
import { sendTrainingRequestEmail, sendStatusUpdateEmail, sendClientConfirmationEmail, sendDateApprovalEmail, sendDateRejectionEmail } from "./emailService";
import * as crypto from 'crypto';
import { getAssignedTechnician, getTechnicianAvailability, writeTrainingRequest } from "./googleSheetsService";
import { generateExcelBackup } from "./excelExport";
import { getDb } from "./db";
import { trainingRequests } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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
        city: z.string().optional(),
        state: z.string().optional(),
        trainingDays: z.number(),
      }))
      .mutation(async ({ input }) => {
        const quotation = await calculateQuotation(input.address, input.trainingDays, input.city, input.state);
        return quotation;
      }),

    // Generate reference code and assign technician
    initializeRequest: publicProcedure
      .input(z.object({
        state: z.string(),
      }))
      .mutation(async ({ input }) => {
        const referenceCode = await generateReferenceCode();
        const assignedTechnician = getAssignedTechnician(input.state);
        
        return {
          referenceCode,
          assignedTechnician,
        };
      }),

    // Get technician availability for calendar
    getAvailability: publicProcedure
      .input(z.object({
        referenceCode: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const request = await getTrainingRequestByReferenceCode(input.referenceCode);
        if (!request || !request.assignedTechnician) {
          throw new Error('Training request not found');
        }
        
        const availability = await getTechnicianAvailability(
          request.assignedTechnician,
          new Date(input.startDate),
          new Date(input.endDate)
        );
        
        return {
          technician: request.assignedTechnician,
          availability,
        };
      }),

    // Select training dates and write to Google Sheets
    selectDates: publicProcedure
      .input(z.object({
        referenceCode: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        const request = await getTrainingRequestByReferenceCode(input.referenceCode);
        if (!request) {
          throw new Error('Training request not found');
        }
        
        // Google Sheets integration disabled for Railway deployment
        console.log('[GoogleSheets] Integration disabled, skipping write');
        
        // Update database
        const db = await getDb();
        if (db) {
          await db
            .update(trainingRequests)
            .set({
              requestedStartDate: new Date(input.startDate),
              requestedEndDate: new Date(input.endDate),
              status: 'dates_selected',
              updatedAt: new Date(),
            })
            .where(eq(trainingRequests.referenceCode, input.referenceCode));
        }
        
        return { success: true };
      }),

    create: publicProcedure
      .input(z.object({
        // Company Information
        companyName: z.string(),
        contactPerson: z.string(),
        address: z.string(),
        address1: z.string().optional(),
        address2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
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
        try {
          // Generate reference code and assign technician
          const referenceCode = await generateReferenceCode();
          const assignedTechnician = getAssignedTechnician(input.state || '');
          
          const request = await createTrainingRequest({
            ...input,
            referenceCode,
            assignedTechnician,
          });
          
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
        } catch (error) {
          console.error('Error creating training request:', error);
          throw new Error(`Failed to create training request: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    list: protectedProcedure.query(async () => {
      return await getAllTrainingRequests();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getTrainingRequestById(input.id);
      }),

    // Calendar & Kanban endpoints
    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only administrators can view all training requests');
        }
        const requests = await getAllTrainingRequests();
        return requests;
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'awaiting_client_confirmation', 'approved', 'rejected', 'dates_selected']),
        rejectionReason: z.string().optional(),
        technicianNotes: z.string().optional(),
        approvedDates: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only administrators can update status');
        }

        const db = await getDb();
        if (!db) throw new Error('Database not available');
        let updateData: any = {
          status: input.status,
          technicianNotes: input.technicianNotes,
          updatedAt: new Date(),
        };

        if (input.status === 'rejected') {
          updateData.rejectionReason = input.rejectionReason;
        }

        if (input.status === 'awaiting_client_confirmation') {
          const token = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);
          updateData.clientConfirmationToken = token;
          updateData.tokenExpiresAt = expiresAt;
          updateData.clientConfirmed = false;
        }

        await db.update(trainingRequests)
          .set(updateData)
          .where(eq(trainingRequests.id, input.id));

        // Send email notifications for approval/rejection
        const request = await getTrainingRequestById(input.id);
        if (request && input.status === 'approved' && input.approvedDates) {
          await sendDateApprovalEmail({
            clientEmail: request.email,
            companyName: request.companyName,
            contactPerson: request.contactPerson,
            approvedDates: input.approvedDates,
            technician: request.assignedTechnician || 'TBD',
            referenceCode: request.referenceCode || '',
          });
        } else if (request && input.status === 'rejected' && input.rejectionReason) {
          await sendDateRejectionEmail({
            clientEmail: request.email,
            companyName: request.companyName,
            contactPerson: request.contactPerson,
            rejectionReason: input.rejectionReason,
            referenceCode: request.referenceCode || '',
          });
        }

        const [updatedRequest] = await db.select()
          .from(trainingRequests)
          .where(eq(trainingRequests.id, input.id))
          .limit(1);

        if (input.status === 'awaiting_client_confirmation') {
          await sendClientConfirmationEmail(updatedRequest);
        } else {
          await sendStatusUpdateEmail(updatedRequest);
        }

        return { success: true, request: updatedRequest };
      }),

    updateDates: protectedProcedure
      .input(z.object({
        id: z.number(),
        dates: z.array(z.string()),
        technicianNotes: z.string().optional(),
        assignedTechnician: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only administrators can update dates');
        }

        const db = await getDb();
        if (!db) throw new Error('Database not available');
        await db.update(trainingRequests)
          .set({
            approvedDates: JSON.stringify(input.dates),
            technicianNotes: input.technicianNotes,
            assignedTechnician: input.assignedTechnician,
            updatedAt: new Date(),
          })
          .where(eq(trainingRequests.id, input.id));

        return { success: true };
      }),

    confirmDates: publicProcedure
      .input(z.object({
        token: z.string(),
        confirmed: z.boolean(),
        rejectionReason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const [request] = await db.select()
          .from(trainingRequests)
          .where(eq(trainingRequests.clientConfirmationToken, input.token))
          .limit(1);

        if (!request) {
          throw new Error('Invalid confirmation token');
        }

        if (request.tokenExpiresAt && new Date() > new Date(request.tokenExpiresAt)) {
          throw new Error('Confirmation token has expired');
        }

        await db.update(trainingRequests)
          .set({
            clientConfirmed: input.confirmed,
            status: input.confirmed ? 'approved' : 'rejected',
            rejectionReason: input.rejectionReason,
            updatedAt: new Date(),
          })
          .where(eq(trainingRequests.id, request.id));

        await sendStatusUpdateEmail({ ...request, status: input.confirmed ? 'approved' : 'rejected' });

        return { success: true };
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

    getTechnicianAvailability: publicProcedure
      .input(z.object({ technician: z.string() }))
      .query(async ({ input }) => {
        // Return mock availability data - replace with real Google Sheets integration
        const today = new Date();
        const availability = [];
        for (let i = 0; i < 60; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const status = i % 7 === 0 ? 'booked' : i % 5 === 0 ? 'pending' : 'available';
          availability.push({ date: date.toISOString(), status });
        }
        return availability;
      }),

    updateRequest: protectedProcedure
      .input(z.object({
        id: z.number(),
        assignedTechnician: z.string().optional(),
        trainingPrice: z.number().optional(),
        travelExpenses: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        await db.update(trainingRequests).set(input).where(eq(trainingRequests.id, input.id));
        return { success: true };
      }),

    exportExcel: publicProcedure
      .mutation(async () => {
        const requests = await getAllTrainingRequests();
        const buffer = await generateExcelBackup(requests);
        return { data: Buffer.from(buffer).toString('base64') };
      }),
  }),
});

export type AppRouter = typeof appRouter;
