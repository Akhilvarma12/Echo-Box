import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as User | undefined;

  if (!session || !user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id); // FIX 1: Correct user id

  try {
    const result = await UserModel.aggregate([
      { $match: { _id: userId } }, // FIX 2: Correct field
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      {
        $group: {
          _id: "$_id", // FIX 3: Correct field
          messages: { $push: "$messages" },
        },
      },
    ]);

    if (!result.length) {
      return Response.json(
        { success: false, message: "No messages found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        messages: result[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("An unexpected error occurred", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
