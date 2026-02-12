import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [zipCode, setZipCode] = useState('');
    const [customer, setCustomer] = useState({ name: '', address: '' });

    const calculateShipping = useCallback((zip) => {
        setZipCode(zip);
        if (!zip) {
            setShippingCost(0);
            return;
        }

        // Lógica de Envío (Zona Winifreda, La Pampa, Resto del País)
        if (zip === '6313') {
            setShippingCost(0); // Winifreda: Gratis
        } else if (zip.startsWith('63')) {
            setShippingCost(5500); // La Pampa: $5500
        } else {
            setShippingCost(8000); // Resto del país: $8000
        }
    }, []);

    const addItem = useCallback((product, size) => {
        setItems(prev => {
            const existing = prev.find(i => i.product.id === product.id && i.size === size);
            if (existing) {
                return prev.map(i =>
                    i.product.id === product.id && i.size === size
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { product, size, quantity: 1 }];
        });
        setIsOpen(true);
    }, []);

    const removeItem = useCallback((productId, size) => {
        setItems(prev => prev.filter(i => !(i.product.id === productId && i.size === size)));
    }, []);

    const updateQuantity = useCallback((productId, size, quantity) => {
        if (quantity <= 0) {
            removeItem(productId, size);
            return;
        }
        setItems(prev =>
            prev.map(i =>
                i.product.id === productId && i.size === size
                    ? { ...i, quantity }
                    : i
            )
        );
    }, [removeItem]);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);

    const generateWhatsAppMessage = useCallback(() => {
        const WHATSAPP_NUMBER = '5492302462479';

        // Emojis retirados por solicitud del usuario para evitar problemas de encoding
        let message = '*Nuevo Pedido - PazSport*\n\n';

        // Datos del Cliente
        if (customer.name) message += `*Cliente:* ${customer.name}\n`;
        if (customer.address) message += `*Dirección:* ${customer.address}\n`;
        if (zipCode) message += `*CP:* ${zipCode}\n`;

        message += '\n*Productos:*\n';

        items.forEach((item, index) => {
            message += `${index + 1}. ${item.product.name} - Talle ${item.size} x${item.quantity} - $${(item.product.price * item.quantity).toLocaleString('es-AR')}\n`;
        });

        if (shippingCost > 0) {
            message += `\nEnvío: $${shippingCost.toLocaleString('es-AR')}\n`;
        } else if (zipCode === '6313') {
            message += `\nRetiro en Local / Winifreda (Gratis)\n`;
        }

        const finalTotal = totalPrice + shippingCost;
        message += `\n*Total Final: $${finalTotal.toLocaleString('es-AR')}*\n\n`;

        message += '*Datos de Pago:*\n';
        message += 'Banco: Mercado Pago\n';
        message += 'Alias: pazsport\n';
        message += 'Titular: Maria Paz Maldonado\n';
        message += 'CUIL: 27-41831394-9\n\n';

        message += '_Adjunto comprobante de transferencia_\n\n¡Gracias!';

        // Ensure proper URL encoding
        const encoded = encodeURIComponent(message);
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    }, [items, totalPrice, shippingCost, zipCode, customer]);

    return (
        <CartContext.Provider value={{
            items, isOpen, setIsOpen, addItem, removeItem,
            updateQuantity, clearCart, totalItems, totalPrice,
            generateWhatsAppMessage, calculateShipping, shippingCost, zipCode,
            customer, setCustomer
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
    return context;
}
