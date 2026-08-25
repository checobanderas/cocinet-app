import { getFormattedProductName } from '../../utils/appHelpers';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { addOutline, chatbubbleEllipsesOutline, removeOutline, trashOutline } from 'ionicons/icons';

interface ReviewItemViewProps {
  item: any;
  idx: any;
  openItemNoteModal: any;
  updateQuantity: any;
}

export const ReviewItemView: React.FC<ReviewItemViewProps> = ({
  idx,
  item,
  openItemNoteModal, updateQuantity
}) => {
  return (
<div
      key={`${item.product.id}-${item.plate}-${item.notes || ""}-${idx !== undefined ? idx : ""}`}
      style={{ background: "white", borderBottom: "1px solid #f1f5f9" }}
    >
      <div style={{ padding: "12px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, marginRight: "8px" }}>
            <h3
              style={{
                fontWeight: "900",
                margin: 0,
                fontSize: "0.95rem",
                color: "#1e293b",
                lineHeight: "1.2",
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              {getFormattedProductName(item.product)}
            </h3>
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
                  color: "#10b981",
                  fontWeight: "900",
                }}
              >
                ${(item.quantity * item.product.price).toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f1f5f9",
                borderRadius: "12px",
                padding: "2px",
              }}
            >
              <IonButton
                fill="clear"
                color="medium"
                onClick={() =>
                  updateQuantity(item.product.id, item.plate, -1, item.notes)
                }
                style={{
                  "--padding-start": "4px",
                  "--padding-end": "4px",
                  height: "32px",
                  width: "32px",
                  margin: 0,
                }}
              >
                <IonIcon icon={removeOutline} style={{ fontSize: "0.9rem" }} />
              </IonButton>
              <IonText
                style={{
                  fontWeight: "900",
                  width: "28px",
                  textAlign: "center",
                  fontSize: "1rem",
                  color: "#1e293b",
                }}
              >
                {item.quantity}
              </IonText>
              <IonButton
                fill="clear"
                color="primary"
                onClick={() =>
                  updateQuantity(item.product.id, item.plate, 1, item.notes)
                }
                style={{
                  "--padding-start": "4px",
                  "--padding-end": "4px",
                  height: "32px",
                  width: "32px",
                  margin: 0,
                }}
              >
                <IonIcon icon={addOutline} style={{ fontSize: "0.9rem" }} />
              </IonButton>
            </div>

            <IonButton
              fill="clear"
              color="warning"
              onClick={() =>
                openItemNoteModal(item.product.id, item.plate, item.notes)
              }
              style={{ height: "36px", width: "36px", margin: 0 }}
            >
              <IonIcon
                icon={chatbubbleEllipsesOutline}
                slot="icon-only"
                style={{ fontSize: "1.2rem" }}
              />
            </IonButton>

            <IonButton
              fill="clear"
              color="danger"
              onClick={() =>
                updateQuantity(
                  item.product.id,
                  item.plate,
                  -item.quantity,
                  item.notes,
                )
              }
              style={{ height: "36px", width: "36px", margin: 0 }}
            >
              <IonIcon
                icon={trashOutline}
                slot="icon-only"
                style={{ fontSize: "1.2rem" }}
              />
            </IonButton>
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
      </div>
    </div>
  );
};
