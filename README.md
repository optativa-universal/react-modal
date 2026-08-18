# react-modal ❤️

A zero-dependency, scalable modal manager designed for state persistence and layout control.

## Setup

### 1. Wrap the Root Component

Wrap your application root with `ReactModal.Provider`.

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ReactModal from 'react-modal';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactModal.Provider>
      <App />
    </ReactModal.Provider>
  </StrictMode>,
);
```

### 2. Create a Modal Component

Define your UI component. Modals receive parameters as standard React props.

```tsx
// src/components/modals/user-modal.tsx
import React from 'react';

interface UserModalProps {
  user: string;
}

export const UserModal = ({ user }: UserModalProps) => {
  return (
    <Dialog>
      <DialogContent>
        Hi {user}!
      </DialogContent>
    </Dialog>
  );
};
```

### 3. Register the Modal

Register the component within the `ReactModal` lifecycle. Registration must happen inside a component or initialization file rendered under the provider.

```tsx
// src/components/modals/index.ts
import ReactModal from 'modal-react';
import { UserModal } from './user-modal.tsx';

ReactModal.register('user_modal', UserModal);
```

## Usage

Trigger or dismiss modals from any component using the imperative API.

```tsx
import React from 'react';
import ReactModal from 'modal-react';

export default function App() {
  return (
    <button
      onClick={() => ReactModal.show('user_modal', { user: 'user@example.com' })}
    >
      Show Modal
    </button>
  );
}
```

## Advanced: Strongly Typed Registry

For enhanced type safety and predictable argument control, you can abstract registration using TypeScript generics.

```tsx
import React from 'react';
import ReactModal from 'modal-react';
import { UserModal } from './user-modal.tsx';

// Schema for explicit modal configuration.
type ModalConfig<Id extends string, Args extends Record<string, unknown> | undefined> = {
  id: Id;
  component: React.ComponentType<any>;
  args?: Args;
};

// Application modal registry definition.
const MODALS = [
  {
    id: 'user_modal',
    component: UserModal,
    args: { user: 'string' as unknown as string }
  }
] as const;

type ModalRegistry = typeof MODALS[number];

type GetModalArgs<Id extends string> = Extract<ModalRegistry, { id: Id }> extends { args: infer Args }
  ? Args
  : undefined;

/**
 * Executes a modal action with strict type safety for identifiers and arguments.
 */
const manageModal = <Id extends ModalRegistry['id']>(
  action: 'open' | 'close',
  modalId: Id,
  ...args: GetModalArgs<Id> extends undefined ? [args?: undefined] : [args: GetModalArgs<Id>]
) => {
  const modalArgs = args[0];
  
  if (action === 'open') {
    ReactModal.show(modalId, modalArgs as Record<string, unknown>);
  }
  if (action === 'close') {
    ReactModal.hide(modalId);
  }
};

// Example usage:
// manageModal('open', 'user_modal', { user: 'user@example.com' });

// Initialize automatic registration.
MODALS.forEach((modal) => {
  ReactModal.register(modal.id, modal.component);
});
```

## Acknowledgments

This package is heavily inspired by [eBay's nice-form-react](https://github.com/eBay/nice-form-react).

## LICENSE
MIT