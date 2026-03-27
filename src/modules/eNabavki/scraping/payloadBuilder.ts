export function buildBasePayload(config: {
    start: number;
    length: number;
    draw: number;
    orderColumn: string;
    columns: string[];
    specialColumns?: string[];
    discriminator: Record<string, unknown>;
}) {
    const params = new URLSearchParams();

    params.append('draw', config.draw.toString());
    params.append('start', config.start.toString());
    params.append('length', config.length.toString());
    params.append('search[value]', '');
    params.append('search[regex]', 'false');
    params.append('order[0][column]', config.orderColumn);
    params.append('order[0][dir]', 'desc');

    config.columns.forEach((col, i) => {
        const isSpecial = config.specialColumns?.includes(col);
        const boolStr = isSpecial ? 'false' : 'true';

        params.append(`columns[${i}][data]`, col);
        params.append(`columns[${i}][name]`, '');
        params.append(`columns[${i}][searchable]`, boolStr);
        params.append(`columns[${i}][orderable]`, boolStr);
        params.append(`columns[${i}][search][value]`, '');
        params.append(`columns[${i}][search][regex]`, 'false');
    });

    params.append('Discriminator', JSON.stringify(config.discriminator));

    return params;
}
