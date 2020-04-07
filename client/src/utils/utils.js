export const round = (number, decimals) => {
    return Math.round((number + Number.EPSILON) * Math.pow(10, decimals || 7)) / Math.pow(10, decimals || 7);
}