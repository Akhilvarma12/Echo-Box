import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

type CredentialsType = {
  identifier: string;
  password: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(
        credentials: CredentialsType | undefined
      ): Promise<NextAuthUser | null> {
        await dbConnect();

        if (!credentials?.identifier || !credentials.password) {
          throw new Error("Missing fields");
        }

        // Fetch password (select:false in schema)
        const user = await UserModel.findOne({
          $or: [
            { email: credentials.identifier },
            { username: credentials.identifier },
          ],
        }).select("+password");

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email before signing in");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }

        // MUST match your extended next-auth types
        return {
          id: user.id.toString(),
          _id: user.id.toString(),
          email: user.email,
          username: user.username,
          isVerified: user.isVerified,
          isAcceptingMessages: user.isAcceptingMessage,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as NextAuthUser & {
          _id: string;
          username: string;
          isVerified: boolean;
          isAcceptingMessages: boolean;
        };

        token.id = u.id;
        token._id = u._id;
        token.username = u.username;
        token.isVerified = u.isVerified;
        token.isAcceptingMessages = u.isAcceptingMessages;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user._id = token._id as string;
        session.user.username = token.username as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
