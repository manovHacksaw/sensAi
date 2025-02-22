import React, { Suspense } from 'react'
import {BarLoader} from "react-spinners"

const DashboardLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className='px-5'>
        
  <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color='gray'/>} > </Suspense>     {children}
    </div>
  )
}

export default DashboardLayout