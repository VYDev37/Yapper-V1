export const NoSpecialChar = (text: string, ignoreSpace: boolean = false): boolean => {
    const pattern = ignoreSpace ? /^[A-Za-z0-9 ]+$/ : /^[A-Za-z0-9]+$/;
    return pattern.test(text);
}

export const IsValidEmail = (text: string): boolean => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(text);
}

export const OnlyNumbers = (text: string): boolean => {
    const pattern = /^\d+$/;
    return pattern.test(text);
}