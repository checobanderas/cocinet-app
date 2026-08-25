import { markComandaItemsForCancellationInFirebase } from '../../utils/firestore';
import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface BulkItemCancellationReasonModalProps {
  showBulkItemCancellationReasonModal: boolean;
  setShowBulkItemCancellationReasonModal: (v: boolean) => void;
  bulkItemCancellationOtherReason: any;
  bulkItemCancellationReason: any;
  currentUser: any;
  itemsSelectedForCancellation: any;
  pending: any;
  selectedTable: any;
  selectedTenant: any;
  setBulkItemCancellationOtherReason: any;
  setBulkItemCancellationReason: any;
  setItemsSelectedForCancellation: any;
  triggerAppNotification: any;
}

export const BulkItemCancellationReasonModal: React.FC<BulkItemCancellationReasonModalProps> = ({
  showBulkItemCancellationReasonModal,
  setShowBulkItemCancellationReasonModal,
  bulkItemCancellationOtherReason, bulkItemCancellationReason, currentUser, itemsSelectedForCancellation, pending, selectedTable, selectedTenant, setBulkItemCancellationOtherReason, setBulkItemCancellationReason, setItemsSelectedForCancellation, triggerAppNotification
}) => {
  return (
          <IonModal
            isOpen={showBulkItemCancellationReasonModal}
            onDidDismiss={() => setShowBulkItemCancellationReasonModal(false)}
            style={{
              "--height": "480px",
              "--width": "420px",
              "--border-radius": "24px",
            }}
          >
             <IonHeader className="ion-no-border">
               <IonToolbar style={{ "--background": "#1e293b", "--color": "white" }}>
                 <IonTitle>Motivo de Cancelación</IonTitle>
                 <IonButtons slot="end">
                   <IonButton onClick={() => setShowBulkItemCancellationReasonModal(false)}>Cerrar</IonButton>
                 </IonButtons>
               </IonToolbar>
             </IonHeader>
             <IonContent className="ion-padding bg-slate-50">
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-600">Selecciona el motivo para cancelar los {itemsSelectedForCancellation.length} productos:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {["Error de captura", "Producto no servido", "Cliente se retiró", "Falta de insumos", "Otro"].map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          setBulkItemCancellationReason(r);
                          if (r !== "Otro") setBulkItemCancellationOtherReason("");
                        }}
                        className={`w-full text-left px-4 py-3 border rounded-xl font-semibold transition ${
                          bulkItemCancellationReason === r ? "bg-indigo-600 text-white border-indigo-700" : "bg-white text-slate-800 border-slate-200"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  {bulkItemCancellationReason === "Otro" && (
                    <textarea
                      value={bulkItemCancellationOtherReason}
                      onChange={(e) => setBulkItemCancellationOtherReason(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm"
                      placeholder="Especifique el motivo..."
                      rows={3}
                    />
                  )}
                  <button
                    onClick={async () => {
                      const finalReason = bulkItemCancellationReason === "Otro" ? bulkItemCancellationOtherReason : bulkItemCancellationReason;
                      if (!finalReason) return alert("Seleccione un motivo");
                      try {
                        await markComandaItemsForCancellationInFirebase(
                          selectedTable!.id,
                          selectedTable!,
                          itemsSelectedForCancellation,
                          finalReason,
                          currentUser
                        );

                        const itemsToCancelDetails = itemsSelectedForCancellation.map(selected => {
                          let name = "Producto desconocido";
                          let quantity = 1;
                          selectedTable?.comandas?.forEach(c => {
                            if (c.folio === selected.folio) {
                              c.items?.forEach(it => {
                                if (it.product.id === selected.productId && it.plate === selected.plate) {
                                  name = it.product.name;
                                  quantity = it.quantity;
                                }
                              });
                            }
                          });
                          return {
                            folio: selected.folio,
                            productId: selected.productId,
                            plate: selected.plate,
                            name,
                            quantity
                          };
                        });

                        const cancellationFolio = "CAN-" + String(Date.now()).slice(-5);
                        const tableLabel = selectedTable!.label || "No especificada";
                        const notifTitle = `⏳ Solicitud de Cancelación #${cancellationFolio}`;
                        const notifBody = `Solicitud enviada.\nFolio: ${cancellationFolio}\nMesa: ${tableLabel}\nSucursal: ${selectedTenant?.name || "No especificada"}\nMesero: ${currentUser?.name || "No registrado"}\nSe solicitó la cancelación de ${itemsSelectedForCancellation.length} productos.\nMotivo: ${finalReason}\nEscribe aquí tu PIN para autorizar.`;

                        triggerAppNotification(notifTitle, notifBody, "success", {
                          isCancellationRequest: true,
                          cancellationFolio,
                          tableLabel,
                          tableId: selectedTable!.id,
                          itemsToCancel: itemsToCancelDetails,
                          branchName: selectedTenant?.name || "No especificada",
                          waiterName: currentUser?.name || "No registrado",
                          reason: finalReason,
                          status: "pending",
                        });

                        setShowBulkItemCancellationReasonModal(false);
                        setItemsSelectedForCancellation([]);
                      } catch (err) {
                        console.error(err);
                        alert("Error al marcar productos");
                      }
                    }}
                    disabled={!bulkItemCancellationReason || (bulkItemCancellationReason === "Otro" && !bulkItemCancellationOtherReason.trim())}
                    className="w-full bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50"
                  >
                    Confirmar Solicitud ⏳
                  </button>
                </div>
             </IonContent>
          </IonModal>
  );
};
