export const FormatNumber = (n: number) => {
    return n.toLocaleString();
}

export const GetTimePast = (startDate: Date | string) => {
    const begin = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const now = new Date();
    const diffMs = now.getTime() - begin.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0)
        return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0)
        return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0)
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0)
        return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0)
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    return 'just now';
}

export const FormatDate = (date: Date | string) => {
    const verifiedDate = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(verifiedDate);
}
