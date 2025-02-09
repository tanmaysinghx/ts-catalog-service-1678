import { Request, Response } from 'express';
import * as catalogService from '../services/catalogService';
import { z } from 'zod';
import { approveServiceRequest, getRequestsByOffering } from '../services/catalogService';
import { errorResponse, successResponse } from '../utils/responseUtils';

interface CustomRequest extends Request {
    transactionId?: string;
}

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

export const createServiceOfferingController = async (req: CustomRequest, res: Response) => {
    const transactionId = req.transactionId;
    try {
        const { name, description } = createOfferingSchema.parse(req.body);
        const offering = await catalogService.createServiceOffering({ name, description });
        res.status(201).json(successResponse(201, offering, "Offering created", transactionId));
    } catch (error: any) {
        res.status(500).json(errorResponse(500, error.message, "null", transactionId,));
    }
};

export const listServiceOfferingsController = async (req: CustomRequest, res: Response) => {
    const transactionId = req.transactionId;
    try {
        const offeringsList = await catalogService.getOfferingsList();
        res.status(200).json(successResponse(201, offeringsList, "Offerings List fetched", transactionId));
    } catch (error: any) {
        res.status(500).json(errorResponse(500, error.message, "null", transactionId,));
    }
}

export const searchServiceOfferingsController = async (req: CustomRequest, res: Response): Promise<any> => {
    const transactionId = req.transactionId;
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
        return res.status(400).json(errorResponse(400, 'Search term "name" is required and must be a string.', "null", transactionId,));
    }
    try {
        const searchResults = await catalogService.searchCatalogItemsByName(name);
        res.status(200).json(successResponse(200, searchResults, `Search results for "${name}"`, transactionId));
    } catch (error: any) {
        res.status(500).json(errorResponse(500, error.message, "null", transactionId,));
    }
};

export const submitServiceRequestController = async (
    req: CustomRequest,
    res: Response
): Promise<void> => {
    const transactionId = req.transactionId;
    try {
        const { offeringId, comments } = submitRequestSchema.parse(req.body);
        const requesterId = (req as any).user.email;
        const request = await catalogService.submitServiceRequest({
            offeringId,
            requesterId,
            comments,
        });
        res.status(201).json(successResponse(201, request, "Request submitted", transactionId));
    } catch (error: any) {
        res.status(500).json(errorResponse(400, error.message, "null", transactionId,));
    }
};

export const approveServiceRequestController = async (
    req: CustomRequest,
    res: Response
): Promise<void> => {
    const transactionId = req.transactionId;
    try {
        const { id } = req.params;
        const { comment } = approveRequestSchema.parse(req.body);
        const approvedBy = (req as any).user.email;
        const request = await approveServiceRequest({
            requestId: id,
            approvedBy,
            comment,
        });
        res.status(200).json(successResponse(200, request, "Request approved", transactionId));
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(400).json(errorResponse(400, error.message, "null", transactionId,));
        } else if (error.message.includes('not pending')) {
            res.status(400).json(errorResponse(400, error.message, "null", transactionId,));

        } else {
            res.status(500).json(errorResponse(500, error.message, "null", transactionId,));
        }
    }
};

export const getRequestsByOfferingController = async (
    req: CustomRequest,
    res: Response
): Promise<void> => {
    const transactionId = req.transactionId;
    try {
        const { offeringId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const size = parseInt(req.query.size as string) || 10;
        if (!offeringId) {
            res.status(400).json(errorResponse(400, 'Offering ID is required', "null", transactionId,));
            return;
        }
        const result = await getRequestsByOffering({ offeringId, page, size });
        let resp = {
            data: result.requests,
            pagination: {
                total: result.total,
                page: result.page,
                size: result.size,
            }
        }
        res.status(200).json(successResponse(200, resp, "Requests fetched", transactionId));
    } catch (error: any) {
        res.status(500).json(errorResponse(500, error.message, "null", transactionId,));
    }
};