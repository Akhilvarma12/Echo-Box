import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: userNameValidation
})

export async function GET(request: Request) {

    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const queryParam={
            username: searchParams.get("username") || ""
        }
        //validate using zod
        const result=UsernameQuerySchema.safeParse(queryParam);
        console.log(result)
        if(!result.success){
            const usernameError=result.error.format().username?._errors ||  [];
            return new Response(JSON.stringify({
                success: false,
                message: "Invalid username",
                errors: usernameError
            }), {status: 400})
        }

        const {username}=result.data
        const existingVerifiedUser=await UserModel.findOne({
            username,
            isVerified: true
        })
        if(existingVerifiedUser){
            return new Response(JSON.stringify({
                success: false,
                message: "Username is already taken"
            }), {status: 400})
        }
        return new Response(JSON.stringify({
            success: true,
            message: "Username is available"
        }), {status: 200}) 

    } catch (error) {
        console.log("error checking username",error)
        return Response.json({
            success: false,
            message: "Error checking username"
        }, {status: 500})
    }
}