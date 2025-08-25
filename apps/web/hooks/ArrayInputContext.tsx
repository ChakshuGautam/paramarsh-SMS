<<<<<<< HEAD
import { createContext, useContext } from "react";
=======
import { createContext } from "react";
>>>>>>> origin/main
import { UseFieldArrayReturn } from "react-hook-form";

/**
 * A React context that provides access to an ArrayInput methods as provided by react-hook-form
 * Useful to create custom array input iterators.
 * @deprecated Use ra-core `ArrayInputContext` once available.
 * @see {ArrayInput}
 * @see {@link https://react-hook-form.com/docs/usefieldarray}
 */
export const ArrayInputContext = createContext<
  ArrayInputContextValue | undefined
>(undefined);

/**
 * @deprecated Use ra-core `ArrayInputContextValue` once available.
 */
export type ArrayInputContextValue = UseFieldArrayReturn;
<<<<<<< HEAD

/**
 * Hook to access the ArrayInput context
 * @deprecated Use ra-core `useArrayInputContext` once available.
 */
export const useArrayInputContext = (): ArrayInputContextValue => {
  const context = useContext(ArrayInputContext);
  if (context === undefined) {
    throw new Error(
      "useArrayInputContext must be used within an ArrayInput component"
    );
  }
  return context;
};
=======
>>>>>>> origin/main
