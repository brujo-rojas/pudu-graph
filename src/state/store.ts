import { configureStore } from "@reduxjs/toolkit";
import configReducer from "./configSlice";
import dataReducer from "./dataSlice";
import uiStateReducer from "./uiStateSlice";
import tooltipReducer from "./tooltipSlice";
import floatDetailReducer from "./floatDetailSlice";

export const store = configureStore({
  reducer: {
    config: configReducer,
    data: dataReducer,
    uiState: uiStateReducer,
    tooltip: tooltipReducer,
    floatDetail: floatDetailReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
