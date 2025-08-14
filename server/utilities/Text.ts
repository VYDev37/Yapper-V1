export const NoSpecialChar = (text: string, ignoreSpace: boolean = false) => {
    const pattern = ignoreSpace ? /^[A-Za-z0-9 ]+$/ : /^[A-Za-z0-9]+$/;
    return pattern.test(text);
}