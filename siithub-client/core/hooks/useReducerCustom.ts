import { Reducer, useMemo, useReducer, useState } from "react";

export function useReducerWithThunk<S, A>(reducer: Reducer<S, A>, initialState: S) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const customDispatch = (action: any) => {
    if (typeof action === "function") {
      action(customDispatch);
    } else {
      dispatch(action);
    }
  };

  return [state, customDispatch] as const;
}

let changeableState: any = undefined;

export function useReducerWithThunkAndImmer<S, A extends { type: string }>(
  reducer: { [key: string]: Reducer<S, A> },
  initialState: S
) {
  const [state, setState] = useState({ ...initialState });
  const produceableFunction = useMemo(() => findActionHandler(reducer), [reducer]);

  if (!changeableState) {
    changeableState = { ...initialState };
  }

  const customDispatch = (action: any) => {
    if (typeof action === "function") {
      action(customDispatch);
    } else {
      const newState = produceableFunction(changeableState, action);
      changeableState = { ...newState };
      setState({ ...newState });
    }
  };

  return [state, customDispatch] as const;
}

export function findActionHandler<S, A extends { type: string }>(handlers: { [key: string]: Reducer<S, A> }) {
  return (state: S, action: A) => {
    const property = Object.keys(handlers).find((key) => key.includes(action.type)) ?? "";
    if (handlers.hasOwnProperty(property)) return handlers[property](state, action);
    return state;
  };
}
