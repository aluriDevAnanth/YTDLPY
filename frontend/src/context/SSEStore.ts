import type { StartupSSE } from "../store/useAppStore";
import { useAppStore } from "../store/useAppStore";
export type { StartupSSE };
export const useStartupSSEStore = (selector: (state: any) => any) => {
  return useAppStore((state) => {
    const data = state.startupp;
    const mockState = {
      sse: data
        ? {
            startupp: {
              startupp: data,
            },
          }
        : {},
      upsertSSE: (item: StartupSSE) => state.setStartupSSE(item),
    };
    return selector(mockState);
  });
};
export default useStartupSSEStore;
