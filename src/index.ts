import useSyncExternalStoreExports from "use-sync-external-store/shim/with-selector";

const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;

import { StoreApi, createStore } from "./store";

type UseStoreFn<State> = (
  selector?: (state?: State) => State | Partial<State> | any,
  equalityFn?: (left: Partial<State>, right: Partial<State>) => boolean
) => [any, StoreApi<State>["setState"] & Actions];

type Actions = {
  [key: string]: (state: any) => void;
};

type ActionsCreatorFn<State> = (
  setState: StoreApi<State>["setState"],
  getState: StoreApi<State>["getState"],
  storeApi: StoreApi<State>
) => {
  [key: string]: (state: State) => void;
};

export const create = <State>(
  state: State,
  actionsCreator?: ActionsCreatorFn<State>
): UseStoreFn<State> => {
  const storeApi = createStore<State>(state);

  const actions =
    actionsCreator?.(storeApi.setState, storeApi.getState, storeApi) ?? {};

  const setStoreState = Object.assign(storeApi.setState, actions);

  const useStore: UseStoreFn<State> = (
    selector = storeApi.getState,
    equalityFn
  ) => {
    const slice = useSyncExternalStoreWithSelector(
      storeApi.subscribe,
      storeApi.getState,
      storeApi.getState,
      selector,
      equalityFn
    );

    return [slice, setStoreState];
  };

  return useStore;
};

export { createStore };
