import { useReducer, StrictMode } from 'react';
import type { ReactNode } from 'react';

import { createContext, useContextSelector } from 'better-use-context-selector';

const initialState = {
  count: 0,
  text: 'hello',
};

type State = typeof initialState;

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setText'; text: string };

type Dispatch = (action: Action) => void;

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'setText':
      return { ...state, text: action.text };
    default:
      throw new Error(`unknown action type: ${(action as Action).type}`);
  }
};

const context = createContext<[State, Dispatch]>([initialState, () => null]);

const Counter = () => {
  const count = useContextSelector(context, (v) => v[0].count);
  const dispatch = useContextSelector(context, (v) => v[1]);
  return (
    <div>
      {Math.random()}
      <div>
        <span>Count: {count}</span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>
          +1
        </button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>
          -1
        </button>
      </div>
    </div>
  );
};

const TextBox = () => {
  const text = useContextSelector(context, (v) => v[0].text);
  const dispatch = useContextSelector(context, (v) => v[1]);
  return (
    <div>
      {Math.random()}
      <div>
        <span>Text: {text}</span>
        <input
          value={text}
          onChange={(event) =>
            dispatch({ type: 'setText', text: event.target.value })
          }
        />
      </div>
    </div>
  );
};

const Provider = ({ children }: { children: ReactNode }) => (
  <context.Provider value={useReducer(reducer, initialState)}>
    {children}
  </context.Provider>
);

const App = () => (
  <StrictMode>
    <Provider>
      <div>
        <h1>Counter</h1>
        <Counter />
        <Counter />
        <h1>TextBox</h1>
        <TextBox />
        <TextBox />
      </div>
    </Provider>
  </StrictMode>
);

export default App;
