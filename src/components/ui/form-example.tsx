"use client";

import { useState } from "react";
import { Input, Textarea, Select } from "./index";
import { Mail, Phone, User, Building } from "lucide-react";

// Example component showing how to use the form components
export function FormExample() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
    }
  };

  const countryOptions = [
    { value: "", label: "Select a country", disabled: true },
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "es", label: "Spain" },
    { value: "it", label: "Italy" },
    { value: "nl", label: "Netherlands" },
    { value: "be", label: "Belgium" },
    { value: "at", label: "Austria" },
    { value: "ch", label: "Switzerland" },
  ];

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Form Example</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-lg font-medium text-gray-900">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter your first name"
              required
              autoComplete="given-name"
            />

            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Enter your last name"
              required
              autoComplete="family-name"
            />
          </div>

          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter your email address"
            required
            autoComplete="email"
          />

          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="Enter your phone number"
            required
            autoComplete="tel"
          />
        </div>

        {/* Company Information */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-lg font-medium text-gray-900">
            Company Information
          </h3>

          <Input
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange("company", e.target.value)}
            placeholder="Enter your company name"
            autoComplete="organization"
          />

          <Select value={formData.country} autoComplete="country" />
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-lg font-medium text-gray-900">
            Additional Information
          </h3>

          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Any additional notes or requirements..."
            rows={4}
            helperText="Optional: Add any special requirements or notes"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>
  );
}
