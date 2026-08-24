import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonSpinner } from '@ionic/react';


interface SwitchingTenantOverlayViewProps {
  switchingTenantName: any;
}

export const SwitchingTenantOverlayView: React.FC<SwitchingTenantOverlayViewProps> = ({
  switchingTenantName
}) => {
return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <IonSpinner name="crescent" style={{ width: "64px", height: "64px", color: "#6366f1", marginBottom: "20px" }} />
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", margin: "0 0 8px 0" }}>
          🔄 Conectando a {switchingTenantName || "Sucursal"}...
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
          Sincronizando base de datos y catálogo de productos...
        </p>
      </div>
    );
};
