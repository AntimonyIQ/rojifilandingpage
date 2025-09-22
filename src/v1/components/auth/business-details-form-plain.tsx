import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { toast } from "sonner";
import Defaults from "@/v1/defaults/defaults";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/v1/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/v1/components/ui/command";
import { Calendar } from "@/v1/components/ui/calendar";
import { ChevronsUpDownIcon, CheckIcon, CalendarIcon } from "lucide-react";
import { cn } from "@/v1/lib/utils";
import countries from "../../data/country_state.json";
import { IResponse, ISender } from "@/v1/interface/interface";
import { Checkbox } from "../ui/checkbox";
import { session, SessionData } from "@/v1/session/session";
import { Status } from "@/v1/enums/enums";

const companyActivities = [
  { value: "agriculture_forestry_and_fishing", label: "Agriculture, Forestry and Fishing" },
  { value: "mining_and_quarrying", label: "Mining and Quarrying" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "electricity_gas_steam", label: "Electricity, Gas, Steam and Air Conditioning Supply" },
  { value: "water_supply", label: "Water Supply; Sewerage, Waste Management" },
  { value: "construction", label: "Construction" },
  { value: "wholesale_retail_trade", label: "Wholesale and Retail Trade" },
  { value: "transportation_storage", label: "Transportation and Storage" },
  { value: "accommodation_food", label: "Accommodation and Food Service Activities" },
  { value: "information_communication", label: "Information and Communication" },
  { value: "financial_insurance", label: "Financial and Insurance Activities" },
  { value: "real_estate", label: "Real Estate Activities" },
  { value: "professional_scientific", label: "Professional, Scientific and Technical Activities" },
  { value: "administrative_support", label: "Administrative and Support Service Activities" },
  { value: "public_administration", label: "Public Administration and Defence" },
  { value: "education", label: "Education" },
  { value: "health_social_work", label: "Human Health and Social Work Activities" },
  { value: "arts_entertainment", label: "Arts, Entertainment and Recreation" },
  { value: "other_service_activities", label: "Other Service Activities" },
];

const legalForms = [
  { value: "SARL", label: "SARL (Limited Liability Company)" },
  { value: "SA", label: "SA (Public Limited Company)" },
  { value: "SAS", label: "SAS (Simplified Joint Stock Company)" },
  { value: "SASU", label: "SASU (Single Shareholder SAS)" },
  { value: "EURL", label: "EURL (Single Member SARL)" },
  { value: "SNC", label: "SNC (General Partnership)" },
  { value: "LLC", label: "LLC (Limited Liability Company)" },
  { value: "Corporation", label: "Corporation" },
  { value: "Partnership", label: "Partnership, Business Name" },
  { value: "Sole_Proprietorship", label: "Sole Proprietorship, Business Name" },
  { value: "LTD", label: "LTD (Private Limited Company)" },
  { value: "PLC", label: "PLC (Public Limited Company)" },
  { value: "OTHERS", label: "Others" },
];

interface BusinessDetailsStageProps {
  sender: Partial<ISender>;
}

