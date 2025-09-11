import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect();
    try {
      const {username,email,password}=  await request.json()
      const existingUserVerifiedByUsername=await UserModel.findOne({
        username,
        isVerified: true
      })

      if(existingUserVerifiedByUsername){ 
        Response.json({
          success: false,
          message: "Username already taken"
        }, {status: 400})
      }
      const existingUserByEmail=await UserModel.findOne({email})
      const verifyCode=Math.floor(100000 + Math.random() * 900000).toString()

      if(existingUserByEmail){
      if(existingUserByEmail.isVerified){
          return new Response(JSON.stringify({
          success: false,
          message: "User already exists with the email"
        }), {status: 400})
      }else{
        const hashedPassword=await bcrypt.hash(password, 10)
        existingUserByEmail.username=username
        existingUserByEmail.password=hashedPassword
        existingUserByEmail.verifyCode=verifyCode
        existingUserByEmail.verifyCodeExpiry=new Date(new Date().getTime()+ 60*60*1000) //1 hour from now
        await existingUserByEmail.save()
      }
      }else{
        const hashedPassword=await bcrypt.hash(password, 10)
        const expiryDate=new Date()
        expiryDate.setHours(expiryDate.getHours()+1)
        
       const newUser = new UserModel({
              username,
              email,
              password: hashedPassword,
              verifyCode: verifyCode,
              verifyCodeExpiry: expiryDate,
              isVerified: false,
              isAcceptingMessage: true,
              messages:[]
        })
          await newUser.save()
      }
      //send verification email
      const emailResponse=await sendVerificationEmail(email,username, verifyCode)

      if(!emailResponse.success){
        return new Response(JSON.stringify({
          success: false,
          message: emailResponse.message || "Error sending verification email"
        }), {status: 500})
      }

          return new Response(JSON.stringify({
          success: true,
          message: "User registered successfully.Verification code sent to email"
        }), {status: 201})

    } catch (error) {
        console.log("error registering user", error);
        return new Response(JSON.stringify({success: false, message: "Error registering user"}), {status: 500});
    }
}