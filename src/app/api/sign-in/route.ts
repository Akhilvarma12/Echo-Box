import dbConnect from "@/lib/dbConnect";

export const POST = async (request: Request) => {
  await dbConnect();
  return new Response(JSON.stringify({ success: true, message: "Sign-in route" }), { status: 200 });
}          