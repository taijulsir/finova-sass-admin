"use client";

import * as React from "react";
import { ShortTextInput, InputSystemProps } from "./ShortTextInput";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PasswordInput = React.forwardRef<HTMLInputElement, InputSystemProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <ShortTextInput
          ref={ref}
          type={showPassword ? "text" : "password"}
          className="pr-10"
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-7 h-9 w-10 px-0 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
