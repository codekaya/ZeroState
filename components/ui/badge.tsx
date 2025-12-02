import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md",
        secondary:
          "border-transparent bg-gray-100 text-gray-700",
        destructive:
          "border-transparent bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md",
        outline: "text-gray-700 border-gray-300 bg-white",
        success:
          "border-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md",
        warning:
          "border-transparent bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };


