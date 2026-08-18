import React, { createContext, useContext, useMemo, useReducer } from 'react';

type Modal = {
    component: React.FC<any>;
    visible: boolean;
    args?: Record<string, unknown>
};

type ReducerActions = {
    type: 'modal/hide' | 'modal/show';
    opts?: Partial<
        {
            fc: React.FC<any>;
            modal_id: string;
            args: Record<string, unknown>
        }
    >;
};

const initialValue: IStoreContext = {};

let dispatch: React.ActionDispatch<[action: ReducerActions]> = () => { throw new Error('Dispatch uninitialized. Did you wrap your App in ReactModal.Provider?') };
let REGISTRY_MODALS: IStoreContext = initialValue;

type IStoreContext = { [key: string]: Modal };

const StoreModalContext = createContext<IStoreContext>(initialValue);
const IdModalContext = createContext<string | null>(null);

const reducer = (prev: IStoreContext, action: ReducerActions): IStoreContext => {
    let prevState = { ...prev };

    Object.entries(REGISTRY_MODALS).forEach((i) => {
        prevState[i[0]] = i[1];
    });

    REGISTRY_MODALS = {};

    if (Object.entries(prevState).length <= 0) { throw new Error('No registered modals') }
    if (Object.entries(prevState).filter((i) => i[0] === action.opts?.modal_id).length <= 0) throw new Error('Modal ID not found');

    switch (action.type) {
        case 'modal/hide': {
            if (!action.opts?.modal_id) throw new Error('Missing modal ID');

            return {
                ...prevState,
                [action.opts.modal_id]: {
                    ...prevState[action.opts.modal_id],
                    visible: false
                }
            };
        };
        case 'modal/show': {
            if (!action.opts?.modal_id) throw new Error('Missing modal ID');
            return {
                ...prevState,
                [action.opts.modal_id]: {
                    ...prevState[action.opts.modal_id],
                    visible: true,
                    args: action.opts?.args
                }
            };
        };
        default: {
            return prevState;
        };
    };
};


/**
 * Registers a modal component with a unique identifier.
 * @param modal_id The unique identifier for the modal.
 * @param component The React component to render.
 */
const register = (
    modal_id: string,
    component: React.FC<any>
) => {
    REGISTRY_MODALS[modal_id] = {
        component,
        visible: false
    };
};
/**
 * Hides a modal by setting its visible state to false.
 * @param modal_id The identifier of the modal to hide.
 */
const hide = (
    modal_id: string
) => {
    dispatch({
        type: 'modal/hide',
        opts: { modal_id }
    });
};

/**
 * Shows a modal by setting its visible state to true and passing arguments.
 * @param modal_id The identifier of the modal to display.
 * @param args Optional arguments to pass to the modal component.
 */
const show = (
    modal_id: string,
    args?: Record<string, unknown>
) => {
    dispatch({
        type: 'modal/show',
        opts: { modal_id, args }
    });
};

/**
 * Returns the current modal state. Must be used within a modal context.
 */
const useModal = () => {
    const modal_id = useContext(IdModalContext);
    if (!modal_id) throw new Error('Missing modal ID context');
    const modals = useContext(StoreModalContext);
    if (!modals) throw new Error('Missing store context');

    return useMemo(() => ({
        id: modal_id,
        visible: modals[modal_id].visible,
        hide: () => hide(modal_id)
    }), [modal_id, modals]);
};

/**
 * Provides the modal context to the component tree.
 */
const Provider = ({ children }: { children: React.ReactNode }) => {
    const value = useReducer(reducer, initialValue);
    dispatch = value[1];

    return (
        <>
            <StoreModalContext.Provider
                value={value[0]}
            >
                {children}

                {Object.entries(value[0]).map((i, n) => {
                    return (
                        <React.Fragment
                            key={n}
                        >
                            <ModalComp
                                modal_id={i[0]}
                                modal_info={i[1]}
                            />
                        </React.Fragment>
                    )
                })}
            </StoreModalContext.Provider>
        </>
    )
};

const ModalComp = ({ modal_id, modal_info }: { modal_id: string, modal_info: Modal }) => {
    const Comp = modal_info.component;
    return (
        <IdModalContext.Provider
            value={modal_id}
        >
            <Comp
                {...modal_info.args}
            />
        </IdModalContext.Provider>
    )
};

const ReactModal = {
    Provider,
    register,
    show,
    hide,
    useModal
};

export default ReactModal;