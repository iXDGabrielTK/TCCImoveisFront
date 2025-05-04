// src/utils/formatDate.ts

/**
 * Format a date to a string in the format DD/MM/YYYY
 * @param date - The date to format
 * @returns The formatted date string
 */
export const formatDateToBrazilian = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Format a date string in the format YYYY-MM-DD to DD/MM/YYYY
 * @param dateString - The date string to format
 * @returns The formatted date string
 */
export const formatISOToBrazilian = (dateString: string): string => {
    if (!dateString) return '';
    
    // Check if the format is YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Format a date string in the format DD/MM/YYYY to YYYY-MM-DD
 * @param dateString - The date string to format
 * @returns The formatted date string
 */
export const formatBrazilianToISO = (dateString: string): string => {
    if (!dateString) return '';
    
    // Check if the format is DD/MM/YYYY
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }
    
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
};

/**
 * Get the current date in the format YYYY-MM-DD
 * @returns The current date in ISO format
 */
export const getCurrentDateISO = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};