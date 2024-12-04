// src/redux/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { cartServices } from '../services/cartServices'

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalPrice: 0,
    loading: false,
    error: null
  },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.cart;
      state.totalPrice = action.payload.totalPrice;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    }
  }
});

export const { setCart, setLoading, setError, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// Async action creators
export const fetchCart = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const data = await cartServices.fetchCart();
    dispatch(setCart(data));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const deleteFromCart = (itemId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const data = await cartServices.deleteFromCart(itemId);
    dispatch(setCart(data));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const checkout = (paymentMethod) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await cartServices.checkout(paymentMethod);
    dispatch(clearCart());
  } catch (error) {
    dispatch(setError(error.message));
  }
};