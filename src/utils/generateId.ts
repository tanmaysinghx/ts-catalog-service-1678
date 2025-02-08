import prisma from "../config/db";

export const generateCustomId = async (prefix: string, length: number): Promise<string> => {
    let customId: string = "";
    let isUnique = false;
    while (!isUnique) {
        const randomDigits = Math.floor(Math.random() * Math.pow(10, length))
            .toString()
            .padStart(length, '0');
        customId = `${prefix}-${randomDigits}`;
        const existingOffering = await prisma.serviceOffering.findUnique({
            where: { id: customId },
        });
        if (!existingOffering) {
            isUnique = true;
        }
    }
    return customId;
};