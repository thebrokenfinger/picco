type Listener<State> = (state: State, prevState: State) => void;

export type StoreApi<State> = {
  setState: (
    partial: Partial<State> | ((state: State) => State | Partial<State>),
    replace?: boolean
  ) => void;
  getState: () => State;
  subscribe: (listener: Listener<State>) => () => void;
};

export const createStore = <S>(initialState: S) => {
  let state: S = initialState;
  const listeners = new Set<Listener<S>>();

  const setState: StoreApi<S>["setState"] = (partial, replace = false) => {
    const nextState =
      typeof partial === "function"
        ? (partial as (state: S) => S)(state)
        : partial;

    if (!Object.is(nextState, state)) {
      const prevState = state;
      state =
        replace ?? typeof nextState !== "object"
          ? (nextState as S)
          : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, prevState));
    }
  };

  const getState: StoreApi<S>["getState"] = () => state;

  const subscribe: StoreApi<S>["subscribe"] = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { setState, getState, subscribe };
};
