import { type PropsWithChildren } from "react";
import { PhoneFrame } from "./PhoneFrame";

export function MobileRuntime({ children }: PropsWithChildren) {
  return <PhoneFrame>{children}</PhoneFrame>;
}
