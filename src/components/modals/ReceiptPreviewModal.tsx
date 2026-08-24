import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, printOutline } from 'ionicons/icons';

interface ReceiptPreviewModalProps {
  showReceiptPreviewModal: boolean;
  setShowReceiptPreviewModal: (v: boolean) => void;
  // Let's add any props passed in
  receiptPreviewContent: string;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  showReceiptPreviewModal,
  setShowReceiptPreviewModal,
  receiptPreviewContent
}) => {
  return (
          <IonModal
            isOpen={showReceiptPreviewModal}
            onDidDismiss={() => setShowReceiptPreviewModal(false)}
            style={{ "--border-radius": "24px" }}
          >
            <IonHeader className="ion-no-border">
              <IonToolbar
                style={{
                  "--background": "rgb(244, 63, 94)",
                  "--color": "white",
                }}
              >
                <IonTitle>
                  👁️ Vista Preliminar de Impresión (Corte Express)
                </IonTitle>
                <IonButtons slot="end">
                  <button
                    onClick={() => setShowReceiptPreviewModal(false)}
                    className="bg-transparent hover:bg-white/10 text-white font-bold text-xs py-1.5 px-3 rounded-lg border-none outline-none cursor-pointer"
                  >
                    Cerrar
                  </button>
                </IonButtons>
              </IonToolbar>
            </IonHeader>

            <IonContent
              className="ion-padding"
              style={{ "--background": "#f1f5f9" }}
            >
              <div className="max-w-md mx-auto space-y-4 py-3">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl text-xs font-semibold leading-relaxed">
                  📱 Esta es una representación digital idéntica del ticket de
                  papel que recibirá tu impresora térmica física de 58mm/80mm
                  según las configuraciones del SAT/PROFECO vigentes.
                </div>

                <div className="flex justify-center">
                  <div className="bg-[#f0ece1] p-0.5 rounded-3xl shadow-lg border border-slate-200 w-full max-w-[340px]">
                    <div className="bg-[#fdfbf7] p-5 sm:p-7 rounded-3xl font-mono text-slate-800 text-[11.5px] leading-relaxed select-all relative overflow-hidden">
                      {/* Scissors cut effect decor */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_30%,_#e2e8f0_31%)] bg-[length:8px_8px] bg-repeat-x"></div>

                      <div className="text-center text-slate-400 text-[11px] mb-4 font-black select-none tracking-widest uppercase border-b border-dashed border-slate-200 pb-1">
                        ✂️ TICKET CORTE EXPRESS PREVIO ✂️
                      </div>

                      <pre className="whitespace-pre-wrap font-mono break-all leading-normal">
                        {generateCorteExpressTicketText()}
                      </pre>

                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_30%,_#e2e8f0_31%)] bg-[length:8px_8px] bg-repeat-x"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <button
                    onClick={() => {
                      const text = generateCorteExpressTicketText();
                      const blob = new Blob([text], {
                        type: "text/plain;charset=utf-8",
                      });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `CorteExpress_${companyConfig.businessName}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                      setMenuToastMessage(
                        "Ticket de Corte Express exportado con éxito.",
                      );
                      setShowMenuToast(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow cursor-pointer border-none outline-none uppercase text-center"
                  >
                    📥 Descargar TXT
                  </button>

                  <button
                    onClick={() => {
                      const text = generateCorteExpressTicketText();
                      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                      window.open(url, "_blank");
                    }}
                    className="bg-emerald-650 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow cursor-pointer border-none outline-none uppercase text-center"
                  >
                    💬 WhatsApp
                  </button>
                </div>
              </div>
            </IonContent>
          </IonModal>
  );
};
