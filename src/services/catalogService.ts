import { ServiceOffering, ServiceRequest } from "@prisma/client";
import prisma from "../config/db";
import { generateCustomId } from "../utils/generateId";

interface CreateServiceOfferingInput {
    name: string;
    description: string;
}

interface SubmitServiceRequestInput {
    offeringId: string;
    requesterId: string;
    comments?: string;
}

interface ApproveServiceRequestInput {
    requestId: string;
    approvedBy: string;
    comment?: string;
}

interface GetRequestsByOfferingInput {
    offeringId: string;
    page?: number;
    size?: number;
}

export const createServiceOffering = async (
    input: CreateServiceOfferingInput
): Promise<ServiceOffering> => {
    const customId = await generateCustomId('CATALOG', 6);
    return await prisma.serviceOffering.create({
        data: {
            id: customId,
            ...input,
            status: 'ACTIVE',
        },
    });
};

export const getOfferingsList = async (): Promise<ServiceOffering[]> => {
    return await prisma.serviceOffering.findMany({
        where: {
            status: 'ACTIVE',
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const searchCatalogItemsByName = async (
    searchTerm: string
): Promise<ServiceOffering[]> => {
    return await prisma.serviceOffering.findMany({
        where: {
            name: {
                contains: searchTerm.toLowerCase(),
            },
            status: 'ACTIVE',
        },
    });
};

export const submitServiceRequest = async (
    input: SubmitServiceRequestInput
): Promise<ServiceRequest> => {
    const customId = await generateCustomId('REQ', 10);
    return await prisma.serviceRequest.create({
        data: {
            id: customId,
            offeringId: input.offeringId,
            requesterId: input.requesterId,
            comments: input.comments,
            status: 'PENDING',
        },
    });
};

export const approveServiceRequest = async (
    input: ApproveServiceRequestInput
): Promise<ServiceRequest> => {
    const existingRequest = await prisma.serviceRequest.findUnique({
        where: { id: input.requestId },
    });
    if (!existingRequest) {
        throw new Error('Service request not found');
    }
    if (existingRequest.status !== 'PENDING') {
        throw new Error('Request is not pending approval');
    }
    return await prisma.serviceRequest.update({
        where: { id: input.requestId },
        data: {
            status: 'APPROVED',
            approvedBy: input.approvedBy,
            comments: input.comment
                ? `${existingRequest.comments || ''}\nApproval Note: ${input.comment}`
                : existingRequest.comments,
        },
    });
};

export const getRequestsByOffering = async ({
    offeringId,
    page = 1,
    size = 10,
}: GetRequestsByOfferingInput) => {
    const skip = (page - 1) * size;
    const [requests, total] = await prisma.$transaction([
        prisma.serviceRequest.findMany({
            where: { offeringId },
            skip,
            take: size,
            orderBy: { createdAt: 'desc' }, 
        }),
        prisma.serviceRequest.count({ where: { offeringId } }),
    ]);
    return { requests, total, page, size };
};