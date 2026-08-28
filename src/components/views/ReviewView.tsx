import { formatTableName } from '../../utils/formatters';
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonBadge, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonLabel, IonList, IonPage, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { arrowBackOutline, chatbubbleEllipsesOutline, closeOutline, fastFoodOutline, restaurantOutline } from 'ionicons/icons';

interface ReviewViewProps {
  appMode: any;
  cart: any;
  checkoutReturnMode: any;
  currentUser: any;
  generalNotes: any;
  isGeneratingOrder: any;
  renderReviewItem: any;
  reviewComensal: any;
  selectedTable: any;
  setAppMode: any;
  setCart: any;
  setCheckoutReturnMode: any;
  setConfirmRestart: any;
  setGeneralNotes: any;
  setReviewComensal: any;
  setSelectedTableGestion: any;
  generateOrder: any;
  getComensalColor: any;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  appMode,
  cart,
  checkoutReturnMode,
  currentUser,
  generalNotes,
  isGeneratingOrder,
  renderReviewItem,
  reviewComensal,
  selectedTable,
  setAppMode,
  setCart,
  setCheckoutReturnMode,
  setConfirmRestart,
  setGeneralNotes,
  setReviewComensal,
  setSelectedTableGestion,
  generateOrder, getComensalColor
}) => {
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small timeout ensures the DOM has updated with the new item before we scroll
    const timer = setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
    return () => clearTimeout(timer);
  }, [cart.length]);

