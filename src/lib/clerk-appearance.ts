export const clerkAppearance = {
  variables: {
    colorPrimary: "#14b8a6",
    colorText: "#1a2030",
    colorTextSecondary: "#6b7585",
    colorBackground: "#ffffff",
    colorInputBackground: "#fafbfc",
    colorInputText: "#1a2030",
    fontFamily: "var(--font-outfit), ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-md",
    card: "border border-navy-800 bg-white shadow-sm",
    headerTitle: "text-navy-100 font-semibold",
    headerSubtitle: "text-navy-400",
    socialButtonsBlockButton:
      "border-navy-800 bg-navy-900 text-navy-100 hover:bg-navy-850",
    formButtonPrimary:
      "bg-gold-500 hover:bg-gold-600 text-white font-semibold shadow-none",
    formFieldInput:
      "border-navy-800 bg-navy-900 text-navy-100 placeholder:text-navy-500",
    formFieldLabel: "text-navy-300",
    footerActionLink: "text-gold-600 hover:text-gold-700 font-medium",
    identityPreviewText: "text-navy-100",
    identityPreviewEditButton: "text-gold-600",
  },
} as const;
