"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/lib/schema";
import { useRouter } from "next/navigation";


import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import useFetch from '@/hooks/useFetch';
import { updateUser } from '@/actions/user';
import { toast } from 'sonner';

interface Industry {
  id: string;
  name: string;
}

interface OnboardingFormProps {
  industries: Industry[];
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ industries }) => {
  const router = useRouter();

  const {data: updateResult, fn: updateUserFn, loading: updateLoading, error: updateError} = useFetch(updateUser)

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      industry: "",
      subIndustry: "",
      bio: "",
      experience: "",
      skills: [],
    },
  });

  const { handleSubmit, control, formState: { errors }, setError } = form; // Add setError to the destructured form methods.

  const onSubmit = async (values) => {
    console.log("Form values:", values);

    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry}`.toLowerCase().replace(/ /g, "-");

      await updateUserFn({
        ...values, industry: formattedIndustry, experience: Number(values.experience)
      });


    } catch (error: any) {
      console.error("ERROR AT ON SUBMIT FOR ONBOARDING: ", error);
      setError("root", { message: "Failed to update profile. Please try again." }); // Set a form-level error.
    }

  };

  useEffect(() => {
    console.log(updateResult)
    if (updateResult?.success && !updateLoading) {
      toast.success("Profile updated successfully");
      router.push("/dashboard");
      router.refresh();
    }
  }, [updateResult, updateLoading, router]);

  useEffect(() => {
    if (updateError) {
      toast.error("Failed to update profile."); // Generic error message.  You might want to make this more specific.
    }
  }, [updateError]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Industry */}
        <FormField
          control={control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Industry</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry.id} value={industry.id}>
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sub-Industry */}
        <FormField
          control={control}
          name="subIndustry"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Specialization</FormLabel>
              <FormControl>
                <Input placeholder="Enter your specialization" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio */}
        <FormField
          control={control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Write a short bio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Experience */}
        <FormField
          control={control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Experience (Years)</FormLabel>
              <FormControl>
                <Input placeholder="Enter your experience in years" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Skills */}
        <FormField
          control={control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Skills</FormLabel>
              <FormControl>
                <Input placeholder="Enter your skills (comma-separated)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root?.message && (
          <div className="text-red-500 text-sm">{errors.root.message}</div>
        )}

        <Button type="submit" disabled={updateLoading}>
          {updateLoading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default OnboardingForm;
