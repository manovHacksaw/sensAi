import { industries } from "@/data/industries";
import OnboardingForm from "./_components/OnboardingForm";
import { redirect } from "next/navigation";
import { getUserOnboardingStatus } from "@/actions/user";

export default async function OnboardingPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect("/dashboard");
  }

  return (
    <main className="flex items-center justify-center min-h-screen py-12">
      <div className="rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Complete Your Profile
        </h1>
        <p className=" mb-4 text-center">
          Tell us a bit about yourself to unlock personalized features.
        </p>
        <OnboardingForm industries={industries} />
      </div>
    </main>
  );
}