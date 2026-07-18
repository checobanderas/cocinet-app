import * as fs from "fs";

let code = fs.readFileSync("src/App.tsx", "utf-8");

// 1. Add "ia-insumos" to appMode union
code = code.replace(
  `| "dashboard"`,
  `| "dashboard"\n    | "ia-insumos"`
);

// 2. Add render condition to master render layout
// We'll insert it right before `{appMode === "corte-express" && renderCorteExpress()}` or similar.
code = code.replace(
  `{appMode === "inventory" && renderAdminInventory()}`,
  `{appMode === "inventory" && renderAdminInventory()}\n          {appMode === "ia-insumos" && renderIAInsumos()}`
);

// 3. Add to the list of appMode conditions NOT to renderLogin
code = code.replace(
  `appMode !== "inventory" &&`,
  `appMode !== "inventory" &&\n      appMode !== "ia-insumos" &&`
);

// 4. Add the button in renderSidebar
const buttonCode = `
                    <button
                      onClick={() => {
                        setAppMode("ia-insumos");
                        setShowSidebar(false);
                      }}
                      className={\`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-left \${
                        appMode === "ia-insumos"
                          ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30"
                          : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      }\`}
                    >
                      <IonIcon
                        icon={hardwareChipOutline}
                        style={{ fontSize: "16px", color: "#c084fc" }}
                      />
                      <span className="font-bold">Asistente de Insumos IA 🧠</span>
                    </button>
`;

code = code.replace(
  `{/* REPORTES SECTION */}`,
  `${buttonCode}\n\n                {/* REPORTES SECTION */}`
);

fs.writeFileSync("src/App.tsx", code);
console.log("Patched App.tsx for basic ia-insumos entry");
