import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

const fabVariants = cva(
	"fixed bottom-6 right-6 z-50 inline-flex items-center justify-center rounded-full shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary",
			},
			size: {
				default: "h-14 w-14",
				sm: "h-12 w-12",
				lg: "h-16 w-16",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export type FabProp = VariantProps<typeof fabVariants> & ComponentPropsWithRef<"button">;

export default function Fap({ className, variant, size, ref, ...props }: FabProp) {
	return <button className={cn(fabVariants({ variant, size, className }))} ref={ref} {...props} />;
}
