import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PuduGraphConfig } from "../types";

const initialState: PuduGraphConfig = {
  data: [],
  options: {},
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setConfig(state, action: PayloadAction<PuduGraphConfig>) {
      return action.payload;
    },
  },
});

export const { setConfig } = configSlice.actions;
export default configSlice.reducer;
