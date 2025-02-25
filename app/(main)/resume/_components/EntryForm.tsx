"use client"
import { improveWithAI } from '@/actions/resume'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import useFetch from '@/hooks/useFetch'
import { entrySchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'  // Assuming you're using Shadcn toast

const EntryForm = ({ type, entries, onChange }) => {
  const { register, handleSubmit: handleValidation, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    }
  })

 
  const { loading: isImproving, fn: improveWithAIFn, data: improvedContent, error: improveWithAIError } = useFetch(improveWithAI)
  const current = watch("current");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    //TODO implement
  }

  const handleDelete = () => {
        //TODO implement
  }

  const onSubmit = (data) => {
    onChange([...entries, data]);
    reset();
    setIsAdding(false);
  };

  const handleCancel = () => {
    reset();
    setIsAdding(false);
  };

  const handleImproveDescription = async () => {
    const description = watch("description");
    if (!description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a description first"
      })
      return;
    }

    const result = await improveWithAIFn({
      current: description,
      type: type.toLowerCase()
    })

    if(result?.success && result.data)
    {
        setValue("description", result.data);
    } else {
         toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to improve description.  Please try again."
        })
    }

  }

  return (
    <>
      {isAdding && (
        <Card className="w-full mb-4">
          <CardHeader>
            <CardTitle>Add {type}</CardTitle>
            <CardDescription>Enter the details of your {type.toLowerCase()}</CardDescription>
          </CardHeader>

          <CardContent>
            <form id="entry-form" onSubmit={handleValidation(onSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="title">Title</label>
                <input
                  {...register("title")}
                  id="title"
                  className="p-2 border rounded"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="organization">Organization</label>
                <input
                  {...register("organization")}
                  id="organization"
                  className="p-2 border rounded"
                />
                {errors.organization && (
                  <p className="text-red-500 text-sm">{errors.organization.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="startDate">Start Date</label>
                <input
                  {...register("startDate")}
                  type="date"
                  id="startDate"
                  className="p-2 border rounded"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm">{errors.startDate.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  {...register("current")}
                  type="checkbox"
                  id="current"
                />
                <label htmlFor="current">Current {type}</label>
              </div>

              {!current && (
                <div className="grid gap-2">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    {...register("endDate")}
                    type="date"
                    id="endDate"
                    className="p-2 border rounded"
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm">{errors.endDate.message}</p>
                  )}
                </div>
              )}

              <div className="grid gap-2">
                <label htmlFor="description">Description</label>
                <textarea
                  {...register("description")}
                  id="description"
                  rows="4"
                  className="p-2 border rounded"
                ></textarea>
                <Button
                    type='button'
                    onClick={handleImproveDescription}
                    disabled={isImproving}
                >
                    {isImproving ? "Improving..." : "Improve with ai"}
                </Button>
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
                )}
                {improveWithAIError && (
                  <p className="text-red-500 text-sm">Error improving description.</p>
                )}

              </div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" form="entry-form">
              Save
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isAdding && (
        <Button type="button" onClick={() => setIsAdding(true)} className="w-full">
          Add {type}
        </Button>
      )}
    </>
  )
}

export default EntryForm