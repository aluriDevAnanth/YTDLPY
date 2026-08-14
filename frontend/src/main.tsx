import "primeicons/primeicons.css";
import { PrimeReactProvider } from "primereact/api";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import "./index.css";
import { globalPT } from "./pt.ts";

createRoot(document.getElementById("root")!).render(
  <PrimeReactProvider value={{ pt: globalPT }}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </PrimeReactProvider>,
);
