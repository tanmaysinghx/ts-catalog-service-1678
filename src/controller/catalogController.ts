import { Request, Response } from 'express';
import * as catalogService from '../services/catalogService';
import { ApiResponse } from '../utils/apiResponse';
import { z } from 'zod';
import { approveServiceRequest } from '../services/catalogService';

const createOfferingSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(10),
});

const submitRequestSchema = z.object({
    offeringId: z.string().min(1),
    comments: z.string().optional(),
});

const approveRequestSchema = z.object({
    comment: z.string().optional(),
});

export const createServiceOfferingController = async (req: Request, res: Response) => {
    try {
        const { name, description } = createOfferingSchema.parse(req.body);
        const offering = await catalogService.createServiceOffering({ name, description });
        res.status(201).json(new ApiResponse('Offering created', offering));
    } catch (error: any) {
        res.status(400).json(new ApiResponse(error.message, null, 400));
    }
};

export const listServiceOfferingsController = async (req: Request, res: Response) => {
    try {
        const offeringsList = await catalogService.getOfferingsList();
        res.status(200).json(new ApiResponse('Offerings List fetched', offeringsList));
    } catch (error: any) {
        res.status(400).json(new ApiResponse(error.message, null, 400));
    }
}

export const searchServiceOfferingsController = async (req: Request, res: Response): Promise<any> => {
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
        return res.status(400).json(new ApiResponse('Search term "name" is required and must be a string.', null, 400));
    }

    try {
        const searchResults = await catalogService.searchCatalogItemsByName(name);
        res.status(200).json(new ApiResponse(`Search results for "${name}"`, searchResults));
    } catch (error: any) {
        res.status(500).json(new ApiResponse(error.message, null, 500));
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

export const approveServiceRequestController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { comment } = approveRequestSchema.parse(req.body);
        const approvedBy = (req as any).user.email;
        const request = await approveServiceRequest({
            requestId: id,
            approvedBy,
            comment,
        });
        res.status(200).json(new ApiResponse('Request approved', request));
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json(new ApiResponse(error.message, null, 404));
        } else if (error.message.includes('not pending')) {
            res.status(400).json(new ApiResponse(error.message, null, 400));
        } else {
            res.status(500).json(new ApiResponse(error.message, null, 500));
        }
    }
};