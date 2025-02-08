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

export const submitServiceRequest = async (
    input: SubmitServiceRequestInput
): Promise<ServiceRequest> => {
    const customId = await generateCustomId('REQ', 10);
    return await prisma.serviceRequest.create({
        data: {
            id: customId, // Use custom ID
            offeringId: input.offeringId,
            requesterId: input.requesterId,
            comments: input.comments,
            status: 'PENDING', // Default status
        },
    });
};