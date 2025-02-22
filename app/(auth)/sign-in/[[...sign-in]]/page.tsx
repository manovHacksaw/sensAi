import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
   <div className="flex items-center justify-center mt-50"><SignIn appearance={{
    elements: {
      formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white rounded-md",
      formFieldInput: "border-gray-300 focus:ring-green-500",
      footerActionLink: "text-green-600 hover:text-green-800",
    }
  }}/> </div>
        
     
  );
}
