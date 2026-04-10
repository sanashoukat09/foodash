import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(2.99);

  const addItem = (item, restId, restName, restDeliveryFee) => {
    if (restaurantId && restaurantId !== restId) {
      if (!window.confirm('Your cart has items from another restaurant. Start a new cart?')) return;
      setItems([]);
    }
    setRestaurantId(restId);
    setRestaurantName(restName);
    setDeliveryFee(restDeliveryFee || 2.99);
    setItems(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (itemId) => {
    setItems(prev => {
      const updated = prev.map(i => i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);
      if (updated.length === 0) { setRestaurantId(null); setRestaurantName(''); }
      return updated;
    });
  };

  const clearCart = () => { setItems([]); setRestaurantId(null); setRestaurantName(''); };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, restaurantId, restaurantName, deliveryFee, addItem, removeItem, clearCart, subtotal, tax, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
