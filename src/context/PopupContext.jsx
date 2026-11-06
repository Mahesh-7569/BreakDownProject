import { createContext, useCallback, useContext, useRef, useState } from "react";
import CustomPopup from "../components/common/CustomPopup";

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [popup, setPopup] = useState(null);
  const resolverRef = useRef(null);

  const closePopup = useCallback((result = true) => {
    setPopup(null);

    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const showAlert = useCallback(
    ({ type = "info", title = "Information", message = "" }) => {
      return new Promise((resolve) => {
        resolverRef.current = resolve;

        setPopup({
          mode: "alert",
          type,
          title,
          message,
        });
      });
    },
    []
  );

  const showConfirm = useCallback(
    ({
      type = "warning",
      title = "Confirmation",
      message = "",
    }) => {
      return new Promise((resolve) => {
        resolverRef.current = resolve;

        setPopup({
          mode: "confirm",
          type,
          title,
          message,
        });
      });
    },
    []
  );

  return (
    <PopupContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {popup && (
        <CustomPopup
          {...popup}
          onClose={() => closePopup(false)}
          onConfirm={() => closePopup(true)}
        />
      )}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);

  if (!context) {
    throw new Error("usePopup must be used inside PopupProvider");
  }

  return context;
}