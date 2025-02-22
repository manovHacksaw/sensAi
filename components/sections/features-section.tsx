"use client"

import { motion } from "framer-motion"
import { Award, BarChart, Building, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: <FileText className="w-12 h-12 mb-4 text-primary" />,
    title: "AI-Powered Resume Builder",
    description:
      "Create professional, ATS-friendly resumes tailored to your target roles with our advanced AI technology.",
  },
  {
    icon: <Building className="w-12 h-12 mb-4 text-primary" />,
    title: "Industry Insights",
    description: "Get detailed analysis of industry trends, salary benchmarks, and growth opportunities in your field.",
  },
  {
    icon: <Award className="w-12 h-12 mb-4 text-primary" />,
    title: "Career Path Planning",
    description: "Map out your career trajectory with personalized recommendations and skill development plans.",
  },
  {
    icon: <BarChart className="w-12 h-12 mb-4 text-primary" />,
    title: "Performance Analytics",
    description: "Track your career growth and get data-driven suggestions for improvement.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16"
        >
          Powerful Features for Your Career Growth
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex">
                <CardContent className="text-center pt-6 flex flex-col items-center justify-center">
                  {feature.icon}
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

