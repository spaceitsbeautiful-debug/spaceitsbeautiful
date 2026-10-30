import { useSyncExternalStore } from 'react'

// Tiny shared flag: the hero waits for the loader to finish before playing its entrance.

let done = false
const listeners = new Set<() => void>()

export function finishIntro() {
  if (done) return
  done = true
  listeners.forEach((l) => l())
}

export function useIntroDone() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => done,
  )
}
