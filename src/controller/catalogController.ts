import { Request, Response } from 'express';
import * as catalogService from '../services/catalogService';
import { ApiResponse } from '../utils/apiResponse';
import { z } from 'zod';

const createOfferingSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(10),
});

const submitRequestSchema = z.object({
    offeringId: z.string().min(1),
    comments: z.string().optional(),
});

export const createServiceOffering = async (req: Request, res: Response) => {
    try {
        const { name, description } = createOfferingSchema.parse(req.body);
        const offering = await catalogService.createServiceOffering({ name, description });
        res.status(201).json(new ApiResponse('Offering created', offering));
    } catch (error: any) {
        res.status(400).json(new ApiResponse(error.message, null, 400));
    }
};

export const submitServiceRequestController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { offeringId, comments } = submitRequestSchema.parse(req.body);
        const requesterId = (req as any).user.email;

        const request = await catalogService.submitServiceRequest({
            offeringId,
            requesterId,
            comments,
        });
        res.status(201).json(new ApiResponse('Request submitted', request));
    } catch (error: any) {
        res.status(400).json(new ApiResponse(error.message, null, 400));
    }
};