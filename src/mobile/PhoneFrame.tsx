import { createContext, type PropsWithChildren, type RefObject, useContext, useMemo, useRef } from "react";

type ScreenPortalContextValue = {
  screenRef: RefObject<HTMLDivElement | null>;
};

const ScreenPortalContext = createContext<ScreenPortalContextValue | null>(null);

export function useScreenPortal() {
  const context = useContext(ScreenPortalContext);

  if (!context) {
    throw new Error("useScreenPortal must be used inside PhoneFrame");
  }

  return context;
}

export function PhoneFrame({ children }: PropsWithChildren) {
  const screenRef = useRef<HTMLDivElement | null>(null);
  const contextValue = useMemo(() => ({ screenRef }), []);

  // 彻底删除手机壳图片和缩放逻辑，变成纯净的 Web 容器
  return (
    <ScreenPortalContext.Provider value={contextValue}>
      <div
        ref={screenRef}
        style={{
          width: "100vw",
          minHeight: "100vh",
          overflowX: "hidden",
          overflowY: "auto",
          background: "var(--canvas)",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </div>
    </ScreenPortalContext.Provider>
  );
}
