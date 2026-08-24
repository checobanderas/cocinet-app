import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add isTotalsPinned state
content = re.sub(
    r"(const \[showPaymentModal, setShowPaymentModal\] = useState\(false\);)",
    r"\1\n  const [isTotalsPinned, setIsTotalsPinned] = useState(true);",
    content
)

# 2. Update renderGestionCuentas left panel
# Remove "Mapa de Mesas" header and update grid
old_mesas_start = """                    <motion.div
                      key="mesas"
                      initial={{ x: -300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ height: "100%", overflowY: "auto" }}
                    >
                      <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                        <h2 style={{ color: "white", fontSize: "1.2rem", fontWeight: "bold", margin: 0 }}>📍 Mapa de Mesas</h2>
                      </div>
                      {zones.map((zone) => (
                        <div key={zone} className="ion-margin-bottom">
                          <IonText color="medium">
                            <h2
                              className="ion-padding-start"
                              style={{
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                color: "#94a3b8",
                              }}
                            >
                              {zone}
                            </h2>
                          </IonText>
                          <div style={{ display: "flex", flexWrap: "wrap", margin: "-4px" }}>"""

new_mesas_start = """                    <motion.div
                      key="mesas"
                      initial={{ x: -300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}
                    >
                      {zones.map((zone) => (
                        <div key={zone} style={{ marginBottom: "8px" }}>
                          <IonText color="medium">
                            <h2
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                color: "#94a3b8",
                                margin: "0 0 4px 8px"
                              }}
                            >
                              {zone}
                            </h2>
                          </IonText>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>"""

content = content.replace(old_mesas_start, new_mesas_start)

# Update the item rendering for tables
# Find the div that wraps the table button
old_table_wrapper = """                                  <div
                                    key={`${table.id}-${table.status}-${table.comandas?.length || 0}`}
                                    className="ion-text-center"
                                    style={{ flex: "0 0 20%", maxWidth: "20%", padding: "8px 4px", minHeight: "125px" }}
                                  >"""

new_table_wrapper = """                                  <div
                                    key={`${table.id}-${table.status}-${table.comandas?.length || 0}`}
                                    className="ion-text-center"
                                    style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100px" }}
                                  >"""
content = content.replace(old_table_wrapper, new_table_wrapper)

# Update the button content to include emoji
old_label_render = """                                      >
                                        {table.label}
                                        {hasActiveOrders && ("""

new_label_render = """                                      >
                                        {(() => {
                                          const z = (table.zone || "").toLowerCase();
                                          const l = (table.label || "").toLowerCase();
                                          if (z.includes("llevar") || l.includes("llevar")) return "🛍️ " + table.label;
                                          if (z.includes("domicilio") || l.includes("domicilio") || z.includes("reparto") || l.includes("reparto")) return "🛵 " + table.label;
                                          return table.label;
                                        })()}
                                        {hasActiveOrders && ("""
content = content.replace(old_label_render, new_label_render)

# Reduce size of the button to fit grid better
content = content.replace("""width: "72px",
                                        height: "72px",""", """width: "64px",
                                        height: "64px",""")
content = content.replace("""fontSize: "1.5rem",""", """fontSize: "1.2rem",""")

# 3. Add the "Pin" toggle to totals in renderClosedAccountsList
old_totals_header = """            {/* Sales Summary Cards */}
            <div
              style={{
                display: "grid","""

new_totals_header = """            {/* Pinned Totals Toggle */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
              <button 
                onClick={() => setIsTotalsPinned(!isTotalsPinned)}
                style={{
                  background: isTotalsPinned ? "#3b82f6" : "#475569",
                  color: "white",
                  border: "none",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}
              >
                {isTotalsPinned ? "📌 Totals Pinned" : "📌 Totals Hidden"}
              </button>
            </div>
            {/* Sales Summary Cards */}
            <AnimatePresence>
            {isTotalsPinned && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
            <div
              style={{
                display: "grid","""

content = content.replace(old_totals_header, new_totals_header)

# Close the motion.div for totals
old_totals_end = """                  transform:
                    paymentMethodFilter === "all" ? "scale(1.03)" : "scale(1)",
                }}
              >
                <div style={{ fontSize: "0.65rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  TOTAL VENTA
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: "900", color: "#f8fafc", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                    ${(
                      totalCashFromAccounts +
                      totalCardFromAccounts +
                      totalLuPayFromAccounts
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>"""

new_totals_end = """                  transform:
                    paymentMethodFilter === "all" ? "scale(1.03)" : "scale(1)",
                }}
              >
                <div style={{ fontSize: "0.65rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  TOTAL VENTA
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: "900", color: "#f8fafc", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                    ${(
                      totalCashFromAccounts +
                      totalCardFromAccounts +
                      totalLuPayFromAccounts
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            </motion.div>
            )}
            </AnimatePresence>"""

content = content.replace(old_totals_end, new_totals_end)


with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("UI tweaks applied successfully.")
