export function useSingleton<T>(obj: T): () => T {
  return () => obj;
}
