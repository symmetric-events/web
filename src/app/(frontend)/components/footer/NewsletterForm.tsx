import React from "react";
import Link from "next/link";

export const NewsletterForm: React.FC = () => {
  return (
    <form className="space-y-2">
      <input
        type="text"
        placeholder="Company"
        className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
      />
      <input
        type="text"
        placeholder="First name"
        className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
      />
      <input
        type="text"
        placeholder="Last name"
        className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
      />
      <input
        type="email"
        placeholder="Email address"
        className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
      />
      <div className="flex items-center">
        <input type="checkbox" id="consent" className="mr-3 h-4 w-4" />
        <label htmlFor="consent" className="text-gray-800">
          I agree with the{" "}
          <Link
            href="/privacy-policy"
            className="underline text-sky-700"
          >
            terms and conditions
          </Link>
        </label>
      </div>
      <button
        type="submit"
        className="mt-4 rounded bg-gray-700 px-8 py-3 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none"
      >
        Sign Up
      </button>
    </form>
  );
};
