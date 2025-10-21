import { useCallback, useEffect, useState } from 'react';
import { convexHttp } from './convexClient';

// Ultra-simple data hook for Convex HTTP queries.
// It polls on an interval to simulate near real-time updates without codegen.
// When you enable `api` codegen usage, you can swap this by `useQuery(api.x.y)`.

type Options = {
  // Re-polling interval in ms (0 disables polling)
  refreshMs?: number;
  // Start disabled (until you call refetch)
  enabled?: boolean;
};

export function useConvexQuery<T>(path: string, args: Record<string, any> = {}, opts: Options = {}) {
  const { refreshMs = 10000, enabled = true } = opts;
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState<boolean>(!!enabled);
  const [error, setError] = useState<Error | undefined>();

  const fetchOnce = useCallback(async () => {
    try {
      setLoading(true);
      const res = await convexHttp.query(path as any, args as any);
      setData(res as T);
      setError(undefined);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [path, JSON.stringify(args)]);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let timer: any;
    const run = async () => {
      if (disposed) return;
      await fetchOnce();
      if (refreshMs > 0) {
        timer = setTimeout(run, refreshMs);
      }
    };
    run();
    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
    };
  }, [enabled, refreshMs, fetchOnce]);

  return { data, loading, error, refetch: fetchOnce };
}

