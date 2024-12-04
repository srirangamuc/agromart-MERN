import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import productReducer from "./productSlice";
import cartReducer from "./cartSlice";
import sectionReducer from "./sectionSlice";

const store = configureStore({
    reducer:{
        auth:authReducer,
        user:userReducer,
        product:productReducer,
        cart:cartReducer,
        section:sectionReducer

    }
})

export default store