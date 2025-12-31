"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/v1/components/ui/select";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingSidebar } from "./onboarding-sidebar";
import NigeriaStatesCities from "@/v1/lib/data";

interface OnboardingAddressProps {
  data: any;
  personalInfo: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function OnboardingAddress({
  data,
  personalInfo,
  onUpdate,
  onNext,
  onPrev,
}: OnboardingAddressProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    if (field === "state") {
      onUpdate({ [field]: value, city: "" });
    } else {
      onUpdate({ [field]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // console.log(personalInfo)
      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  // Get available cities based on selected state
  const availableCities = data.state
    ? NigeriaStatesCities[data.state] || []
    : [];

  return (
    <div className="max-w-6xl mx-auto">
      <OnboardingProgress currentStep={2} />

      <div className="grid lg:grid-cols-[300px,1fr] gap-8 mt-8">
        <OnboardingSidebar currentStep={2} />

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Address</h2>
            <p className="text-gray-600">
              This should match your proof of address document
            </p>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="address_line_one"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Address line 1 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address_line_one"
                value={data.address_line_one}
                onChange={(e) =>
                  handleInputChange("address_line_one", e.target.value)
                }
                placeholder="No 24, Nnebisi Road"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="address_line_two"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Address line 2
              </Label>
              <Input
                id="address_line_two"
                value={data.address_line_two}
                onChange={(e) =>
                  handleInputChange("address_line_two", e.target.value)
                }
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div>
              <Label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Country <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.country}
                onValueChange={(value) => handleInputChange("country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nigeria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  State <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.state}
                  onValueChange={(value) => handleInputChange("state", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(NigeriaStatesCities).map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  City <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.city}
                  onValueChange={(value) => handleInputChange("city", value)}
                  disabled={!data.state}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        data.state ? "Select a city" : "Select a state first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label
                htmlFor="zip_code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Zip/Postal code
              </Label>
              <Input
                id="zip_code"
                value={data.zip_code}
                onChange={(e) => handleInputChange("zip_code", e.target.value)}
                placeholder="31240"
              />
            </div>

            <div className="pt-6 flex justify-between">
              <Button
                type="button"
                onClick={onPrev}
                variant="outline"
                className="h-12 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="h-12 px-6 bg-primary hover:bg-primary/90 text-white"
                disabled={
                  loading ||
                  !data.address_line_one ||
                  !data.state ||
                  !data.city ||
                  !data.country
                }
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
