import { z } from "zod";

export const onboardingSchema = z.object({
  industry: z.string({
    required_error: "Please select an industry",
  }),
  subIndustry: z.string({
    required_error: "Please select a specialization",
  }),
  bio: z.string().max(500, { message: "Bio must be less than 500 characters" }).optional(),
  experience: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z.number().int().min(0, { message: "Experience must be a positive number (or 0 if a fresher)" }).max(50, { message: "Experience can't exceed 50 years" })
    ),
    skills: z.string().transform((val) =>
        val
          ? val
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : undefined
      ),
});