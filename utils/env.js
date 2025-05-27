export const isSelfTherapist = typeof window !== "undefined" &&
  window.location.hostname.includes("selftherapist");
