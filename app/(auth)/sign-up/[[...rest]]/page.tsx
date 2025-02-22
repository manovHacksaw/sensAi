import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-800 dark:text-white">
          Create an Account
        </h1>
        <SignUp appearance={{
          elements: {
            formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white rounded-md",
            formFieldInput: "border-gray-300 focus:ring-purple-500",
            footerActionLink: "text-purple-600 hover:text-purple-800",
          }
        }}/>
      </div>
    </div>
  );
}
