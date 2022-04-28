# use-context-selector

[![CI](https://img.shields.io/github/workflow/status/dai-shi/use-context-selector/CI)](https://github.com/dai-shi/use-context-selector/actions?query=workflow%3ACI)
[![npm](https://img.shields.io/npm/v/use-context-selector)](https://www.npmjs.com/package/use-context-selector)
[![size](https://img.shields.io/bundlephobia/minzip/use-context-selector)](https://bundlephobia.com/result?p=use-context-selector)
[![discord](https://img.shields.io/discord/627656437971288081)](https://discord.gg/MrQdmzd)

React useContextSelector hook in userland

## Introduction

React Context and useContext is often used to avoid prop drilling,
however it's known that there's a performance issue.
When a context value is changed, all components that useContext
will re-render.

To solve this issue,
[useContextSelector](https://github.com/reactjs/rfcs/pull/119)
is proposed and later proposed
[Speculative Mode](https://github.com/reactjs/rfcs/pull/150)
with context selector support.
This library provides the API in userland.

Prior to v1.3, it uses `changedBits=0` feature to stop propagation,
v1.3 no longer depends on this undocumented feature.

## Install

This package requires some peer dependencies, which you need to install by yourself.

```bash
yarn add use-context-selector react scheduler
```

Notes for library authors:

Please do not forget to keep `"peerDependencies"` and
note instructions to let users to install peer dependencies.

## Technical memo

To make it work like original React context, it uses
[useReducer cheat mode](https://overreacted.io/a-complete-guide-to-useeffect/#why-usereducer-is-the-cheat-mode-of-hooks) intentionally.
It also requires `useContextUpdate` to behave better in Concurrent Mode.
(You don't need to use it in Legacy Mode.)

## Usage

```javascript
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import { createContext, useContextSelector } from 'use-context-selector';

const context = createContext(null);

const Counter1 = () => {
  const count1 = useContextSelector(context, v => v[0].count1);
  const setState = useContextSelector(context, v => v[1]);
  const increment = () => setState(s => ({
    ...s,
    count1: s.count1 + 1,
  }));
  return (
    <div>
      <span>Count1: {count1}</span>
      <button type="button" onClick={increment}>+1</button>
      {Math.random()}
    </div>
  );
};

const Counter2 = () => {
  const count2 = useContextSelector(context, v => v[0].count2);
  const setState = useContextSelector(context, v => v[1]);
  const increment = () => setState(s => ({
    ...s,
    count2: s.count2 + 1,
  }));
  return (
    <div>
      <span>Count2: {count2}</span>
      <button type="button" onClick={increment}>+1</button>
      {Math.random()}
    </div>
  );
};

const StateProvider = ({ children }) => (
  <context.Provider value={useState({ count1: 0, count2: 0 })}>
    {children}
  </context.Provider>
);

const App = () => (
  <StateProvider>
    <Counter1 />
    <Counter2 />
  </StateProvider>
);

ReactDOM.render(<App />, document.getElementById('app'));
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### createContext

This creates a special context for `useContextSelector`.

#### Parameters

*   `defaultValue` **Value** 

#### Examples

```javascript
import { createContext } from 'use-context-selector';

const PersonContext = createContext({ firstName: '', familyName: '' });
```

### useContextSelector

This hook returns context selected value by selector.

It will only accept context created by `createContext`.
It will trigger re-render if only the selected value is referentially changed.

The selector should return referentially equal result for same input for better performance.

#### Parameters

*   `context` **Context\<Value>** 
*   `selector` **function (value: Value): Selected** 

#### Examples

```javascript
import { useContextSelector } from 'use-context-selector';

const firstName = useContextSelector(PersonContext, state => state.firstName);
```

### useContext

This hook returns the entire context value.
Use this instead of React.useContext for consistent behavior.

#### Parameters

*   `context` **Context\<Value>** 

#### Examples

```javascript
import { useContext } from 'use-context-selector';

const person = useContext(PersonContext);
```

### useContextUpdate

This hook returns an update function that accepts a thunk function

Use this for a function that will change a value in
[Concurrent Mode](https://reactjs.org/docs/concurrent-mode-intro.html).
Otherwise, there's no need to use this hook.

#### Parameters

*   `context` **Context\<Value>** 

#### Examples

```javascript
import { useContextUpdate } from 'use-context-selector';

const update = useContextUpdate();
update(() => setState(...));
```

### BridgeProvider

This is a Provider component for bridging multiple react roots

#### Parameters

*   `$0` **{context: Context\<any>, value: any, children: ReactNode}** 

    *   `$0.context`  
    *   `$0.value`  
    *   `$0.children`  

#### Examples

```javascript
const valueToBridge = useBridgeValue(PersonContext);
return (
  <Renderer>
    <BridgeProvider context={PersonContext} value={valueToBridge}>
      {children}
    </BridgeProvider>
  </Renderer>
);
```

### useBridgeValue

This hook return a value for BridgeProvider

#### Parameters

*   `context` **Context\<any>** 

## Limitations

*   In order to stop propagation, `children` of a context provider has to be either created outside of the provider or memoized with `React.memo`.
*   Provider trigger re-renders only if the context value is referentially changed.
*   Neither context consumers or class components are supported.
*   The [stale props](https://react-redux.js.org/api/hooks#stale-props-and-zombie-children) issue can't be solved in userland.
*   Tearing is only avoided if all consumers get data using `useContextSelector`. If you use both props and `use-context-selector` to pass the same data, they may provide inconsistence data for a brief moment. (`02_tearing_spec` fails)

## Examples

The [examples](examples) folder contains working examples.
You can run one of them with

```bash
PORT=8080 yarn run examples:01_minimal
```

and open <http://localhost:8080> in your web browser.

You can also try them in codesandbox.io:
[01](https://codesandbox.io/s/github/dai-shi/use-context-selector/tree/main/examples/01\_minimal)
[02](https://codesandbox.io/s/github/dai-shi/use-context-selector/tree/main/examples/02\_typescript)

## Projects that use use-context-selector

*   [react-tracked](https://github.com/dai-shi/react-tracked)
*   [use-atom](https://github.com/dai-shi/use-atom)
*   [formik v3.0.0-next.8](https://github.com/formium/formik/pull/2846)
