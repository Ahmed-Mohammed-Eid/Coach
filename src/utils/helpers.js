/**
 * Format a date string based on locale
 * @param {string} dateString - The date string to format
 * @param {string} locale - The locale ('ar' or 'en')
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString, locale) => {
    if (!dateString) return '-';

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return '-';
        }

        if (locale === 'ar') {
            // Arabic date format
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                calendar: 'gregory'
            };

            return date.toLocaleDateString('ar-EG', options);
        } else {
            // English date format
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };

            return date.toLocaleDateString('en-US', options);
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
};

/**
 * Calculate days difference between two dates
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} - Number of days
 */
export const calculateDaysDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    try {
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        const end = endDate instanceof Date ? endDate : new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return 0;
        }

        // Calculate difference in milliseconds
        const diffTime = Math.abs(end - start);
        // Convert to days
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    } catch (error) {
        console.error('Error calculating days difference:', error);
        return 0;
    }
};
