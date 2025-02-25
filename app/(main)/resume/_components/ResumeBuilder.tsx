"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Use full path
import { Textarea } from '@/components/ui/textarea';
import { resumeSchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, Save } from 'lucide-react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import EntryForm from './EntryForm';

interface ResumeBuilderProps {
    initialContent: string;
}

const onSubmit = async() =>{

}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ initialContent }) => {
    const [activeTab, setActiveTab] = useState("edit");
    const [resumeContent, setResumeContent] = useState(initialContent);  // State for content

    const { control, register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(resumeSchema),
        defaultValues: {
            contactInfo: {
                email: "",
                mobile: "",
                linkedin: "",
                x: ""
            },
            summary: "",
            skills: "",
            experience: [],
            education: [],
            projects: []
        }
    });

    const handleSave = () => {
        // Implement your save logic here (e.g., API call)
        console.log("Saving resume content:", resumeContent);
        alert("Resume saved (check console)"); // Replace with actual save functionality
    };

    const handleDownload = () => {
        // Implement your PDF download logic here
        console.log("Downloading resume as PDF");
        alert("Downloading resume as PDF (not implemented)"); // Replace with actual download functionality
    };

    const onSubmit = (data: z.infer<typeof resumeSchema>) => {
        console.log("Form Data:", data); // Replace with your form submission logic
        // You can now send this data to your backend API for saving/processing
    };

    return (
        <div>
            <h1>Resume Builder</h1>

            <div>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download as Pdf
                </Button>

                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl">
                    <TabsList className="mt-4">
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className="outline-none">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <Input
                                            type='email'
                                            placeholder='example@gmail.com'
                                            {...register("contactInfo.email")}
                                            className={`mt-1 ${errors.contactInfo?.email ? 'border-red-500' : ''}`}
                                        />
                                        {errors.contactInfo?.email && <p className="text-red-500 text-sm">{errors.contactInfo.email.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <Input
                                            type='tel'
                                            placeholder='+91 98745 12345'
                                            {...register("contactInfo.mobile")}
                                            className={`mt-1 ${errors.contactInfo?.mobile ? 'border-red-500' : ''}`}
                                        />
                                        {errors.contactInfo?.mobile && <p className="text-red-500 text-sm">{errors.contactInfo.mobile.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">LinkedIn Profile</label>
                                        <Input
                                            type='url'
                                            placeholder='Enter your LinkedIn Url (https://www.linkedin.com/in/example-linkedin-profile/)'
                                            {...register("contactInfo.linkedin")}
                                            className={`mt-1 ${errors.contactInfo?.linkedin ? 'border-red-500' : ''}`}
                                        />
                                        {errors.contactInfo?.linkedin && <p className="text-red-500 text-sm">{errors.contactInfo.linkedin.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">X (Formerly Twitter) account</label>
                                        <Input
                                            type='url'
                                            placeholder='Enter your X account Url (https://x.com/exampleusername)'
                                            {...register("contactInfo.x")}
                                            className={`mt-1 ${errors.contactInfo?.x ? 'border-red-500' : ''}`}
                                        />
                                        {errors.contactInfo?.x && <p className="text-red-500 text-sm">{errors.contactInfo.x.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold">Professional Summary</h3>
                                <Controller
                                    name='summary'
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            className={`h-32 w-full ${errors.summary ? 'border-red-500' : ''}`}
                                            placeholder='Write a compelling professional summary....'
                                        />
                                    )}
                                />
                                {errors.summary && <p className="text-red-500 text-sm">{errors.summary.message}</p>}
                            </div>

                            <div>
                                <h3>Education</h3>
                                <Controller name='education'
                                control={control}
                                render={({field})=>(
                                    <EntryForm type={"Education"} entries={field.value} onChange={field.onChange}  />
                                )}
                                />
                            </div>

                            <div>
                                <h3>Projects</h3>
                                <Controller name='projects'
                                control={control}
                                render={({field})=>(
                                    <EntryForm type={"Project"} entries={field.value} onChange={field.onChange}  />
                                )}
                                />
                            </div>

                            <div>
                                <h3>Work Experience</h3>
                                <Controller name='experience'
                                control={control}
                                render={({field})=>(
                                    <EntryForm type={"Project"} entries={field.value} onChange={field.onChange}  />
                                )}
                                />
                            </div>

                            <Button type="submit">Submit</Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="preview" className="outline-none">
                        <pre className="whitespace-pre-wrap p-4 border rounded-md bg-gray-100">
                            {resumeContent}
                        </pre>
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    );
};

export default ResumeBuilder;