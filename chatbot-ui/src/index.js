import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Make the entire page dark
document.body.style.backgroundColor = "#121212";  // dark grey/black
document.body.style.color = "#fff";
document.body.style.margin = 0;
document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
