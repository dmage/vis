module jQuery {

export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

export function colorToRgba(colorStr): RGBA {
    var match;

    match = colorStr.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (match !== null) {
        return {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10),
            a: 1
        };
    }

    match = colorStr.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*((?:\d+)?(?:\.\d+)?)\s*\)$/);
    if (match !== null) {
        return {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10),
            a: parseFloat(match[4])
        };
    }

    match = colorStr.match(/^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
    if (match !== null) {
        return {
            r: parseInt(match[1], 16),
            g: parseInt(match[2], 16),
            b: parseInt(match[3], 16),
            a: 1
        };
    }

    match = colorStr.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);
    if (match !== null) {
        return {
            r: parseInt(match[1] + match[1], 16),
            g: parseInt(match[2] + match[2], 16),
            b: parseInt(match[3] + match[3], 16),
            a: 1
        };
    }

    return { r: 0, g: 0, b: 0, a: 1 };
}

}
