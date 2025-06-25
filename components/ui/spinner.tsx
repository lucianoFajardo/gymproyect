import { cn } from "@/lib/utils";

export function Spinner({
    size = "default",
    variant = "pulse",
    className
}: {
    size?: "sm" | "default" | "lg";
    variant?: "pulse" | "dots" | "bars" | "gradient" | "orbit";
    className?: string;
}) {
    const sizeClasses = {
        sm: "h-6 w-6",
        default: "h-12 w-12",
        lg: "h-24 w-24",
    };

    const variants = {
        pulse: (
            <div className={cn(
                "animate-spin rounded-full border-4 border-primary/20 border-t-primary",
                sizeClasses[size],
                className
            )} />
        ),

        dots: (
            <div className={cn("flex space-x-1", className)}>
                <div className={cn("animate-bounce rounded-full bg-primary",
                    size === "sm" ? "h-2 w-2" : size === "lg" ? "h-4 w-4" : "h-3 w-3"
                )} style={{ animationDelay: "0ms" }} />
                <div className={cn("animate-bounce rounded-full bg-primary",
                    size === "sm" ? "h-2 w-2" : size === "lg" ? "h-4 w-4" : "h-3 w-3"
                )} style={{ animationDelay: "150ms" }} />
                <div className={cn("animate-bounce rounded-full bg-primary",
                    size === "sm" ? "h-2 w-2" : size === "lg" ? "h-4 w-4" : "h-3 w-3"
                )} style={{ animationDelay: "300ms" }} />
            </div>
        ),

        bars: (
            <div className={cn("flex space-x-1 items-end", className)}>
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "bg-primary animate-pulse",
                            size === "sm" ? "w-1 h-6" : size === "lg" ? "w-2 h-12" : "w-1.5 h-8"
                        )}
                        style={{
                            animationDelay: `${i * 150}ms`,
                            animationDuration: "1s"
                        }}
                    />
                ))}
            </div>
        ),

        gradient: (
            <div className={cn(
                "animate-spin rounded-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 p-1",
                sizeClasses[size],
                className
            )}>
                <div className="rounded-full bg-background h-full w-full" />
            </div>
        ),

        orbit: (
            <div className={cn("relative", sizeClasses[size], className)}>
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/30">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary" />
                </div>
                <div className="absolute inset-2 animate-spin rounded-full border-2 border-purple-500/50" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-purple-500" />
                </div>
            </div>
        )
    };

    return variants[variant];
}

export function FullPageLoader({ variant = "gradient" }: { variant?: "pulse" | "dots" | "bars" | "gradient" | "orbit" }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <Spinner size="lg" variant={variant} />
            <p className="mt-4 text-sm text-muted-foreground animate-pulse">Cargando...</p>
        </div>
    );
}

// Spinner con texto personalizable
export function LoadingSpinner({
    text = "Cargando...",
    variant = "gradient",
    size = "default"
}: {
    text?: string;
    variant?: "pulse" | "dots" | "bars" | "gradient" | "orbit";
    size?: "sm" | "default" | "lg";
}) {
    return (
        <div className="flex flex-col items-center space-y-3">
            <Spinner size={size} variant={variant} />
            {text && (
                <p className="text-sm text-muted-foreground animate-pulse font-medium">
                    {text}
                </p>
            )}
        </div>
    );
}