import { getFormattedProductName } from '../../utils/appHelpers';
import React from 'react';
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { addOutline, cardOutline, chatbubbleEllipsesOutline, closeOutline, logoWhatsapp, micOutline, removeOutline, restaurantOutline, saveOutline, stopCircleOutline, syncOutline, trashOutline } from 'ionicons/icons';

interface ComensalPreviewProps {
  showComensalPreview: boolean;
  setShowComensalPreview: (v: boolean) => void;
  cart: any;
  currentComensal: any;
  currentUser: any;
  generateOrder: any;
  getComensalColor: any;
  isGeneratingOrder: any;
  isListening: any;
  isOnline: any;
  isProcessingVoice: any;
  openItemNoteModal: any;
  selectedTable: any;
  setAppMode: any;
  setCheckoutFallbackItems: any;
  setCurrentComensal: any;
  setPaymentAmountReceived: any;
  setPaymentDiscountValue: any;
  setPaymentMethod: any;
  setPaymentTipValue: any;
  setRequiresInvoice: any;
  setShowDiscountInput: any;
  setShowPaymentOptions: any;
  setShowTipInput: any;
  startVoiceRecognition: any;
  updateQuantity: any;
}

export const ComensalPreview: React.FC<ComensalPreviewProps> = ({
  showComensalPreview,
  setShowComensalPreview,
  cart, currentComensal, currentUser, generateOrder, getComensalColor, isGeneratingOrder, isListening, isOnline, isProcessingVoice, openItemNoteModal, selectedTable, setAppMode, setCheckoutFallbackItems, setCurrentComensal, setPaymentAmountReceived, setPaymentDiscountValue, setPaymentMethod, setPaymentTipValue, setRequiresInvoice, setShowDiscountInput, setShowPaymentOptions, setShowTipInput, startVoiceRecognition, updateQuantity
}) => {
  return (
        <IonModal
          isOpen={showComensalPreview}
          onDidDismiss={() => setShowComensalPreview(false)}
          style={{
            "--height": "100%",
            "--width": "100%",
            "--max-height": "100%",
            "--max-width": "100%",
            "--border-radius": "0px",
          }}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar
              style={{
                "--background": getComensalColor(currentComensal),
                color: "white",
                transition: "all 0.3s ease",
              }}
            >
              <IonTitle style={{ fontSize: "1.2rem", fontWeight: "900" }}>
                Comensal {currentComensal}{" "}
                {currentUser && ` - ${currentUser.name}`}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => setShowComensalPreview(false)}
                  style={{ "--color": "white", fontWeight: "bold" }}
                >
                  Cerrar
                </IonButton>
              </IonButtons>
            </IonToolbar>
            <div
              style={{
                padding: "12px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "6px",
                  overflowX: "auto",
                  padding: "4px 0",
                }}
                className="no-scrollbar"
              >
                {Array.from(
                  { length: Math.max(currentComensal, 5) },
                  (_, i) => i + 1,
                ).map((num) => (
                  <div
                    key={num}
                    onClick={() => setCurrentComensal(num)}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "12px",
                      background:
                        currentComensal === num
                          ? getComensalColor(num)
                          : "white",
                      color: currentComensal === num ? "white" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "900",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      border:
                        currentComensal === num ? "none" : "2px solid #e2e8f0",
                      boxShadow:
                        currentComensal === num
                          ? `0 4px 12px ${getComensalColor(num)}44`
                          : "none",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList lines="full" className="no-scrollbar">
              {cart.filter((item) => item.plate === currentComensal).length ===
              0 ? (
                <div
                  className="ion-text-center ion-padding"
                  style={{ marginTop: "40px" }}
                >
                  <IonIcon
                    icon={restaurantOutline}
                    style={{
                      fontSize: "4rem",
                      color: "#cbd5e1",
                      marginBottom: "16px",
                    }}
                  />
                  <br />
                  <IonText color="medium">
                    Este comensal aún no tiene productos
                  </IonText>
                </div>
              ) : (
                cart
                  .filter((item) => item.plate === currentComensal)
                  .map((item, idx) => (
                    <IonItem
                      key={`${item.product.id}-${item.plate}-${idx}`}
                      style={{ "--padding-start": "0" }}
                    >
                      <IonLabel className="ion-text-wrap">
                        <h3
                          style={{
                            fontWeight: "900",
                            fontSize: "1.1rem",
                            color: "#1e293b",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {getFormattedProductName(item.product)}
                        </h3>
                        <p style={{ fontWeight: "bold", color: "#64748b" }}>
                          ${item.product.price.toFixed(2)} c/u
                        </p>
                        {item.notes && (
                          <div
                            style={{
                              marginTop: "8px",
                              padding: "8px 12px",
                              background: "#fffbeb",
                              borderRadius: "10px",
                              borderLeft: "4px solid #f59e0b",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <IonIcon
                              icon={chatbubbleEllipsesOutline}
                              style={{ color: "#f59e0b", fontSize: "1rem" }}
                            />
                            <IonText
                              style={{
                                color: "#92400e",
                                fontStyle: "italic",
                                fontSize: "0.85rem",
                              }}
                            >
                              {item.notes}
                            </IonText>
                          </div>
                        )}
                      </IonLabel>
                      <div
                        slot="end"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "#f1f5f9",
                          borderRadius: "12px",
                          padding: "4px",
                        }}
                      >
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.plate,
                              -1,
                              item.notes,
                            )
                          }
                          style={{ "--color": "#1e293b", margin: 0 }}
                        >
                          <IonIcon icon={removeOutline} />
                        </IonButton>
                        <div
                          onClick={() => {
                            const nextQty =
                              Math.ceil((item.quantity + 1) / 5) * 5;
                            updateQuantity(
                              item.product.id,
                              item.plate,
                              nextQty - item.quantity,
                              item.notes,
                            );
                          }}
                          style={{
                            fontWeight: "900",
                            minWidth: "28px",
                            textAlign: "center",
                            fontSize: "1rem",
                            cursor: "pointer",
                            background: "#e2e8f0",
                            borderRadius: "8px",
                            padding: "4px",
                          }}
                        >
                          {item.quantity}
                        </div>
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.plate,
                              1,
                              item.notes,
                            )
                          }
                          style={{ "--color": "#1e293b", margin: 0 }}
                        >
                          <IonIcon icon={addOutline} />
                        </IonButton>
                        <div
                          style={{
                            width: "1px",
                            height: "20px",
                            background: "#cbd5e1",
                            margin: "0 4px",
                          }}
                        ></div>
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() =>
                            openItemNoteModal(
                              item.product.id,
                              item.plate,
                              item.notes,
                            )
                          }
                          style={{ "--color": "#f59e0b", margin: 0 }}
                        >
                          <IonIcon icon={chatbubbleEllipsesOutline} />
                        </IonButton>
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.plate,
                              -item.quantity,
                              item.notes,
                            )
                          }
                          style={{ "--color": "#ef4444", margin: 0 }}
                        >
                          <IonIcon icon={trashOutline} />
                        </IonButton>
                      </div>
                    </IonItem>
                  ))
              )}
            </IonList>
          </IonContent>
          <IonFooter
            className="ion-no-border ion-padding"
            style={{ background: "white" }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {isProcessingVoice && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "8px",
                    background: "#f1f5f9",
                    borderRadius: "12px",
                    animation: "fadeIn 0.3s ease-out",
                  }}
                >
                  <IonIcon
                    icon={syncOutline}
                    className="animate-spin"
                    color="primary"
                  />
                  <IonText
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      color: "#475569",
                    }}
                  >
                    Procesando pedido...
                  </IonText>
                </div>
              )}
              <div style={{ display: "none" }} /> {/* Hidden spacer */}
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                {/* Seguir ordenando (Voz) */}
                {isOnline && (
                  <IonButton
                    style={{
                      flex: 1,
                      height: "64px",
                      "--border-radius": "18px",
                      fontWeight: "900",
                      fontSize: "0.95rem",
                      "--background": isListening ? "#ef4444" : "#eab308", // Golden/Red for voice guidance
                      "--color": isListening ? "white" : "black",
                      boxShadow: `0 6px 18px ${isListening ? "rgba(239, 68, 68, 0.4)" : "rgba(234, 179, 8, 0.3)"}`,
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => startVoiceRecognition()}
                    disabled={isProcessingVoice}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          background: "white",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isListening ? "#ef4444" : "#eab308",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}
                      >
                        <IonIcon
                          icon={
                            isListening
                              ? stopCircleOutline || closeOutline
                              : micOutline
                          }
                          style={{
                            fontSize: "18px",
                            animation: isListening
                              ? "pulse-mic-icon 1s infinite alternate"
                              : "none",
                          }}
                        />
                      </div>
                      <span>
                        {isListening ? "Detener" : "Seguir ordenando 🎙️"}
                      </span>
                    </div>
                  </IonButton>
                )}

                {/* Mandar Comanda */}
                <IonButton
                  style={{
                    flex: 1,
                    height: "64px",
                    "--border-radius": "18px",
                    fontWeight: "900",
                    fontSize: "0.95rem",
                    "--background": "#3b82f6", // Cool blue for kitchen action
                    "--color": "white",
                    boxShadow: "0 6px 18px rgba(59, 130, 246, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => generateOrder(false)}
                  disabled={
                    cart.length === 0 || isGeneratingOrder || isProcessingVoice
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {isGeneratingOrder ? (
                      <IonSpinner
                        name="crescent"
                        color="light"
                        style={{ width: "20px", height: "20px" }}
                      />
                    ) : (
                      <>
                        <div
                          style={{
                            background: "white",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#3b82f6",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          }}
                        >
                          <IonIcon
                            icon={restaurantOutline}
                            style={{ fontSize: "18px" }}
                          />
                        </div>
                        <span>Mandar Comanda 🍳</span>
                      </>
                    )}
                  </div>
                </IonButton>
              </div>
              {/* Cobrar y Cuenta */}
              {currentUser?.role !== "mesero" && (
                <IonButton
                  expand="block"
                  style={{
                    height: "56px",
                    "--border-radius": "16px",
                    fontWeight: "900",
                    fontSize: "1.05rem",
                    "--background": "#10b981", // Success green
                    "--color": "white",
                    boxShadow: "0 6px 18px rgba(16, 185, 129, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onClick={async () => {
                    if (cart.length > 0) {
                      await generateOrder(true);
                    } else {
                      // Direct checkout
                      const existingItems =
                        selectedTable?.comandas.flatMap((c) => c.items) || [];
                      setCheckoutFallbackItems(existingItems);
                      setShowTipInput(false);
                      setShowDiscountInput(false);
                      setShowPaymentOptions(false);
                      setPaymentTipValue(0);
                      setPaymentDiscountValue(0);
                      setPaymentAmountReceived("");
                      setPaymentMethod("cash");
                      setRequiresInvoice(false);
                      setAppMode("checkout");
                      setShowComensalPreview(false);
                    }
                  }}
                  disabled={
                    cart.length === 0 &&
                    !(
                      selectedTable &&
                      selectedTable.comandas &&
                      selectedTable.comandas.length > 0
                    )
                  }
                >
                  <IonIcon
                    icon={cardOutline}
                    slot="start"
                    style={{ fontSize: "20px" }}
                  />
                  Generar Cuenta y Cobrar 💳
                </IonButton>
              )}
            </div>
          </IonFooter>
        </IonModal>
  );
};
