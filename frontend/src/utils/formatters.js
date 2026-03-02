export const formatPrice = (price) => {
    if (price === null || price === undefined) return '0';
    return Number(price).toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};
