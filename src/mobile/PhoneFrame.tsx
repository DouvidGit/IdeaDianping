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

  // ✅ 彻底删除：手机缩放、边框图片、刘海、设备选择器、手势等功能
  // 👇 直接返回一个铺满屏幕的普通网页容器
  return (
    <ScreenPortalContext.Provider value={contextValue}>
      <div
        ref={screenRef}
        style={{
          width: "100vw",
          minHeight: "100vh", // 保证铺满高度
          overflowX: "hidden",
          overflowY: "auto", // 允许内容滚动
          background: "var(--canvas)", // 使用你定义的底色
          padding: 0,
          margin: 0,
        }}
      >
        {children}
      </div>
    </ScreenPortalContext.Provider>
  );
}
