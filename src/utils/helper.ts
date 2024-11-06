export function formatNumber(input: string | number) {
    const num = Number(input)

    if (num > 100) {
        return num.toFixed(2).toString()
    } else if (num < 100 && num > 10) {
        return num.toFixed(4).toString()
    } else {
        return num.toString()
    }
}
