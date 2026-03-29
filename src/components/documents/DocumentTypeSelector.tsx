"use client";

// 1. Define the props the component expects to receive
export interface DocumentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DOCUMENT_TYPES = [
  "Residential Lease Agreement",
  "Sublease Agreement",
  "Mortgage Agreement",
  "HOA (Homeowners Association) CC&Rs",
  "Employment Contract / Offer Letter",
  "Non-Disclosure Agreement (NDA)",
  "Non-Compete / Non-Solicitation Agreement",
  "Severance / Separation Agreement",
  "Terms of Service (ToS) / Terms of Use",
  "End-User License Agreement (EULA)",
  "Privacy Policy",
  "Employee Handbook / Corporate Code of Conduct",
  "Independent Contractor Agreement",
  "Statement of Work (SOW)",
  "IP Assignment Agreement",
  "Loan Agreement / Promissory Note",
  "Credit Card Cardholder Agreement",
  "Bill of Sale",
  "Prenuptial / Postnuptial Agreement",
  "Last Will and Testament",
  "Power of Attorney",
  "Other"
];

// 2. Accept the props in the component signature
export function DocumentTypeSelector({ value, onChange }: DocumentTypeSelectorProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label 
        htmlFor="document-type" 
        className="text-sm font-semibold text-navy-200"
      >
        Document Type
      </label>
      
      <div className="relative">
        <select
          id="document-type"
          value={value} // 3. Use the prop value
          onChange={(e) => onChange(e.target.value)} // 4. Call the prop function
          className="w-full appearance-none rounded-lg border border-navy-700 bg-navy-900 px-4 py-3 text-sm text-navy-100 outline-none transition-colors focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
        >
          <option value="" disabled className="text-navy-500">
            Select the type of document...
          </option>
          
          {DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type} className="bg-navy-900 text-navy-100">
              {type}
            </option>
          ))}
        </select>
        
        {/* Chevron Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-navy-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <p className="text-xs text-navy-400">
        Selecting the correct document type helps our AI prioritize the most relevant risks.
      </p>
    </div>
  );
}