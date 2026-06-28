import { useEffect, useRef, useState } from 'react'

/**
 * Debounce any fast-changing value. Returns the debounced value after `delay` ms
 * of inactivity.
 */
export function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setDebounced(value), delay)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [value, delay])

  return debounced
}
