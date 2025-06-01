import { AddUserRequestPayload, DatabaseQueryResponseType } from "@/interfaces"
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


const getUserByMobileNumber = async (phoneNumber:string):Promise<DatabaseQueryResponseType> =>{
try {
    let user = await prisma.user.findUnique({ where: { phoneNumber: phoneNumber } });

    if(!user) return {error:"User donot exist in db "}

    return {data:user}

} catch (error) {
    return {error:'Error while finding user'}
}

}


const addUserToDB = async (createUserPayload:AddUserRequestPayload):Promise<DatabaseQueryResponseType>=>{
    try {
        let user = await prisma.user.create({
          data: { phoneNumber: createUserPayload.phoneNumber },
        });

        return {data:user.id}
    } catch (error) {
        return {error:"Failed to add user to db "}
    }
}


export {getUserByMobileNumber,
    addUserToDB
}