import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PGConfig } from "../types";

const initialState: PGConfig = {
  data: [],
  options: {},
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setConfig(state, action: PayloadAction<PGConfig>) {
      return action.payload;
    },
  },
});

export const { setConfig } = configSlice.actions;
export default configSlice.reducer;
