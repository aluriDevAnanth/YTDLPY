import "primeicons/primeicons.css";
import { PrimeReactProvider } from "primereact/api";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const ptValue = {
  pt: {
    dialog: {
      root: { className: "w-[90vw] h-[90vh]" },
      header: { className: "p-2" },
      content: { className: "flex flex-col h-full overflow-hidden p-0 px-2" },
    },
  },
};

createRoot(document.getElementById("root")!).render(
  <PrimeReactProvider value={ptValue}>
    <App />
  </PrimeReactProvider>,
);
