import { ServiceOffering } from "@prisma/client";
import prisma from "../config/db";

interface CreateServiceOfferingInput {
    name: string;
    description: string;
}

export const createServiceOffering = async (
    input: CreateServiceOfferingInput
): Promise<ServiceOffering> => {
    return await prisma.serviceOffering.create({
        data: {
            ...input,
            status: 'ACTIVE',
        },
    });
};

export const submitServiceRequest = async (data: { offeringId: string; requesterId: string }) => {
    return await prisma.serviceRequest.create({
        data: {
            offeringId: data.offeringId,
            requesterId: data.requesterId,
        },
    });
};