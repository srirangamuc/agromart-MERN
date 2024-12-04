// src/redux/productsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { productsService } from '../services/productServices';

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setProducts, setLoading, setError } = productsSlice.actions;
export default productsSlice.reducer;

// Async action creators
export const fetchProducts = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const data = await productsService.fetchProducts();
    dispatch(setProducts(data));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const addToCart = (itemId, quantity) => async (dispatch) => {
  try {
    await productsService.addToCart(itemId, quantity);
  } catch (error) {
    dispatch(setError(error.message));
  }
};