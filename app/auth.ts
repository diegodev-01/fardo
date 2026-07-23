// auth.ts
import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/services/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db();

        const user = await db
          .collection("users")
          .findOne({ email: credentials.email as string });

        if (!user || !user.password) return null;

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );

        if (!isValidPassword) return null;

        return { 
          id: user._id.toString(), 
          email: user.email, 
          name: user.name 
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET, // En v5 la variable estándar es AUTH_SECRET (o NEXTAUTH_SECRET)
});