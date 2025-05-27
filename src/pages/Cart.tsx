
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartContent from '@/components/cart/CartContent';
import CartEffects from '@/components/cart/CartEffects';
import { useCart } from '@/hooks/useCart';

const Cart = () => {
  const {
    cartItems,
    isLoading,
    setCartItems,
    loadCartFromLocalStorage,
    fetchCart,
    handleUpdateItem,
    handleRemoveItem,
    searchParams
  } = useCart();

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <CartEffects
        cartItems={cartItems}
        setCartItems={setCartItems}
        loadCartFromLocalStorage={loadCartFromLocalStorage}
        fetchCart={fetchCart}
        searchParams={searchParams}
      />
      
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-serif mb-2">Shopping Cart</h1>
            <div className="w-24 h-0.5 bg-gold mx-auto"></div>
          </div>

          <CartContent
            cartItems={cartItems}
            isLoading={isLoading}
            onItemUpdate={handleUpdateItem}
            onItemRemove={handleRemoveItem}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
