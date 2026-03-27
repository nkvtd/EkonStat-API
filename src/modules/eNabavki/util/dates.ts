export function formatDate(dateString: string) {
    if (dateString.startsWith("/Date")) {
        return new Date(parseInt(dateString.match(/\d+/)?.[0] || "0", 10)).toISOString();
    }

    return new Date(dateString).toISOString();
}

export function getCurrentDateString() {
    const currentDate = new Date();

    const day = currentDate.getDate().toString();
    const month = (currentDate.getMonth() + 1).toString();
    const year = currentDate.getFullYear();

    return `${day}.${month}.${year}`;
}

export function getCurrentDateISO() {
    return new Date().toISOString();
}