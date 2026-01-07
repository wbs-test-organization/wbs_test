import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/slice/authSlice"
import projectReducer from "../redux/slice/projectSlice"

const reducer = {
  auth: authReducer,
  project: projectReducer,
};

const Store =
  process.env.NODE_ENV === "development"
    ? configureStore({
        reducer: reducer,
        devTools: true,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            serializableCheck: {
              ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
          }),
      })
    : configureStore({
        reducer: reducer,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            serializableCheck: {
              ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
          }),
      });

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
export default Store;