export default function BusinessDetailsFormPlain({ sender }: BusinessDetailsStageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  // refs and widths for popovers so we can match PopoverContent width to trigger
  const legalTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [legalTriggerWidth, setLegalTriggerWidth] = useState<number | null>(null);
  const activityTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [activityTriggerWidth, setActivityTriggerWidth] = useState<number | null>(null);

  const [countryPopover, setCountryPopover] = useState(false);
  const [actualCountryPopover, setActualCountryPopover] = useState(false);
  const [activityPopover, setActivityPopover] = useState(false);
  const [countriesOfOperationsPopover, setcountriesOfOperationsPopover] = useState(false);
  const [legalFormPopover, setLegalFormPopover] = useState(false);
  const [registrationDatePopover, setRegistrationDatePopover] = useState(false);

  const sd: SessionData = session.getUserData();

  const [formData, setFormData] = useState({
    name: "",
    country: "Nigeria",
    registrationNumber: "",
    website: "",
    legalForm: "",
    companyActivity: "",
    status: "",
    registrationDate: undefined as Date | undefined,
    onboardingDate: undefined as Date | undefined,
    tradingName: "",
    countriesOfOperations: [] as string[],
    streetAddress: "",
    streetAddress2: "",
    city: "",
    state: "",
    region: "",
    postalCode: "",
    // Whether actual operations address matches registered address
    actualOperationsAndRegisteredAddressesMatch: true,
    // Actual operations address (required if match === false)
    actualOperationsAddress: {
      streetAddress: "",
      streetAddress2: "",
      city: "",
      state: "",
      region: "",
      postalCode: "",
      country: "",
    },
  });

  useEffect(() => {
    setFormData({
      ...formData,
      name: sender?.businessName || "",
      country: sender?.country || "Nigeria",
      registrationNumber: sender?.businessRegistrationNumber || "",
      website: sender?.website || "",
      legalForm: sender?.legalForm || "",
      companyActivity: sender?.companyActivity || "",
      countriesOfOperations: sender?.countriesOfOperations || [],
      registrationDate: sender?.dateOfIncorporation
        ? new Date(sender.dateOfIncorporation)
        : undefined,
      tradingName: sender?.tradingName || "",
      streetAddress: sender?.streetAddress || "",
      streetAddress2: sender?.streetAddress2 || "",
      city: sender?.city || "",
      state: sender?.state || "",
      region: sender?.region || "",
      postalCode: sender?.postalCode || "",
      actualOperationsAndRegisteredAddressesMatch:
        sender?.actualOperationsAndRegisteredAddressesMatch ?? true,
      actualOperationsAddress: sender?.actualOperationsAddress
        ? {
          streetAddress: sender.actualOperationsAddress.streetAddress || "",
          streetAddress2: sender.actualOperationsAddress.streetAddress2 || "",
          city: sender.actualOperationsAddress.city || "",
          state: sender.actualOperationsAddress.state || "",
          region: sender.actualOperationsAddress.region || "",
          postalCode: sender.actualOperationsAddress.postalCode || "",
          country: sender.actualOperationsAddress.country || "",
        }
        : {
          streetAddress: "",
          streetAddress2: "",
          city: "",
          state: "",
          region: "",
          postalCode: "",
          country: "",
        },
    });
  }, [sender]);

  const isFormValid = () => {
    return (
      formData.name?.trim() !== "" &&
      formData.country?.trim() !== "" &&
      formData.registrationNumber?.trim() !== "" &&
      formData.legalForm?.trim() !== "" &&
      formData.companyActivity?.trim() !== "" &&
      formData.countriesOfOperations.length > 0 &&
      formData.streetAddress?.trim() !== "" &&
      formData.city?.trim() !== "" &&
      formData.state?.trim() !== "" &&
      formData.postalCode?.trim() !== "" &&
      // If actual operations address does not match, require its fields
      (formData.actualOperationsAndRegisteredAddressesMatch ||
        (formData.actualOperationsAddress.streetAddress?.trim() !== "" &&
          formData.actualOperationsAddress.city?.trim() !== "" &&
          formData.actualOperationsAddress.state?.trim() !== "" &&
          formData.actualOperationsAddress.postalCode?.trim() !== "" &&
          formData.actualOperationsAddress.country?.trim() !== "")) &&
      formData.registrationDate !== undefined
    );
  };

  const sanitizeValue = (field: string, value: string | boolean | Date | string[]) => {
    if (typeof value !== "string") return value;
    switch (field) {
      case "name":
      case "tradingName":
        return value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "");
      case "registrationNumber":
        return value.replace(/[^a-zA-Z0-9\-\/_\s]/g, "").replace(/\s+/g, " ");
      case "website":
        return value.replace(/[^a-zA-Z0-9\.\-_/:?=&%#]/g, "").toLowerCase();
      case "streetAddress":
      case "streetAddress2":
      case "city":
      case "state":
      case "region":
      case "country":
        return value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "");
      case "postalCode":
        return value.replace(/[^a-zA-Z0-9]/g, "");
      default:
        return value;
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const sanitizedValue = sanitizeValue(field, value);
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
    setError(null);
  };

  const handleNestedInputChange = (
    parent: string,
    field: string,
    value: string | boolean | Date | string[]
  ) => {
    const sanitizedValue = sanitizeValue(field, value);
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: sanitizedValue,
      },
    }));
    setError(null);
  };

  const handlecountriesOfOperationsChange = (countryName: string) => {
    setFormData((prev) => {
      const currentCountries = prev.countriesOfOperations;
      const isSelected = currentCountries.includes(countryName);

      if (isSelected) {
        // Remove country
        return {
          ...prev,
          countriesOfOperations: currentCountries.filter((c) => c !== countryName),
        };
      } else {
        // Add country
        return {
          ...prev,
          countriesOfOperations: [...currentCountries, countryName],
        };
      }
    });
    setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError(null);

    if (!isFormValid()) {
      setError("Please fill in all required fields");
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return;
    }

    setLoading(true);
    try {
      const businessData = {
        mainCompany: {
          name: formData.name,
          country: formData.country,
          registrationNumber: formData.registrationNumber,
          website: formData.website,
          legalForm: formData.legalForm,
          companyActivity: formData.companyActivity,
          countriesOfOperations: formData.countriesOfOperations,
          registrationDate: formData.registrationDate
            ? format(formData.registrationDate, "yyyy-MM-dd")
            : "",
          onboardingDate: format(new Date(), "yyyy-MM-dd"),
          registeredAddress: {
            streetAddress: formData.streetAddress,
            streetAddress2: formData.streetAddress2,
            city: formData.city,
            state: formData.state,
            region: formData.region,
            country: formData.country,
            postalCode: formData.postalCode,
          },
          actualOperationsAndRegisteredAddressesMatch:
            formData.actualOperationsAndRegisteredAddressesMatch,
          actualOperationsAddress: formData.actualOperationsAndRegisteredAddressesMatch
            ? undefined
            : {
                streetAddress: formData.actualOperationsAddress.streetAddress,
                streetAddress2: formData.actualOperationsAddress.streetAddress2,
                city: formData.actualOperationsAddress.city,
                state: formData.actualOperationsAddress.state,
                region: formData.actualOperationsAddress.region,
                country: formData.actualOperationsAddress.country,
                postalCode: formData.actualOperationsAddress.postalCode,
              },
        },
        tradingName: formData.tradingName,
      };

      const res = await fetch(`${Defaults.API_BASE_URL}/auth/business`, {
        method: "POST",
        headers: {
          ...Defaults.HEADERS,
          "Content-Type": "application/json",
          "x-rojifi-handshake": sd.client.publicKey,
          "x-rojifi-deviceid": sd.deviceid,
        },
        body: JSON.stringify({ rojifiId: sd.user.rojifiId, businessData, action: "edit" }),
      });

      const data = await res.json();
      if (data?.status === "ERROR") throw new Error(data.message || data.error || "Save failed");
      toast.success("Business details saved successfully!");

      const userres = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
        method: "GET",
        headers: {
          ...Defaults.HEADERS,
          "x-rojifi-handshake": sd.client.publicKey,
          "x-rojifi-deviceid": sd.deviceid,
          Authorization: `Bearer ${sd.authorization}`,
        },
      });

      const userdata: IResponse = await userres.json();
      if (userdata.status === Status.ERROR) throw new Error(userdata.message || userdata.error);
      if (userdata.status === Status.SUCCESS) {
        if (!userdata.handshake) throw new Error("Invalid response");
        const parseData = Defaults.PARSE_DATA(
          userdata.data,
          sd.client.privateKey,
          userdata.handshake
        );
        session.updateSession({
          ...sd,
          sender: parseData.sender as ISender,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to save business details");
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div
          ref={errorRef}
          className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-md border border-red-200"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 mb-8 w-full">
        <div>
          <Label>
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>Trading Name</Label>
          <Input
            value={formData.tradingName}
            onChange={(e) => handleInputChange("tradingName", e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>
            Company Registration Number <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.registrationNumber}
            onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>
            Website <span className="text-gray-400">(Optional)</span>
          </Label>
          <Input
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            className="h-12"
          />
        </div>

        {/* Legal Form Selection */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Legal Form <span className="text-red-500">*</span>
          </Label>
          <Popover
            open={legalFormPopover}
            onOpenChange={(open) => {
              setLegalFormPopover(open);
              // measure trigger width when opening so PopoverContent can match
              if (open && legalTriggerRef.current) {
                const rect = legalTriggerRef.current.getBoundingClientRect();
                setLegalTriggerWidth(Math.round(rect.width));
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                ref={legalTriggerRef}
                variant="outline"
                role="combobox"
                className="w-full h-12 justify-between"
                disabled={loading}
              >
                {formData.legalForm
                  ? legalForms.find((form) => form.value === formData.legalForm)?.label
                  : "Select legal form..."}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              style={legalTriggerWidth ? { width: `${legalTriggerWidth}px` } : undefined}
            >
              <Command>
                <CommandInput placeholder="Search legal form..." />
                <CommandList>
                  <CommandEmpty>No legal form found.</CommandEmpty>
                  <CommandGroup>
                    {legalForms
                      .filter((form) =>
                        ["Partnership", "Sole_Proprietorship", "LTD", "OTHERS"].includes(form.value)
                      )
                      .map((form) => (
                        <CommandItem
                          key={form.value}
                          value={form.label}
                          onSelect={() => {
                            handleInputChange("legalForm", form.value);
                            setLegalFormPopover(false);
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.legalForm === form.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {form.label}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Company Activity Selection */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Company Activity <span className="text-red-500">*</span>
          </Label>
          <Popover
            open={activityPopover}
            onOpenChange={(open) => {
              setActivityPopover(open);
              if (open && activityTriggerRef.current) {
                // prefer offsetWidth which matches the rendered button width
                setActivityTriggerWidth(activityTriggerRef.current.offsetWidth);
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                ref={activityTriggerRef}
                variant="outline"
                role="combobox"
                className="w-full h-12 justify-between"
                disabled={loading}
              >
                {formData.companyActivity
                  ? companyActivities.find(
                      (activity) => activity.value === formData.companyActivity
                    )?.label
                  : "Select company activity..."}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              style={activityTriggerWidth ? { width: `${activityTriggerWidth}px` } : undefined}
            >
              <Command>
                <CommandInput placeholder="Search activity..." />
                <CommandList>
                  <CommandEmpty>No activity found.</CommandEmpty>
                  <CommandGroup>
                    {companyActivities.map((activity) => (
                      <CommandItem
                        key={activity.value}
                        value={activity.label}
                        onSelect={() => {
                          handleInputChange("companyActivity", activity.value);
                          setActivityPopover(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.companyActivity === activity.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {activity.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Countries of Operation Selection */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Countries of Operation <span className="text-red-500">*</span>
          </Label>
          <Popover
            open={countriesOfOperationsPopover}
            onOpenChange={setcountriesOfOperationsPopover}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full h-12 justify-between"
                disabled={loading}
              >
                <div className="flex items-center gap-2 flex-1 text-left">
                  {formData.countriesOfOperations.length === 0 ? (
                    "Select countries of operation..."
                  ) : formData.countriesOfOperations.length === 1 ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://flagcdn.com/w320/${countries
                          .find((country) => country.name === formData.countriesOfOperations[0])
                          ?.iso2?.toLowerCase()}.png`}
                        alt=""
                        width={18}
                        height={18}
                      />
                      {formData.countriesOfOperations[0]}
                    </div>
                  ) : (
                    `${formData.countriesOfOperations.length} countries selected`
                  )}
                </div>
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search countries..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country, index) => (
                      <CommandItem
                        key={`operation-${country.name}-${index}`}
                        value={country.name}
                        onSelect={() => {
                          handlecountriesOfOperationsChange(country.name);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.countriesOfOperations.includes(country.name)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <img
                          src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                          alt=""
                          width={18}
                          height={18}
                        />
                        {country.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {formData.countriesOfOperations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {formData.countriesOfOperations.map((countryName) => (
                <div
                  key={countryName}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs"
                >
                  <img
                    src={`https://flagcdn.com/w320/${countries
                      .find((country) => country.name === countryName)
                      ?.iso2?.toLowerCase()}.png`}
                    alt=""
                    width={12}
                    height={12}
                  />
                  {countryName}
                  <button
                    type="button"
                    onClick={() => handlecountriesOfOperationsChange(countryName)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>
            Company Registration Date <span className="text-red-500">*</span>
          </Label>
          <Popover open={registrationDatePopover} onOpenChange={setRegistrationDatePopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start text-left font-normal"
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.registrationDate
                  ? format(formData.registrationDate, "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                selected={formData.registrationDate}
                onSelect={(date) => {
                  handleInputChange("registrationDate", date!);
                  setRegistrationDatePopover(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.streetAddress}
            onChange={(e) => handleInputChange("streetAddress", e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>
            Street Address 2 <span className="text-gray-400">(Optional)</span>
          </Label>
          <Input
            value={formData.streetAddress2}
            onChange={(e) => handleInputChange("streetAddress2", e.target.value)}
            className="h-12"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="h-12"
            />
          </div>

          <div>
            <Label>
              State/Province <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>
              Region <span className="text-gray-400">(Optional)</span>
            </Label>
            <Input
              value={formData.region}
              onChange={(e) => handleInputChange("region", e.target.value)}
              className="h-12"
            />
          </div>

          <div>
            <Label>
              Postal Code <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.postalCode}
              onChange={(e) => handleInputChange("postalCode", e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div>
          <Label>
            Country <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Popover open={countryPopover} onOpenChange={() => setCountryPopover(!countryPopover)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  size="md"
                  aria-expanded={countryPopover}
                  className="w-full h-12 justify-between"
                  disabled={loading}
                >
                  <div className="flex flex-row items-center gap-2">
                    <img
                      src={`https://flagcdn.com/w320/${countries
                        .find((country) => country.name === formData.country)
                        ?.iso2.toLowerCase()}.png`}
                      alt=""
                      width={18}
                      height={18}
                    />
                    {formData.country
                      ? countries.find((country) => country.name === formData.country)?.name
                      : "Select country..."}
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countries.map((country, index) => (
                        <CommandItem
                          key={`${country.name}-${index}`}
                          value={country.name}
                          onSelect={(currentValue) => {
                            handleInputChange("country", currentValue);
                            setCountryPopover(false);
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.country === country.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <img
                            src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                            alt=""
                            width={18}
                            height={18}
                          />
                          {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Actual operations address match checkbox */}
        <div className="pt-2 px-0 md:px-0 max-w-md mx-auto">
          <label className="flex items-center space-x-3 text-sm text-gray-700">
            <Checkbox
              checked={formData.actualOperationsAndRegisteredAddressesMatch}
              onCheckedChange={(checked) =>
                handleInputChange("actualOperationsAndRegisteredAddressesMatch", !!checked)
              }
              className="h-4 w-4"
              id="actualOperationsAndRegisteredAddressesMatch"
            />
            <span>Actual operations address matches registered address</span>
          </label>
        </div>

        {/* Conditional actual operations address fields */}
        {!formData.actualOperationsAndRegisteredAddressesMatch && (
          <div className="space-y-4 px-0 md:px-0 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900">Actual Operations Address</h3>

            <div>
              <Label
                htmlFor="actual_streetAddress"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="actual_streetAddress"
                name="actual_streetAddress"
                type="text"
                className="h-12"
                placeholder="Enter street address"
                value={formData.actualOperationsAddress.streetAddress}
                disabled={loading}
                onChange={(e) =>
                  handleNestedInputChange(
                    "actualOperationsAddress",
                    "streetAddress",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <Label
                htmlFor="actual_streetAddress2"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Street Address 2 <span className="text-gray-400">(Optional)</span>
              </Label>
              <Input
                id="actual_streetAddress2"
                name="actual_streetAddress2"
                type="text"
                className="h-12"
                placeholder="Apartment, suite, unit, etc."
                value={formData.actualOperationsAddress.streetAddress2}
                disabled={loading}
                onChange={(e) =>
                  handleNestedInputChange(
                    "actualOperationsAddress",
                    "streetAddress2",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="actual_city"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="actual_city"
                  name="actual_city"
                  type="text"
                  className="h-12"
                  placeholder="Enter city"
                  value={formData.actualOperationsAddress.city}
                  disabled={loading}
                  onChange={(e) =>
                    handleNestedInputChange("actualOperationsAddress", "city", e.target.value)
                  }
                />
              </div>

              <div>
                <Label
                  htmlFor="actual_state"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  State/Province <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="actual_state"
                  name="actual_state"
                  type="text"
                  className="h-12"
                  placeholder="Enter state"
                  value={formData.actualOperationsAddress.state}
                  disabled={loading}
                  onChange={(e) =>
                    handleNestedInputChange("actualOperationsAddress", "state", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="actual_region"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Region <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="actual_region"
                  name="actual_region"
                  type="text"
                  className="h-12"
                  placeholder="Enter region"
                  value={formData.actualOperationsAddress.region}
                  disabled={loading}
                  onChange={(e) =>
                    handleNestedInputChange("actualOperationsAddress", "region", e.target.value)
                  }
                />
              </div>

              <div>
                <Label
                  htmlFor="actual_postalCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Postal Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="actual_postalCode"
                  name="actual_postalCode"
                  type="text"
                  className="h-12"
                  placeholder="Enter postal code"
                  value={formData.actualOperationsAddress.postalCode}
                  disabled={loading}
                  onChange={(e) =>
                    handleNestedInputChange("actualOperationsAddress", "postalCode", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Popover
                  open={actualCountryPopover}
                  onOpenChange={() => setActualCountryPopover(!actualCountryPopover)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      size="md"
                      aria-expanded={countryPopover}
                      className="w-full h-12 justify-between"
                      disabled={loading}
                    >
                      <div className="flex flex-row items-center gap-2">
                        <img
                          src={`https://flagcdn.com/w320/${countries
                            .find(
                              (country) => country.name === formData.actualOperationsAddress.country
                            )
                            ?.iso2.toLowerCase()}.png`}
                          alt=""
                          width={18}
                          height={18}
                        />
                        {formData.actualOperationsAddress.country
                          ? countries.find(
                              (country) => country.name === formData.actualOperationsAddress.country
                            )?.name
                          : "Select country..."}
                      </div>
                      <ChevronsUpDownIcon className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {countries.map((country, index) => (
                            <CommandItem
                              key={`actual-${country.name}-${index}`}
                              value={country.name}
                              onSelect={(currentValue) => {
                                handleNestedInputChange(
                                  "actualOperationsAddress",
                                  "country",
                                  currentValue
                                );
                                setActualCountryPopover(false);
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.actualOperationsAddress.country === country.name
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <img
                                src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                alt=""
                                width={18}
                                height={18}
                              />
                              {country.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 md:col-span-2">
          <Button
            type="submit"
            className="w-full h-12 bg-primary text-white hover:bg-primary/90 md:col-span-2"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
