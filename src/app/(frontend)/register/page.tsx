import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import RegisterForm from "./form";


export default async function RegisterPage() {


  return (
    <div className="mt-12 min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <Suspense fallback={<div>Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
