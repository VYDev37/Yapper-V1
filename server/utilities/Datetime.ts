export const GetTimeLeft = (until: Date) => {
    let ret: string[] = [];

    const current: Date = new Date();

    const ms: number = until.getTime() - current.getTime();

    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    let hours = Math.floor(minutes / 60);
    minutes %= 60;
    let days = Math.floor(hours / 24);
    hours %= 24;
    let weeks = Math.floor(days / 7);
    days %= 7;
    let months = Math.floor(weeks / 4);
    weeks %= 4;
    let years = Math.floor(months / 12);
    months %= 12;

    if (years > 0)
        ret.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0)
        ret.push(`${months} month${months > 1 ? 's' : ''}`);
    if (weeks > 0)
        ret.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
    if (days > 0)
        ret.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0)
        ret.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0)
        ret.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (seconds > 0)
        ret.push(`${seconds} second${seconds > 1 ? 's' : ''}`);

    return ret.join(", ");
}

export const TimeLengthToSecond = (input: string) => {
    if (!input) 
        return -1;

    input = input.trim().toLowerCase();

    const match = input.match(/^(\d+)\s*(y|year|years|mo|month|months|w|week|weeks|d|day|days|h|hour|hours|m|min|minute|minutes|s|sec|second|seconds)?$/);
    if (!match) 
        return -1;

    const value: number = parseInt(match[1]);
    const unit: string = match[2] || 'd';

    if (isNaN(value)) 
        return -1;

    switch (unit) {
        case 'y':
        case 'year':
        case 'years':
            return value * 31536000;
        case 'mo':
        case 'month':
        case 'months':
            return value * 2592000;
        case 'w':
        case 'week':
        case 'weeks':
            return value * 604800;
        case 'd':
        case 'day':
        case 'days':
            return value * 86400;
        case 'h':
        case 'hour':
        case 'hours':
            return value * 3600;
        case 'm':
        case 'min':
        case 'minute':
        case 'minutes':
            return value * 60;
        case 's':
        case 'sec':
        case 'second':
        case 'seconds':
            return value;
        default:
            return -1;
    }
}