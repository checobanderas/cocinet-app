import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonBadge, IonButton, IonIcon, IonText } from '@ionic/react';
import { chatbubbleEllipsesOutline, checkmarkOutline, closeCircleOutline, refreshOutline, shieldCheckmarkOutline } from 'ionicons/icons';

interface PrecuentaItemViewProps {
  cancellationReason: any;
  handleRevertItemCancellation: any;
  itemsSelectedForCancellation: any;
  selectedTable: any;
  setItemsSelectedForCancellation: any;
  setPendingCancellationTarget: any;
  setShowAuthorizeCancellationModal: any;
  item: any;
  showDeletefalse: any;
  folio: any;
  index: any;
}

export const PrecuentaItemView: React.FC<PrecuentaItemViewProps> = ({
  cancellationReason,
  folio,
  handleRevertItemCancellation,
  index,
  item,
  itemsSelectedForCancellation,
  selectedTable,
  setItemsSelectedForCancellation,
  setPendingCancellationTarget,
  setShowAuthorizeCancellationModal,
  showDeletefalse
}) => {
const isCancelled = item.isCancelled;
    const isPendingCancellation = item.isPendingCancellation;
    const canSelect = showDelete && !isCancelled && !isPendingCancellation && folio !== undefined;
    const isSelected = canSelect && (itemsSelectedForCancellation || []).some(
      (it) => it.folio === folio && it.productId === item.product.id && it.plate === item.plate
    );

    return (
      <div
        key={`item-${item.product.id}-${item.plate}-${folio}-${index}`}
        onClick={() => {
          if (canSelect) {
            const newItem = { folio, productId: item.product.id, plate: item.plate };
            if (isSelected) {
              setItemsSelectedForCancellation(prev => prev.filter(it => !(it.folio === folio && it.productId === item.product.id && it.plate === item.plate)));
            } else {
              setItemsSelectedForCancellation(prev => [...prev, newItem]);
            }
          }
        }}
        style={{
          background: isSelected ? "#fff1f2" : "white",
          borderBottom: "1px solid #f1f5f9",
          opacity: isCancelled ? 0.6 : 1,
          cursor: canSelect ? "pointer" : "default",
        }}
      >
        <div style={{ padding: "8px 12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, marginRight: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              {canSelect && (
                <div 
                  className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                    isSelected ? "bg-rose-500 border-rose-500 shadow-sm" : "bg-white border-slate-300 hover:border-rose-400"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newItem = { folio, productId: item.product.id, plate: item.plate };
                    if (isSelected) {
                      setItemsSelectedForCancellation(prev => prev.filter(it => !(it.folio === folio && it.productId === item.product.id && it.plate === item.plate)));
                    } else {
                      setItemsSelectedForCancellation(prev => [...prev, newItem]);
                    }
                  }}
                >
                  {isSelected && <IonIcon icon={checkmarkOutline} className="text-white text-xs font-black" />}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {item.plate > 0 && (
                    <IonBadge
                      style={{
                        background: getComensalColor(item.plate),
                        fontSize: "0.65rem",
                        fontWeight: "900",
                        borderRadius: "6px",
                        padding: "2px 6px",
                      }}
                    >
                      C{item.plate}
                    </IonBadge>
                  )}
                  <h3
                    style={{
                      fontWeight: "900",
                      margin: 0,
                      fontSize: "0.95rem",
                      color: isCancelled ? "#94a3b8" : isPendingCancellation ? "#b45309" : "#1e293b",
                      lineHeight: "1.2",
                      textDecoration: isCancelled ? "line-through" : "none",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {getFormattedProductName(item.product)}
                  </h3>
                  {isPendingCancellation && (
                    <IonBadge color="warning" style={{ fontSize: "0.6rem", fontWeight: "bold" }}>EN ESPERA ⏳</IonBadge>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      fontWeight: "bold",
                    }}
                  >
                    ${item.product.price.toFixed(2)}
                  </span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.7rem" }}>•</span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: isCancelled ? "#94a3b8" : isPendingCancellation ? "#b45309" : "#10b981",
                      fontWeight: "900",
                      textDecoration: isCancelled ? "line-through" : "none",
                    }}
                  >
                    ${(item.quantity * item.product.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IonText
                style={{
                  fontWeight: "900",
                  fontSize: "1.1rem",
                  color: isCancelled ? "#94a3b8" : isPendingCancellation ? "#b45309" : "#1e293b",
                }}
              >
                x{item.quantity}
              </IonText>

              {isPendingCancellation && folio !== undefined && (
                <div className="flex gap-1">
                   <IonButton
                      fill="clear"
                      color="danger"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // This will show a PIN modal to authorize
                        setPendingCancellationTarget({ type: 'item', id: selectedTable!.id, items: [{ folio, productId: item.product.id, plate: item.plate }] });
                        setShowAuthorizeCancellationModal(true);
                      }}
                    >
                      <IonIcon icon={shieldCheckmarkOutline} slot="icon-only" />
                   </IonButton>
                   <IonButton
                      fill="clear"
                      color="medium"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevertItemCancellation(selectedTable!.id, selectedTable, folio, item.product.id, item.plate);
                      }}
                    >
                      <IonIcon icon={refreshOutline} slot="icon-only" />
                   </IonButton>
                </div>
              )}
            </div>
          </div>

          {item.notes && (
            <div
              style={{
                marginTop: "8px",
                background: "#fff7ed",
                padding: "8px 12px",
                borderRadius: "10px",
                fontSize: "0.8rem",
                color: "#c2410c",
                border: "1px solid #ffedd5",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <IonIcon
                icon={chatbubbleEllipsesOutline}
                style={{ fontSize: "0.9rem", marginTop: "2px" }}
              />
              <span style={{ fontWeight: "bold", lineHeight: "1.4" }}>
                {item.notes}
              </span>
            </div>
          )}

          {isCancelled && (
            <div
              style={{
                marginTop: "8px",
                background: "#fef2f2",
                padding: "8px 12px",
                borderRadius: "10px",
                fontSize: "0.75rem",
                color: "#b91c1c",
                border: "1px solid #fee2e2",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <IonIcon icon={closeCircleOutline} />
                CANCELADO
              </div>
              <div style={{ marginTop: "2px" }}>
                Motivo: {item.cancellationReason}
              </div>
              {item.cancelledBy && (
                <div style={{ marginTop: "2px", opacity: 0.8 }}>
                  Por: {item.cancelledBy.name}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
};
