import { MobileDeviceProvider } from "./mobile";
import Prototype from "./Prototype";

export default function App() {
  return (
    <MobileDeviceProvider>
      <Prototype />
    </MobileDeviceProvider>
  );
}
