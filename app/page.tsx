import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { checkUser } from "@/lib/checkUser"

export default async function Page() {
  const user = await checkUser();
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      {/* Add other sections here */}
    </main>
  )
}