const totalPrice = cart.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );
    const comensales = Array.from(new Set(cart.map((item) => item.plate))).sort(
      (a: any, b: any) => a - b,
    ) as number[];

    return (
      <IonPage>
        {appMode !== "gestion_cuentas" && (
          <IonHeader className="ion-no-border">
            <IonToolbar
              style={{ "--background": "rgb(40, 45, 52)", "--color": "white" }}
            >
            <IonButtons slot="start">
              <IonButton onClick={() => setAppMode("menu")}>
                <IonIcon icon={arrowBackOutline} slot="icon-only" />
              </IonButton>
              <div
                style={{
                  marginLeft: "8px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "900",
                    color: "white",
                  }}
                >
                  {formatTableName(selectedTable?.zone || '', selectedTable?.label)}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    color: "rgba(255,255,255,0.8)",
                    textTransform: "uppercase",
                  }}
                >
                  {currentUser?.name}
                </span>
              </div>
            </IonButtons>
            <IonTitle style={{ fontSize: "1rem", fontWeight: "bold" }}>
              Revisar Pedido
            </IonTitle>
            <IonButtons slot="end">
              <IonButton
                onClick={() => setAppMode("floorplan")}
                color="light"
                fill="clear"
              >
                <IonIcon icon={closeOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        )}
        <IonContent style={{ "--background": "#f1f5f9" }}>
          {/* Standardized Comensal Selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              gap: "10px",
              overflowX: "auto",
              background: "white",
              borderBottom: "1px solid #e2e8f0",
              position: "sticky",
              top: 0,
              zIndex: 10,
              scrollbarWidth: "none",
            }}
            className="no-scrollbar"
          >
            <div
              onClick={() => {
                if (
                  window.confirm(
                    "⚠️ ¿Estas seguro de reiniciar este pedido? (Se eliminarán los productos de la memoria)",
                  )
                ) {
                  setCart([]);
                  setReviewComensal(1);
                  setGeneralNotes("");
                  setConfirmRestart(false);
                  if (checkoutReturnMode === "gestion_cuentas") {
                    // Do not close the view, just keep it open empty.
                    // (Optional: could also keep the table selected)
                  }
                  setCheckoutReturnMode(null);
                }
              }}
              style={{
                minWidth: "140px",
                height: "42px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fee2e2",
                color: "#dc2626",
                fontWeight: "900",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                transition: "all 0.2s ease",
                border: "1px solid #fecaca",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(220, 38, 38, 0.1)",
                flexShrink: 0,
              }}
            >
              Reiniciar Pedido 🗑️
            </div>
            
            {/* + SEPARADOR BUTTON MOVED HERE */}
            <div
              onClick={() => {
                const comensalNum = reviewComensal === "summary" ? 1 : reviewComensal;
                const newSep = {
                  isSeparator: true,
                  separatorLabel: "--- PLATO ---",
                  plate: comensalNum,
                  quantity: 0,
                  product: { id: `sep_${Date.now()}`, name: "--- PLATO ---", price: 0, category: "separators" } as any
                };
                setCart([...cart, newSep]);
              }}
              style={{
                padding: "0 12px",
                height: "42px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#059669",
                color: "white",
                fontWeight: "900",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                transition: "all 0.2s ease",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(5, 150, 105, 0.2)",
                flexShrink: 0,
              }}
            >
              + Separador
            </div>
            {comensales
              .filter((n) => n > 0)
              .map((num) => (
                <div
                  key={num}
                  onClick={() => setReviewComensal(num)}
                  style={{
                    minWidth: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      reviewComensal === num
                        ? getComensalColor(num)
                        : "#f8fafc",
                    color: reviewComensal === num ? "white" : "#64748b",
                    fontWeight: "900",
                    fontSize: "1.1rem",
                    transition: "all 0.2s ease",
                    border:
                      reviewComensal === num ? "none" : "1px solid #e2e8f0",
                    cursor: "pointer",
                    boxShadow:
                      reviewComensal === num
                        ? `0 4px 10px ${getComensalColor(num)}44`
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {num}
                </div>
              ))}
            <div
              onClick={() => setReviewComensal("summary")}
              style={{
                minWidth: "100px",
                height: "42px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  reviewComensal === "summary" ? "#0f172a" : "#f8fafc",
                color: reviewComensal === "summary" ? "white" : "#64748b",
                fontWeight: "900",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                transition: "all 0.2s ease",
                boxShadow:
                  reviewComensal === "summary"
                    ? "0 4px 12px -2px rgba(15, 23, 42, 0.4)"
                    : "none",
                border:
                  reviewComensal === "summary" ? "none" : "1px solid #e2e8f0",
                cursor: "pointer",
                marginLeft: "auto",
                flexShrink: 0,
              }}
            >
              Resumen
            </div>
          </div>

          {/* Tab Content */}
          {reviewComensal !== "summary" ? (
            <div
              key={reviewComensal}
              style={{ animation: "fadeIn 0.3s ease-out" }}
            >
              {(() => {
                const comensalNum = reviewComensal as number;
                const allComensalItems = cart.filter(
                  (item) => item.plate === comensalNum,
                );
                const entradas = allComensalItems.filter(
                  (item) => item.product.subcategory === "Entradas",
                );
                const otherItems = allComensalItems.filter(
                  (item) => item.product.subcategory !== "Entradas",
                );

                if (allComensalItems.length === 0) {
                  return (
                    <div
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                      }}
                    >
                      <IonIcon
                        icon={restaurantOutline}
                        style={{
                          fontSize: "3rem",
                          marginBottom: "12px",
                          opacity: 0.3,
                        }}
                      />
                      <p style={{ fontWeight: "bold" }}>
                        No hay platillos para este comensal
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    style={{
                      margin: "12px",
                      background: "white",
                      borderRadius: "20px",
                      overflow: "hidden",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  >
                    <IonList style={{ background: "transparent", padding: 0 }}>
                      {allComensalItems.map((item, idx) => {
                        const globalIndex = cart.indexOf(item);
                        return (
                          <div
                            key={`dnd-${globalIndex}-${item.product?.id || idx}`}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", globalIndex.toString());
                              e.currentTarget.style.opacity = "0.5";
                            }}
                            onDragEnd={(e) => {
                              e.currentTarget.style.opacity = "1";
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const draggedGlobalIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                              const targetGlobalIdx = globalIndex;
                              if (draggedGlobalIdx !== targetGlobalIdx && !isNaN(draggedGlobalIdx)) {
                                const newCart = [...cart];
                                const [draggedItem] = newCart.splice(draggedGlobalIdx, 1);
                                newCart.splice(targetGlobalIdx, 0, draggedItem);
                                setCart(newCart);
                              }
                            }}
                          >
                            {renderReviewItem(item, globalIndex)}
                          </div>
                        );
                      })}
                    </IonList>
                  </div>
                );
              })()}
              <div ref={listEndRef} style={{ height: 1 }} />
            </div>
          ) : (
            <div style={{ animation: "fadeIn 0.3s ease-out" }}>
              <div className="ion-padding">
                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "20px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IonIcon
                        icon={chatbubbleEllipsesOutline}
                        style={{ color: "#3b82f6", fontSize: "1.2rem" }}
                      />
                    </div>
                    <div>
                      <IonLabel
                        style={{
                          fontWeight: "900",
                          color: "#1e293b",
                          fontSize: "1rem",
                          display: "block",
                        }}
                      >
                        Observaciones Generales
                      </IonLabel>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                          fontWeight: "bold",
                        }}
                      >
                        Instrucciones especiales para todo el pedido
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Ej: Mesa VIP, Sacar rápido, Familia del dueño..."
                    style={{
                      width: "100%",
                      height: "120px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      padding: "16px",
                      fontSize: "1rem",
                      outline: "none",
                      background: "#f8fafc",
                      color: "#1e293b",
                      fontWeight: "500",
                      lineHeight: "1.5",
                    }}
                  />
                </div>
              </div>

              <div className="ion-padding-horizontal ion-padding-bottom">
                <div
                  style={{
                    background: "#0f172a",
                    borderRadius: "24px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <IonText
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                      }}
                    >
                      Resumen del Pedido
                    </IonText>
                    <IonBadge
                      color="success"
                      style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {cart.length} Ítems
                    </IonBadge>
                  </div>

                  <div
                    style={{
                      height: "1px",
                      background: "rgba(255,255,255,0.1)",
                    }}
                  ></div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <IonText
                        style={{
                          color: "white",
                          fontWeight: "900",
                          fontSize: "2.5rem",
                        }}
                      >
                        ${totalPrice.toFixed(2)}
                      </IonText>
                      <IonText
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                        }}
                      >
                        Total con IVA
                      </IonText>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <IonText
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          display: "block",
                        }}
                      >
                        {formatTableName(selectedTable?.zone || '', selectedTable?.label)}
                      </IonText>
                      <IonText
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                        }}
                      >
                        {comensales.length} Comensales
                      </IonText>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </IonContent>
        <IonFooter className="ion-no-border">
          <IonToolbar
            className="ion-padding"
            style={{ "--background": "#f8fafc" }}
          >
            {(() => {
              const isTakeout = selectedTable?.zone.toLowerCase().includes("llevar") || selectedTable?.zone.toLowerCase().includes("domicilio") || selectedTable?.zone.toLowerCase().includes("mostrador");
              return (
                <IonButton
                  expand="block"
                  color={isTakeout ? "primary" : "success"}
                  onClick={() => {
                    if (isTakeout && appMode === "gestion_cuentas") {
                      generateOrder(true);
                    } else {
                      generateOrder(false);
                    }
                  }}
                  disabled={isGeneratingOrder}
                  style={{
                    height: "56px",
                    "--border-radius": "16px",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  {isGeneratingOrder ? (
                    <IonSpinner name="crescent" color="light" />
                  ) : (
                    <>
                      <IonIcon icon={isTakeout ? "wallet-outline" : restaurantOutline} slot="start" />
                      {isTakeout && appMode === "gestion_cuentas" ? "Confirmar, Enviar y Cobrar" : "Confirmar y Enviar Pedido"}
                    </>
                  )}
                </IonButton>
              );
            })()}
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
};
