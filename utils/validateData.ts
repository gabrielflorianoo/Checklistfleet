// validateData.ts

/**
 * Valida se o valor é um número positivo maior que zero e não contém letras.
 * @param value - O valor a ser validado.
 * @returns true se válido, false caso contrário.
 */
export function validateKm(value: any): boolean {
    // Accept numeric or numeric string (e.g. '50000' or 50000)
    if (typeof value === 'number') {
        return !isNaN(value) && value > 0;
    }

    if (typeof value === 'string') {
        const cleaned = value.trim().replace(/\s+/g, '').replace(',', '.');
        // only digits and optional decimal point
        if (!/^[0-9]+(?:\.[0-9]+)?$/.test(cleaned)) return false;
        const n = Number(cleaned);
        return !isNaN(n) && n > 0;
    }

    return false;
}

/**
 * Valida se o valor é um número positivo (para outros tipos numéricos).
 * @param value - O valor a ser validado.
 * @returns true se válido, false caso contrário.
 */
export function validatePositiveNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Valida formato de placa brasileira (ex: AAA-1234).
 * @param value - A placa a ser validada.
 * @returns true se válido, false caso contrário.
 */
export function validatePlate(value: any): boolean {
    if (typeof value !== 'string') return false;
    // Normalize: remove non-alphanumeric and uppercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    const mercosulRegex = /^[A-Z]{3}\d[A-Z]\d{2}$/; // ABC1D23
    const abcdRegex = /^[A-Z]{4}\d{3}$/; // ABCD123
    const machineryRegex = /^[A-Z]{3}\d{2}[A-Z]{2}$/; // PMM00XX
    return mercosulRegex.test(cleaned) || abcdRegex.test(cleaned) || machineryRegex.test(cleaned);
}

/**
 * Valida data no formato ISO 'YYYY-MM-DD' ou aceita Date/string que podem ser convertidos.
 */
export function validateDateString(value: any): boolean {
    if (value instanceof Date) return !isNaN(value.getTime());
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
    const d = new Date(trimmed + 'T00:00:00');
    return !isNaN(d.getTime());
}

/**
 * Valida hora no formato 'HH:MM' (24h).
 */
export function validateTimeString(value: any): boolean {
    if (typeof value !== 'string') return false;
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

/**
 * Valida se o valor é uma string não vazia e não contém números (para textos).
 * @param value - O valor a ser validado.
 * @returns true se válido, false caso contrário.
 */
export function validateText(value: any): boolean {
    if (typeof value !== 'string' || value.trim() === '') return false;
    // Não contém números
    return !/\d/.test(value);
}

/**
 * Valida se o valor é um booleano.
 * @param value - O valor a ser validado.
 * @returns true se válido, false caso contrário.
 */
export function validateBoolean(value: any): boolean {
    return typeof value === 'boolean';
}

/**
 * Valida se o valor é uma data válida.
 * @param value - O valor a ser validado.
 * @returns true se válido, false caso contrário.
 */
export function validateDate(value: any): boolean {
    return value instanceof Date && !isNaN(value.getTime());
}