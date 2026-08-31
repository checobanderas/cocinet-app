import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { checkTenantSalesCount, deleteAllProductsFromFirebase } from "../../utils/firestore";

interface PurgeZeroSalesProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTenant: any;
  COMPANY_CATALOG: any[];
  products: any[];
  triggerAppNotification: (title: string, msg: string, type: "success" | "warning" | "error" | "info") => void;
  onPurgeSuccess?: () => void;
}

export const PurgeZeroSalesProductsModal: React.FC<PurgeZeroSalesProductsModalProps> = ({
  isOpen,
  onClose,
  selectedTenant,
  COMPANY_CATALOG,
  products,
  triggerAppNotification,
  onPurgeSuccess,
}) => {
  const [step, setStep] = useState<number>(0);
  const [isCheckingSales, setIsCheckingSales] = useState<boolean>(true);
  const [salesCount, setSalesCount] = useState<number>(0);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [confirmationInput, setConfirmationInput] = useState<string>("");
  const [includeSiblingBranches, setIncludeSiblingBranches] = useState<string[]>([]);

  // Check sales on open
  useEffect(() => {
    if (!isOpen || !selectedTenant) return;
    setStep(0);
    setConfirmationInput("");
    setIsCheckingSales(true);

    checkTenantSalesCount(selectedTenant.id)
      .then((count) => {
        setSalesCount(count);
        setIsCheckingSales(false);
      })
      .catch((err) => {
        console.error("Error al verificar ventas:", err);
        setSalesCount(0);
        setIsCheckingSales(false);
      });

    // Auto-select sibling branches with same ownerKey
    const siblings = COMPANY_CATALOG.filter(
      (c) =>
        c.id !== selectedTenant.id &&
        (selectedTenant.ownerKey ? c.ownerKey === selectedTenant.ownerKey : false)
    ).map((c) => c.id);
    setIncludeSiblingBranches(siblings);
  }, [isOpen, selectedTenant, COMPANY_CATALOG]);

  const handleExecutePurge = async () => {
    if (salesCount > 0) {
      triggerAppNotification("Acción Bloqueada ⛔", "Esta sucursal tiene ventas registradas y no puede ser purgada.", "error");
      return;
    }

    if (confirmationInput.trim().toUpperCase() !== "LIMPIAR") {
      triggerAppNotification("Confirmación Requerida ⚠️", "Debes escribir exactamente la palabra LIMPIAR.", "warning");
      return;
    }

    setIsPurging(true);
    try {
      // 1. Purge selected current tenant
      await deleteAllProductsFromFirebase(
        selectedTenant.id,
        selectedTenant.name || "Sucursal",
        products
      );

      // 2. Purge any selected sibling branches
      const purgedNames = [selectedTenant.name];
      for (const branchId of includeSiblingBranches) {
        const branchObj = COMPANY_CATALOG.find((c) => c.id === branchId);
        const branchName = branchObj ? branchObj.name : branchId;
        // Verify sales count of sibling branch before purging
        const siblingSales = await checkTenantSalesCount(branchId);
        if (siblingSales === 0) {
          await deleteAllProductsFromFirebase(branchId, branchName, []);
          purgedNames.push(branchName);
        }
      }

      triggerAppNotification(
        "¡Catálogo Vaciado con Éxito! 🧹",
        `Se han eliminado de forma limpia los productos de: ${purgedNames.join(", ")}. Ahora puedes subir tu Excel en blanco.`,
        "success"
      );

      if (onPurgeSuccess) {
        onPurgeSuccess();
      }
      onClose();
    } catch (error: any) {
      console.error("Error al purgar productos:", error);
      triggerAppNotification("Error ❌", error.message || "Ocurrió un error al purgar los productos.", "error");
    } finally {
      setIsPurging(false);
    }
  };

  const siblingBranches = COMPANY_CATALOG.filter(
    (c) =>
      c.id !== selectedTenant?.id &&
      (selectedTenant?.ownerKey ? c.ownerKey === selectedTenant.ownerKey : false)
  );

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} style={{ "--max-width": "560px", "--border-radius": "20px" }}>
      <IonHeader>
        <IonToolbar style={{ "--background": "#881337", "--color": "white" }}>
          <IonTitle style={{ fontSize: "1rem", fontWeight: "900" }}>
            🧹 Purga y Limpieza Segura de Catálogo
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} disabled={isPurging} style={{ color: "white" }}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ "--background": "#f8fafc" }}>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {isCheckingSales ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div className="animate-spin" style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
                ⏳
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>
                Auditando historial de ventas...
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "6px" }}>
                Verificando candados de seguridad en Firebase para <strong>{selectedTenant?.name}</strong>.
              </p>
            </div>
          ) : salesCount > 0 ? (
            <div style={{ background: "#fef2f2", border: "1.5px solid #ef4444", borderRadius: "16px", padding: "20px", color: "#991b1b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "2rem" }}>⛔</span>
                <div>
                  <h3 style={{ margin: 0, fontWeight: "900", fontSize: "1.05rem" }}>
                    ACCIÓN BLOQUEADA POR SEGURIDAD
                  </h3>
                  <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>
                    Candado 1 Activado: Detección de Ventas Reales
                  </span>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", lineHeight: "1.5", margin: "10px 0" }}>
                Esta sucursal (<strong>{selectedTenant?.name}</strong>) cuenta con <strong>{salesCount} transacciones / tickets de venta registrados</strong>.
              </p>
              <p style={{ fontSize: "0.8rem", lineHeight: "1.4", margin: 0, opacity: 0.9 }}>
                Para proteger la integridad de tus finanzas y reportes contables, el borrado físico está estrictamente prohibido en sucursales con actividad comercial.
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{
                  marginTop: "16px",
                  padding: "10px 20px",
                  background: "#dc2626",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Cerrar Ventana
              </button>
            </div>
          ) : (
            <>
              {/* PASO 0: Candado 1 Verificado */}
              {step === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "14px", padding: "16px", color: "#065f46" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "0.95rem" }}>
                      <span>🛡️</span> CANDADO 1: VERIFICADO (0 VENTAS)
                    </div>
                    <p style={{ margin: "6px 0 0 0", fontSize: "0.82rem", lineHeight: "1.4" }}>
                      La sucursal <strong>"{selectedTenant?.name}"</strong> es totalmente nueva y no cuenta con ventas registradas. Es 100% seguro vaciar sus productos.
                    </p>
                  </div>

                  <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#1e293b", marginBottom: "8px" }}>
                      Resumen de la Sucursal Actual:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.82rem", color: "#475569", lineHeight: "1.5" }}>
                      <li>Sucursal: <strong>{selectedTenant?.name}</strong> ({selectedTenant?.type || "Sucursal"})</li>
                      <li>Productos actuales por limpiar: <strong>{products.filter(p => !p.isDeleted).length} productos</strong></li>
                      <li>Ventas históricas: <strong style={{ color: "#059669" }}>0 tickets (Limpio)</strong></li>
                    </ul>
                  </div>

                  {siblingBranches.length > 0 && (
                    <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "14px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "bold", color: "#334155", display: "block", marginBottom: "8px" }}>
                        🧹 ¿Deseas vaciar también las otras sucursales hermanas de este propietario?
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {siblingBranches.map((b) => (
                          <label key={b.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#1e293b", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={includeSiblingBranches.includes(b.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setIncludeSiblingBranches((prev) => [...prev, b.id]);
                                } else {
                                  setIncludeSiblingBranches((prev) => prev.filter((id) => id !== b.id));
                                }
                              }}
                            />
                            <span>{b.name} ({b.type || "Sucursal"})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "#be123c",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Continuar al Paso 2 (Respaldo) ➔
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      style={{
                        padding: "12px 18px",
                        background: "white",
                        color: "#64748b",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "1.5px solid #cbd5e1",
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 1: Candado 2 Respaldo Automático */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "16px", color: "#1e40af" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "0.95rem" }}>
                      <span>💾</span> CANDADO 2: RESPALDO AUTOMÁTICO DE SEGURIDAD
                    </div>
                    <p style={{ margin: "6px 0 0 0", fontSize: "0.82rem", lineHeight: "1.4" }}>
                      Antes de ejecutar la eliminación física, el sistema guardará automáticamente una copia en tu historial de respaldos en Firebase (colección <code>menu_backups</code>).
                    </p>
                  </div>

                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "14px", padding: "16px", color: "#92400e" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "0.88rem", fontWeight: "bold" }}>
                      ⚠️ Aviso sobre el Borrado Físico
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: "1.4" }}>
                      Los productos dummy actuales desaparecerán por completo para que el catálogo quede en <strong>0 productos</strong>. No quedará rastro de categorías no deseadas.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "#be123c",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Continuar al Paso 3 (Confirmación Final) ➔
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      style={{
                        padding: "12px 18px",
                        background: "white",
                        color: "#64748b",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "1.5px solid #cbd5e1",
                        cursor: "pointer",
                      }}
                    >
                      Regresar
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2: Candado 3 Confirmación Explícita */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "#fff1f2", border: "1.5px solid #f43f5e", borderRadius: "14px", padding: "16px", color: "#9f1239" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "900", fontSize: "0.95rem" }}>
                      <span>⚠️</span> CANDADO 3: CONFIRMACIÓN ESCRITA FINAL
                    </div>
                    <p style={{ margin: "8px 0 0 0", fontSize: "0.82rem", lineHeight: "1.4" }}>
                      Para confirmar el vaciado completo de <strong>"{selectedTenant?.name}"</strong>
                      {includeSiblingBranches.length > 0 && ` y ${includeSiblingBranches.length} sucursal(es) adicional(es)`}, escribe la palabra <strong>LIMPIAR</strong> a continuación:
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={confirmationInput}
                      onChange={(e) => setConfirmationInput(e.target.value)}
                      placeholder="Escribe LIMPIAR aquí"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "2px solid #be123c",
                        outline: "none",
                        textAlign: "center",
                        letterSpacing: "2px",
                        background: "white",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button
                      type="button"
                      disabled={confirmationInput.trim().toUpperCase() !== "LIMPIAR" || isPurging}
                      onClick={handleExecutePurge}
                      style={{
                        flex: 1,
                        padding: "14px",
                        background: confirmationInput.trim().toUpperCase() === "LIMPIAR" && !isPurging ? "#be123c" : "#cbd5e1",
                        color: "white",
                        fontWeight: "900",
                        borderRadius: "12px",
                        border: "none",
                        cursor: confirmationInput.trim().toUpperCase() === "LIMPIAR" && !isPurging ? "pointer" : "not-allowed",
                        fontSize: "0.95rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      {isPurging ? (
                        <>
                          <span className="animate-spin">🔄</span>
                          Purgando catálogo en Firebase...
                        </>
                      ) : (
                        <>
                          <span>🔥</span>
                          CONFIRMAR Y VACIAR CATÁLOGO AHORA
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isPurging}
                      onClick={() => setStep(1)}
                      style={{
                        padding: "12px 18px",
                        background: "white",
                        color: "#64748b",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "1.5px solid #cbd5e1",
                        cursor: "pointer",
                      }}
                    >
                      Regresar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};
