// filepath: components/ui/spinner.tsx (o donde prefieras)
export function Spinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
    const sizeClasses = {
        sm: "h-6 w-6",
        default: "h-12 w-12",
        lg: "h-24 w-24",
    };

    return (
        <div className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${sizeClasses[size]}`} />
    );
}

export function FullPageLoader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Spinner size="lg" />
        </div>
    );
}