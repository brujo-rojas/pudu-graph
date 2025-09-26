import { configureStore } from "@reduxjs/toolkit";
import configReducer from "./configSlice";
import dataReducer from "./dataSlice";
import uiStateReducer from "./uiStateSlice";
import tooltipReducer from "./tooltipSlice";
import floatDetailReducer from "./floatDetailSlice";
import mousePositionReducer from "./mouseoverLightSlice";

export const store = configureStore({
  reducer: {
    config: configReducer,
    data: dataReducer,
    uiState: uiStateReducer,
    tooltip: tooltipReducer,
    floatDetail: floatDetailReducer,
    mousePosition: mousePositionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
