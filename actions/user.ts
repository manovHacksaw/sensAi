"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { IndustryInsight, User } from "@prisma/client";
import { generateAIInsights } from "./dashboard";

interface UpdateUserData {
  industry: string;
  experience?: string;
  bio?: string;
  skills?: string[];
}

/**
 * Updates the user with the provided data.
 * @param {UpdateUserData} data - The data to update the user with.
 * @returns {Promise<User>} The updated user.
 * @throws {Error} If the user is not authorized or not found.
 */


export async function updateUser(data: UpdateUserData): Promise<User> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const result = await db.$transaction(async (tx) => {
      let industryInsight = await tx.industryInsight.findUnique({
        where: {
          industry: data.industry,
        },
      });

      // If it doesn't exist, create it with default values
      if (!industryInsight) {
        const insights = await generateAIInsights(data.industry)
        industryInsight = await tx.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      // Update the user
      const updatedUser: User = await tx.user.update({
        where: {
          clerkUserId: userId,
        },
        data: {
          industry: data.industry,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills,
          // industryInsightId: industryInsight.id,
          // industryInsight: {
          //   connect: { id: userId }, // Linking to IndustryInsight
          // },
        },
      });

      return { updatedUser, success: true }; // Return updatedUser
    }, { timeout: 10000 });

    return result.updatedUser; // Access the user property of the result
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user"); // Re-throw the error for handling upstream
  }
}

/**
 * Checks if a user is onboarded by checking if they have an industry set.
 * @returns {Promise<{ isOnboarded: boolean }>} An object containing the onboarding status.
 * @throws {Error} If the user is not authorized or not found.
 */
export async function getUserOnboardingStatus(): Promise<{ isOnboarded: boolean }> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
        select: {
            industry: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    console.log(user);

    return { isOnboarded: (user.industry ?? null) !== null };
}