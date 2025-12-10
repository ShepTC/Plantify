// Utility for combining Tailwind CSS classes
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

// Create page URL helper
export function createPageUrl(pageName) {
  return `/${pageName}`;
}