import {
  createElement,
  createContext as createContextOrig,
  useContext as useContextOrig,
  useLayoutEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
  PropsWithChildren,
} from 'react';
import shallowEqual from 'shallowequal';

const createProvider = (ProviderOrig) => {
  const ContextProvider = ({
    value,
    children,
  }: PropsWithChildren<{
    value: any;
  }>) => {
    const contextValue = useRef<{
      value: any;
      listeners: Set<any>;
    }>();
    if (!contextValue.current) {
      const listeners = new Set();
      contextValue.current = {
        value,
        listeners,
      };
    }
    useLayoutEffect(() => {
      contextValue.current.value = value;
      contextValue.current.listeners.forEach((listener) => {
        listener();
      });
    }, [value]);

    return createElement(
      ProviderOrig,
      { value: contextValue.current },
      children,
    );
  };

  return ContextProvider;
};

export function createContext(defaultValue) {
  const context = createContextOrig({
    value: defaultValue,
    listeners: new Set(),
  });
  // @ts-expect-error expected
  context.Provider = createProvider(context.Provider);
  delete context.Consumer;
  return context;
}

// 基于 useSyncExternalStore 实现 useContextSelector
export function useContextSelector(
  context,
  selector,
  equalityFn = shallowEqual,
) {
  const contextValue = useContextOrig<any>(context);
  const { value, listeners } = contextValue;

  const subscribe = useCallback(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    [listeners],
  );

  const lastSnapshot = useRef(selector(value));

  const getSnapshot = () => {
    const nextSnapshot = selector(contextValue.value);

    if (equalityFn(lastSnapshot.current, nextSnapshot)) {
      return lastSnapshot.current;
    }

    lastSnapshot.current = nextSnapshot;
    return nextSnapshot;
  };

  return useSyncExternalStore(subscribe, getSnapshot);
}
