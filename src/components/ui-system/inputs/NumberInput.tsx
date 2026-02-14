"use client";

import * as React from "react";
import { ShortTextInput, InputSystemProps } from "./ShortTextInput";

export const NumberInput = React.forwardRef<HTMLInputElement, InputSystemProps>(
  (props, ref) => {
    return <ShortTextInput ref={ref} type="number" {...props} />;
  }
);

NumberInput.displayName = "NumberInput";
