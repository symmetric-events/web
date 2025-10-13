import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RegisterForm from "./form";


export default async function RegisterPage() {


  return (
    <div className="mt-12 min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="">
          <Link
            href="/events"
            className="text-secondary mb-4 inline-flex items-center hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
