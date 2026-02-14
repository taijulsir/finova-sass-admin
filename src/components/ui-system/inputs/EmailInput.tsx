"use client";

import * as React from "react";
import { ShortTextInput, InputSystemProps } from "./ShortTextInput";

export const EmailInput = React.forwardRef<HTMLInputElement, InputSystemProps>(
  (props, ref) => {
    return <ShortTextInput ref={ref} type="email" {...props} />;
  }
);

EmailInput.displayName = "EmailInput";
