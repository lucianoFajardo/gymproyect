async function checkSubscriptionExpiration(startSubscription: string, subscriptionDurationDays: number) {
    try {
        const startDate = new Date(startSubscription); // Convertir el string a fecha
        const currentDate = new Date(); // Fecha actual
        // Calcular la fecha de expiración
        const expireDate = new Date(startDate);
        expireDate.setDate(expireDate.getDate() + subscriptionDurationDays);

        // Comparar fechas
        if (currentDate <= expireDate) {
            return {
                isActive: true,
                message: "La suscripción está activa.",
                expireDate: expireDate.toLocaleDateString(),
            };
        } else {
            return {
                isActive: false,
                message: "La suscripción ha expirado. Por favor, renueve su suscripción.",
                expireDate: expireDate.toLocaleDateString(),
            };
        }
    } catch (error) {
        console.error("Error al verificar la fecha de expiración de la suscripción:", error);
        throw new Error("Error al verificar la fecha de expiración de la suscripción");
    }
}

export default checkSubscriptionExpiration;