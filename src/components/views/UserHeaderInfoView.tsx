import { getOperatingDay } from '../../utils/appHelpers';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonButton, IonButtons, IonIcon, IonText } from '@ionic/react';
import { closeOutline, notificationsOutline } from 'ionicons/icons';

interface UserHeaderInfoViewProps {
  currentUser: any;
  handleLogout: any;
  isUrlTokenSession: any;
  notificationsList: any;
  setCurrentUser: any;
  setLoginSubStep: any;
  setNewPinInput: any;
  setSelectedLoginUser: any;
  setShowChangePinModal: any;
  setShowNotificationModal: any;
}

export const UserHeaderInfoView: React.FC<UserHeaderInfoViewProps> = ({
  currentUser,
  handleLogout,
  isUrlTokenSession,
  notificationsList,
  setCurrentUser,
  setLoginSubStep,
  setNewPinInput,
  setSelectedLoginUser,
  setShowChangePinModal,
  setShowNotificationModal
}) => {
if (!currentUser) return null;
    const currentOpDay = getOperatingDay(new Date());
    const unreadCount = notificationsList.filter(
      (n) => !n.read && getOperatingDay(n.createdAt ? new Date(n.createdAt) : new Date()) === currentOpDay
    ).length;
    return (
      <IonButtons slot="end">
        {/* Notification Bell Button 🔔 */}
        <IonButton
          onClick={() => setShowNotificationModal(true)}
          color="warning"
          fill="clear"
          style={{
            position: "relative",
            marginRight: "4px",
            "--background": "rgba(255,255,255,0.08)",
            borderRadius: "10px",
            width: "36px",
            height: "36px",
          }}
        >
          <IonIcon
            icon={notificationsOutline}
            slot="icon-only"
            style={{ fontSize: "20px" }}
          />
          {unreadCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                background: "#ef4444",
                color: "white",
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                fontSize: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                boxShadow: "0 0 6px #ef4444",
                border: "1px solid white",
              }}
            >
              {unreadCount}
            </div>
          )}
        </IonButton>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            marginLeft: "4px",
            marginRight: "10px",
          }}
        >
          <IonText
            style={{ fontSize: "0.9rem", fontWeight: "bold", color: "white" }}
          >
            {currentUser.name}
          </IonText>
          <IonText
            style={{
              fontSize: "0.7rem",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>{currentUser.role}</span>
            {isUrlTokenSession && (
              <button
                onClick={() => {
                  setNewPinInput("");
                  setShowChangePinModal(true);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  borderRadius: "4px",
                  padding: "1px 4px",
                  color: "#38bdf8",
                  fontSize: "9px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  fontWeight: "bold",
                  gap: "2px",
                }}
                title="Personalizar PIN 🔑"
              >
                🔑 PIN
              </button>
            )}
            {/* Quick button to switch user profile 👤🔄 */}
            <button
              onClick={() => {
                setCurrentUser(null);
                setSelectedLoginUser(null);
                setLoginSubStep("user");
                localStorage.removeItem("pos_current_user");
              }}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "4px",
                padding: "1px 4px",
                color: "white",
                fontSize: "8px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                fontFamily: "sans-serif",
              }}
              title="Cambiar Usuario 👤🔄"
            >
              👤🔄
            </button>
          </IonText>
        </div>
        <IonButton
          onClick={handleLogout}
          color="light"
          fill="clear"
          title="Cerrar Sesión Completa"
        >
          <IonIcon icon={closeOutline} slot="icon-only" />
        </IonButton>
      </IonButtons>
    );
};
