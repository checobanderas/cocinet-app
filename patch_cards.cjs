const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const [showCuentasSummary, setShowCuentasSummary] = useState(false);')) {
  code = code.replace(
    /const \[showDeviceRequestsModal, setShowDeviceRequestsModal\] = useState\(false\);/,
    'const [showDeviceRequestsModal, setShowDeviceRequestsModal] = useState(false);\n  const [showCuentasSummary, setShowCuentasSummary] = useState(false);'
  );
}

const targetGridStart = `{/* Sales Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
                marginBottom: "16px",
              }}
            >`;

const replacementGridStart = `{/* Expand/Collapse Summary Button */}
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCuentasSummary(!showCuentasSummary)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s"
                }}
                className="hover:bg-white/20"
              >
                {showCuentasSummary ? "Ocultar Resumen 🔼" : "Ver Resumen de Ventas 📊"}
              </button>
            </div>
            {/* Sales Summary Cards */}
            {showCuentasSummary && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
                marginBottom: "16px",
                animation: "fadeIn 0.3s ease-out"
              }}
            >`;

code = code.replace(targetGridStart, replacementGridStart);

const targetGridEnd = `                  {paymentMethodFilter === "all" && "🎯"}
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: "900" }}>
                  $
                  {historyForCuentasTab
                    .filter((a) => a.status !== "cancelled")
                    .reduce((sum, a) => sum + a.total, 0)
                    .toFixed(2)}
                </div>
              </div>
            </div>

            {/* Filter Notice Banner if active */}`;

const replacementGridEnd = `                  {paymentMethodFilter === "all" && "🎯"}
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: "900" }}>
                  $
                  {historyForCuentasTab
                    .filter((a) => a.status !== "cancelled")
                    .reduce((sum, a) => sum + a.total, 0)
                    .toFixed(2)}
                </div>
              </div>
            </div>
            )}

            {/* Filter Notice Banner if active */}`;

code = code.replace(targetGridEnd, replacementGridEnd);

fs.writeFileSync('src/App.tsx', code);
console.log('Patch applied successfully!');
