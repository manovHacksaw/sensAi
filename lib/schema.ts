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

export const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),

})

export const entrySchema = z.object({
  title: z.string().min(5, "Title is required"),
  organization: z.string().min(5, "Organization is required"),
  startDate: z.string().min(5, "Start Date is required"),
  endDate: z.string().optional(),
  description: z.string().min(5, "Description is required"),
  current: z.boolean().default(false)

}).refine((data)=>{
  if(!data.current && !data.endDate){
    return false;
  }

  return true
}, {
  message: "End Date is required unless you are working here",
  path: ["endDate"]
})

export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(20, "Your professional summary should be of atleast 20 characters"),
  skills: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(entrySchema),
})