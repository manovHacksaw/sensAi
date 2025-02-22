import { getUserOnboardingStatus } from '@/actions/user'
import { redirect } from 'next/navigation';
import React from 'react'
import DashboardView from './_components/DashboardView';
import { getIndustryInsights } from '@/actions/dashboard';

const DashboardPage = async() => {

  const {isOnboarded} = await getUserOnboardingStatus();
  const insights = await getIndustryInsights();


  if(!isOnboarded){
    redirect("/onboarding")
  }

  return (
    <div>
      <DashboardView insights={insights}/>
    </div>
  )
}

export default DashboardPage