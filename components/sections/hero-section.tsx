"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[90vh] flex items-center bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/5 dark:to-primary/0">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">Your AI Career Coach for Professional Success</h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Transform your career journey with personalized guidance, powered by advanced AI technology.
          </p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Button size="lg" className="mr-4">
              Get Started <ArrowRight className="ml-2" />
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

