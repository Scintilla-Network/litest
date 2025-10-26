export const stringify = (element) => {
    return JSON.stringify(element, (key, value) => {
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    });
}