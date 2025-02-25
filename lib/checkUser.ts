"use server"
import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {  // Remove email parameter; currentUser() provides it
  try {
    const user = await currentUser();

    if (!user) {
      console.log("No user found in Clerk session."); // Log this
      return null; // Crucial to return null if no user is authenticated
    }

    const clerkUserId = user.id;
    const email = user.emailAddresses[0]?.emailAddress;  // Safe access to email
    const name = user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.emailAddresses[0]?.emailAddress; // Get User name

    if (!email) {
      console.error("User has no email address in Clerk."); // Log this too
      return null;
    }

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: clerkUserId,
      },
    });

    if (loggedInUser) {
      console.log(`User ${loggedInUser.email} already exists.`); //Optional logging, but useful
      return loggedInUser;
    }

    const newUser = await db.user.create({
      data: {
        name: name || "User", // Provide a default name if name is null
        email: email,
        clerkUserId: clerkUserId,
        imageUrl: user.imageUrl,

      },
    });

    console.log(`New user created: ${newUser.email}`); // Log the creation
    return newUser;

  } catch (error) {
    console.error("Error in checkUser:", error); // Log the *full* error
    return null; // Return null to signal failure
  }
};