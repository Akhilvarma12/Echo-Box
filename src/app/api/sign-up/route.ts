import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect();
    try {
      const {username,email,password}=  await request.json()
    } catch (error) {
        console.log("error registering user", error);
        return new Response(JSON.stringify({success: false, message: "Error registering user"}), {status: 500});
    }
}