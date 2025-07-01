import { useRef } from "react"

export function useDebouncedCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const debouncedFn = (...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args)
        }, delay)
    }
    return debouncedFn
}

export function isChrome(): boolean {
    const userAgent = navigator.userAgent
    const vendor = navigator.vendor

    // Prüfe auf Chrome spezifisch (nicht Edge, Opera, etc.)
    const isChromeBrowser =
        /Chrome/.test(userAgent) &&
        /Google Inc/.test(vendor) &&
        !/Edg/.test(userAgent) &&
        !/OPR/.test(userAgent)

    return isChromeBrowser
}
