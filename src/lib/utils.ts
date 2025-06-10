import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Save generated HTML code to a file and download it
 * @param htmlContent The generated HTML content
 * @param fileName Optional file name (defaults to "generated-wireframe.html")
 * @returns URL to the generated file
 */
export function saveGeneratedHtml(htmlContent: string, fileName: string = "generated-wireframe.html"): string {
  // Create a blob with the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create a download link
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = fileName;
  
  // Trigger the download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  return url;
}

/**
 * Open the generated HTML in a new tab
 * @param htmlContent The generated HTML content
 * @returns URL to the generated file
 */
export function openGeneratedHtml(htmlContent: string): string {
  // Create a blob with the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Open in a new tab
  window.open(url, '_blank');
  
  return url;
}

/**
 * Save generated code to a file with appropriate extension
 * @param code The generated code content
 * @param isHtml Whether the code is HTML (true) or React (false)
 * @param fileName Optional custom file name
 * @returns URL to the generated file
 */
export function saveGeneratedCode(
  code: string, 
  isHtml: boolean = true,
  fileName?: string
): string {
  const defaultName = isHtml ? "generated-wireframe.html" : "GeneratedComponent.jsx";
  const finalFileName = fileName || defaultName;
  const mimeType = isHtml ? 'text/html' : 'application/javascript';
  
  // Create a blob with the content
  const blob = new Blob([code], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  // Create a download link
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = finalFileName;
  
  // Trigger the download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  return url;
}
