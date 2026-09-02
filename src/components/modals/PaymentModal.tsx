import React from 'react';
import { IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonModal, IonSegment, IonSegmentButton, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { closeOutline, backspaceOutline } from 'ionicons/icons';

interface PaymentModalProps {
  showPaymentModal: boolean;
  setShowPaymentModal: (v: boolean) => void;
  selectedTable: any;
  selectedAccountForPayment: any;
  selectedTenant?: any;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  paymentAmountReceived: string;
  setPaymentAmountReceived: (v: string) => void;
  paymentDiscountType: string;
  setPaymentDiscountType: (v: string) => void;
  paymentDiscountValue: string;
  setPaymentDiscountValue: (v: string) => void;
  paymentDiscountTarget: string;
  setPaymentDiscountTarget: (v: string) => void;
  paymentTipTarget: string;
  setPaymentTipTarget: (v: string) => void;
  paymentTipValue: string;
  setPaymentTipValue: (v: string) => void;
  paymentCardType: string;
  setPaymentCardType: (v: string) => void;
  paymentCardLastFour: string;
  setPaymentCardLastFour: (v: string) => void;
  confirmPayment: () => void;
  
  // Numpad props
  showNumpad: boolean;
  setShowNumpad: (v: boolean) => void;
  numpadValue: string;
  setNumpadValue: (v: string | ((prev: string) => string)) => void;
  numpadTarget: string;
  numpadTotal: number;
  isNumpadValueFresh: boolean;
  setIsNumpadValueFresh: (v: boolean) => void;
  handleNumpadConfirm: () => void;
  modalDiscountAmount: any;
  openNumpad: any;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  showPaymentModal,
  setShowPaymentModal,
  selectedTable,
  selectedAccountForPayment,
  selectedTenant,
  paymentMethod,
  setPaymentMethod,
  paymentAmountReceived,
  setPaymentAmountReceived,
  paymentDiscountType,
  setPaymentDiscountType,
  paymentDiscountValue,
  setPaymentDiscountValue,
  paymentDiscountTarget,
  setPaymentDiscountTarget,
  paymentTipTarget,
  setPaymentTipTarget,
  paymentTipValue,
  setPaymentTipValue,
  paymentCardType,
  setPaymentCardType,
  paymentCardLastFour,
  setPaymentCardLastFour,
  confirmPayment,
  showNumpad,
  setShowNumpad,
  numpadValue,
  setNumpadValue,
  numpadTarget,
  numpadTotal,
  isNumpadValueFresh,
  setIsNumpadValueFresh,
  handleNumpadConfirm,
  modalDiscountAmount, openNumpad
}) => {
  const renderPaymentModal = () => { 
    return ( 
      <> 
        <IonModal 
          isOpen={showPaymentModal} 
          onDidDismiss={() => setShowPaymentModal(false)} 
          style={{ 
            "--height": "90%", 
            "--max-height": "850px", 
            "--width": "100%", 
            "--max-width": "600px", 
            "--border-radius": "24px", 
            "--box-shadow": "0 15px 50px rgba(0,0,0,0.2)", 
          }} 
        > 
          <IonHeader className="ion-no-border"> 
            <IonToolbar 
              style={{ 
                "--background": "rgb(40, 45, 52)", 
                "--color": "white", 
              }} 
            > 
              <IonTitle> 
                Procesar Pago - Mesa {selectedAccountForPayment?.tableLabel} 
              </IonTitle> 
              <IonButtons slot="end"> 
                <IonButton onClick={() => setShowPaymentModal(false)}> 
                  <IonIcon icon={closeOutline} slot="icon-only" /> 
                </IonButton> 
              </IonButtons> 
            </IonToolbar> 
          </IonHeader> 
          <IonContent style={{ "--background": "#f8fafc" }}> 
            {selectedAccountForPayment && ( 
              <div className="ion-padding"> 
                <IonCard 
                  style={{ borderRadius: "20px", margin: "0 0 16px 0" }} 
                > 
                  <IonCardContent> 
                    <div 
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        marginBottom: "12px", 
                      }} 
                    > 
                      <IonText color="medium">Subtotal:</IonText> 
                      <IonText style={{ fontWeight: "bold" }}> 
                        ${selectedAccountForPayment.subtotal.toFixed(2)} 
                      </IonText> 
                    </div> 

                    <div 
                      style={{ 
                        display: "block", 
                        marginBottom: "12px", 
                        padding: "12px", 
                        background: "#f0fdf4", 
                        borderRadius: "16px", 
                        border: "1px solid #bbf7d0", 
                      }} 
                    > 
                      <div 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          marginBottom: "10px", 
                        }} 
                      > 
                        <IonText color="success" style={{ fontWeight: "bold" }}> 
                          Propina (+): 
                        </IonText> 
                        <div style={{ display: "flex", gap: "4px" }}> 
                          {[10, 15, 20].map((p) => ( 
                            <IonButton 
                              key={p} 
                              size="small" 
                              fill="clear" 
                              color="success" 
                              onClick={() => { 
                                setPaymentTipValue( 
                                  Math.round( 
                                    selectedAccountForPayment.subtotal * 
                                      (p / 100), 
                                  ), 
                                ); 
                                setPaymentTipTarget(""); 
                              }} 
                              style={{ fontSize: "0.6rem", height: "20px" }} 
                            > 
                              {p}% 
                            </IonButton> 
                          ))} 
                        </div> 
                      </div> 

                      <div 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between", 
                          gap: "8px", 
                        }} 
                      > 
                        <span 
                          style={{ 
                            fontSize: "0.75rem", 
                            color: "#64748b", 
                            fontWeight: "600", 
                          }} 
                        > 
                          Propina Manual: 
                        </span> 
                        <div style={{ display: "flex", gap: "4px" }}> 
                          <input 
                            type="text" 
                            readOnly 
                            value={ 
                              paymentTipValue ? `$ ${paymentTipValue}` : "" 
                            } 
                            onClick={() => { 
                              const activeSubtotal = selectedAccountForPayment 
                                ? selectedAccountForPayment.subtotal 
                                : ((selectedTable?.comandas || []).flatMap( 
                                    (c) => c?.items || [], 
                                  ) || []) 
                                    .filter((i) => !i.isCancelled) 
                                    .reduce( 
                                      (sum, item) => 
                                        sum + 
                                        item.quantity * item.product.price, 
                                      0, 
                                    ); 
                              openNumpad( 
                                paymentTipValue 
                                  ? paymentTipValue.toString() 
                                  : "", 
                                activeSubtotal, 
                                "tip_value", 
                              ); 
                            }} 
                            placeholder="Propina $" 
                            style={{ 
                              width: "90px", 
                              border: "1px solid #e2e8f0", 
                              borderRadius: "8px", 
                              padding: "6px 8px", 
                              textAlign: "right", 
                              fontWeight: "bold", 
                              fontSize: "0.95rem", 
                              background: "white", 
                              cursor: "pointer", 
                            }} 
                          /> 
                        </div> 
                      </div> 
                    </div> 

                    <div 
                      style={{ 
                        display: "block", 
                        marginBottom: "12px", 
                        padding: "12px", 
                        background: "#fef2f2", 
                        borderRadius: "16px", 
                        border: "1px solid #fecaca", 
                      }} 
                    > 
                      <div 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          marginBottom: "10px", 
                        }} 
                      > 
                        <IonText 
                          color="danger" 
                          style={{ fontWeight: "bold" }} 
                        > 
                          Descuento (-): 
                        </IonText> 
                        <div style={{ display: "flex", gap: "4px" }}> 
                          {[5, 10, 15, 20].map((p) => ( 
                            <IonButton 
                              key={p} 
                              size="small" 
                              fill="clear" 
                              color="danger" 
                              onClick={() => { 
                                setPaymentDiscountValue(p); 
                                setPaymentDiscountType("percent"); 
                                setPaymentDiscountTarget(""); 
                              }} 
                              style={{ fontSize: "0.6rem", height: "20px" }} 
                            > 
                              {p}% 
                            </IonButton> 
                          ))} 
                        </div> 
                      </div> 

                      <div 
                        style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          gap: "8px", 
                        }} 
                      > 
                        <div 
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between", 
                            gap: "8px", 
                          }} 
                        > 
                          <span 
                            style={{ 
                              fontSize: "0.75rem", 
                              color: "#64748b", 
                              fontWeight: "600", 
                            }} 
                          > 
                            Ajustar Total Final: 
                          </span> 
                          <div 
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "4px", 
                            }} 
                          > 
                            <input 
                              type="text" 
                              readOnly 
                              value={ 
                                paymentDiscountTarget 
                                  ? `$ ${paymentDiscountTarget}` 
                                  : "" 
                              } 
                              onClick={() => { 
                                const activeSubtotal = selectedAccountForPayment 
                                  ? selectedAccountForPayment.subtotal 
                                  : ((selectedTable?.comandas || []).flatMap( 
                                      (c) => c?.items || [], 
                                    ) || []) 
                                      .filter((i) => !i.isCancelled) 
                                      .reduce( 
                                        (sum, item) => 
                                          sum + 
                                          item.quantity * item.product.price, 
                                        0, 
                                      ); 
                                openNumpad( 
                                  paymentDiscountTarget || "", 
                                  activeSubtotal, 
                                  "discount_target", 
                                ); 
                              }} 
                              placeholder="Ej. 150" 
                              style={{ 
                                width: "90px", 
                                border: "1px solid #ef4444", 
                                borderRadius: "8px", 
                                padding: "6px 8px", 
                                textAlign: "right", 
                                fontWeight: "bold", 
                                fontSize: "0.95rem", 
                                background: "white", 
                                cursor: "pointer", 
                              }} 
                            /> 
                          </div> 
                        </div> 

                        <div 
                          style={{ 
                            textTransform: "uppercase", 
                            fontSize: "0.55rem", 
                            fontWeight: "900", 
                            color: "#cbd5e1", 
                            textAlign: "center", 
                          }} 
                        > 
                          — o bien — 
                        </div> 

                        <div 
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between", 
                            gap: "8px", 
                          }} 
                        > 
                          <span 
                            style={{ 
                              fontSize: "0.75rem", 
                              color: "#64748b", 
                              fontWeight: "600", 
                            }} 
                          > 
                            Descuento Directo: 
                          </span> 
                          <div 
                            style={{ 
                              display: "flex", 
                              gap: "4px", 
                              alignItems: "center", 
                            }} 
                          > 
                            <IonSegment 
                              value={paymentDiscountType} 
                              onIonChange={(e) => 
                                setPaymentDiscountType(e.detail.value as any) 
                              } 
                              style={{ width: "60px", height: "30px" }} 
                            > 
                              <IonSegmentButton 
                                value="percent" 
                                style={{ minHeight: "30px", fontSize: "0.7rem" }} 
                              > 
                                % 
                              </IonSegmentButton> 
                              <IonSegmentButton 
                                value="amount" 
                                style={{ minHeight: "30px", fontSize: "0.7rem" }} 
                              > 
                                $ 
                              </IonSegmentButton> 
                            </IonSegment> 
                            <input 
                              type="text" 
                              readOnly 
                              value={ 
                                paymentDiscountValue 
                                  ? paymentDiscountType === "percent" 
                                    ? `${paymentDiscountValue}%` 
                                    : `$ ${paymentDiscountValue}` 
                                  : "" 
                              } 
                              onClick={() => { 
                                const activeSubtotal = selectedAccountForPayment 
                                  ? selectedAccountForPayment.subtotal 
                                  : ((selectedTable?.comandas || []).flatMap( 
                                      (c) => c?.items || [], 
                                    ) || []) 
                                      .filter((i) => !i.isCancelled) 
                                      .reduce( 
                                        (sum, item) => 
                                          sum + 
                                          item.quantity * item.product.price, 
                                        0, 
                                      ); 
                                openNumpad( 
                                  paymentDiscountValue 
                                    ? paymentDiscountValue.toString() 
                                    : "", 
                                  activeSubtotal, 
                                  "discount_value", 
                                ); 
                              }} 
                              placeholder={ 
                                paymentDiscountType === "percent" 
                                  ? "% Porcent" 
                                  : "Monto $" 
                              } 
                              style={{ 
                                width: "90px", 
                                border: "1px solid #fca5a5", 
                                borderRadius: "8px", 
                                padding: "6px 8px", 
                                textAlign: "right", 
                                fontWeight: "bold", 
                                fontSize: "0.95rem", 
                                background: "white", 
                                cursor: "pointer", 
                              }} 
                            /> 
                          </div> 
                        </div> 
                      </div> 
                    </div> 

                    <div 
                      style={{ 
                        marginTop: "16px", 
                        paddingTop: "16px", 
                        borderTop: "2px dashed #e2e8f0", 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                      }} 
                    > 
                      <IonText 
                        style={{ fontWeight: "black", fontSize: "1.2rem" }} 
                      > 
                        TOTAL 
                      </IonText> 
                      <IonText 
                        color="primary" 
                        style={{ fontWeight: "black", fontSize: "1.8rem" }} 
                      > 
                        $ 
                        {( 
                          selectedAccountForPayment.subtotal + 
                          paymentTipValue - 
                          modalDiscountAmount 
                        ).toFixed(2)} 
                      </IonText> 
                    </div> 
                  </IonCardContent> 
                </IonCard> 

                <IonText 
                  color="medium" 
                  style={{ 
                    fontSize: "0.8rem", 
                    fontWeight: "bold", 
                    textTransform: "uppercase", 
                    display: "block", 
                    marginBottom: "8px", 
                  }} 
                > 
                  Método de Pago 
                </IonText> 
                <IonSegment 
                  value={paymentMethod} 
                  onIonChange={(e) => { 
                    const method = e.detail.value as any; 
                    setPaymentMethod(method); 
                    if (method === "cash") { 
                      const accountTotal = 
                        selectedAccountForPayment.subtotal + 
                        paymentTipValue - 
                        modalDiscountAmount; 
                      setPaymentAmountReceived(accountTotal.toFixed(2)); 
                    } else { 
                      setPaymentAmountReceived(""); 
                    } 
                    if (method === "transfer") {
                      openNumpad(paymentCardLastFour || "", 0, "card_digits");
                    }
                  }} 
                  className="ion-margin-bottom" 
                > 
                  {selectedTenant?.allowEfectivo !== false && (
                    <IonSegmentButton value="cash">Efectivo</IonSegmentButton> 
                  )}
                  {selectedTenant?.allowLupay !== false && (
                    <IonSegmentButton value="lupay">Lúpay</IonSegmentButton> 
                  )}
                  {selectedTenant?.allowTarjeta !== false && (
                    <IonSegmentButton value="card">Tarjeta</IonSegmentButton> 
                  )}
                  {selectedTenant?.allowTransferencia !== false && (
                    <IonSegmentButton value="transfer">Transf.</IonSegmentButton> 
                  )}
                </IonSegment> 

                {false && paymentMethod === "card" && requiresInvoice && ( 
                  <div 
                    id="modal-card-type-selection-container"
                    className={`mb-4 border rounded-2xl p-3 flex flex-col gap-2 transition-all ${
                      !paymentCardType
                        ? "bg-red-50/90 border-red-400 ring-2 ring-red-300 shadow-md"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  > 
                    <span className={`text-[11px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1 ${
                      !paymentCardType ? "text-red-700 font-black animate-pulse" : "text-slate-500"
                    }`}> 
                      {!paymentCardType && "⚠️ "}¿La tarjeta es Crédito o Débito? {!paymentCardType && "(REQUERIDO)"}
                    </span> 
                    <div className="grid grid-cols-2 gap-2"> 
                      <button 
                        type="button" 
                        onClick={() => {
                          setPaymentCardType("debito");
                          openNumpad(paymentCardLastFour || "", 0, "card_digits");
                        }} 
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${ 
                            paymentCardType === "debito" 
                            ? "bg-emerald-600 text-white shadow-md border-2 border-emerald-700 font-black scale-[1.02]" 
                            : "bg-white text-slate-700 hover:bg-slate-100 border-2 border-slate-300" 
                        }`} 
                      > 
                        Débito 💳 
                      </button> 
                      <button 
                        type="button" 
                        onClick={() => {
                          setPaymentCardType("credito");
                          openNumpad(paymentCardLastFour || "", 0, "card_digits");
                        }} 
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${ 
                          paymentCardType === "credito" 
                            ? "bg-emerald-600 text-white shadow-md border-2 border-emerald-700 font-black scale-[1.02]" 
                            : "bg-white text-slate-700 hover:bg-slate-100 border-2 border-slate-300" 
                        }`} 
                      > 
                        Crédito 💳 
                      </button> 
                    </div> 
                    {!paymentCardType && (
                      <p className="text-[11px] font-black text-red-600 text-center mt-0.5">
                        👉 Selecciona Débito o Crédito para habilitar "Confirmar Pago".
                      </p>
                    )}
                  </div> 
                )} 

                {(paymentMethod === "card" || paymentMethod === "transfer") && ( 
                  <div 
                    style={{ 
                      marginBottom: "16px", 
                      padding: "16px", 
                      background: "#f8fafc", 
                      borderRadius: "16px", 
                      border: "1px solid #cbd5e1", 
                      animation: "fadeIn 0.2s ease", 
                    }} 
                  > 
                    <div 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between", 
                        gap: "12px", 
                        width: "100%", 
                      }} 
                    > 
                      <div style={{ flex: 1 }}> 
                        <IonText 
                          style={{ 
                            fontWeight: "bold", 
                            display: "block", 
                            marginBottom: "4px", 
                            fontSize: "0.85rem", 
                            color: "#64748b", 
                          }} 
                        > 
                          Últimos 4 Dígitos {paymentMethod === "card" ? "💳" : "📲"}
                          <span style={{ fontSize: "0.7rem", marginLeft: "4px", color: selectedTenant?.requireCardDigits !== false ? "#ef4444" : "#94a3b8" }}>
                            {selectedTenant?.requireCardDigits !== false ? "(Requerido)" : "(Opcional)"}
                          </span>
                        </IonText> 
                        <input 
                          type="text" 
                          inputMode="numeric" 
                          pattern="[0-9]*" 
                          maxLength={4} 
                          value={paymentCardLastFour} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setPaymentCardLastFour(val.slice(0, 4));
                          }}
                          onClick={() => { 
                            openNumpad( 
                              paymentCardLastFour, 
                              0, 
                              "card_digits" 
                            ); 
                          }} 
                          placeholder="••••" 
                          style={{ 
                            width: "100%", 
                            border: "none", 
                            background: "transparent", 
                            textAlign: "left", 
                            fontWeight: "900", 
                            fontSize: "1.8rem", 
                            color: "#0f172a", 
                            outline: "none", 
                          }} 
                        /> 
                      </div> 
                      <button 
                        type="button" 
                        onClick={() => { 
                          openNumpad( 
                            paymentCardLastFour, 
                            0, 
                            "card_digits" 
                          ); 
                        }} 
                        style={{ 
                          background: "#e2e8f0", 
                          border: "1px solid #cbd5e1", 
                          padding: "10px", 
                          borderRadius: "14px", 
                          cursor: "pointer", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          boxShadow: "0 2px 4px rgba(0,0,0,0.06)", 
                          fontSize: "1.4rem", 
                          transition: "transform 0.1s ease", 
                        }} 
                        title="Teclado Numérico" 
                      > 
                        🔢 
                      </button> 
                    </div> 
                  </div> 
                )} 

                {paymentMethod === "cash" && ( 
                  <div 
                    style={{ 
                      padding: "16px", 
                      background: "white", 
                      borderRadius: "16px", 
                      border: "1px solid #e2e8f0", 
                    }} 
                  > 
                    <div 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between", 
                        gap: "12px", 
                        width: "100%", 
                      }} 
                    > 
                      <div style={{ flex: 1 }}> 
                        <IonText 
                          style={{ 
                            fontWeight: "bold", 
                            display: "block", 
                            marginBottom: "4px", 
                            fontSize: "0.85rem", 
                            color: "#64748b", 
                          }} 
                        > 
                          Efectivo Recibido 💵 
                        </IonText> 
                        <input 
                          type="text" 
                          inputMode="none" 
                          readOnly={true} 
                          value={paymentAmountReceived} 
                          onClick={() => { 
                            const accountTotal = 
                              selectedAccountForPayment.subtotal + 
                              paymentTipValue - 
                              modalDiscountAmount; 
                            openNumpad( 
                              paymentAmountReceived || accountTotal.toFixed(2), 
                              accountTotal, 
                              "closed_account" 
                            ); 
                          }} 
                          onChange={(e) => 
                            setPaymentAmountReceived(e.target.value) 
                          } 
                          placeholder="0.00" 
                          style={{ 
                            width: "100%", 
                            border: "none", 
                            background: "transparent", 
                            textAlign: "left", 
                            fontWeight: "900", 
                            fontSize: "1.8rem", 
                            color: "#0f172a", 
                            outline: "none", 
                          }} 
                        /> 
                      </div> 
                      <button 
                        type="button" 
                        onClick={() => { 
                          const accountTotal = 
                            selectedAccountForPayment.subtotal + 
                            paymentTipValue - 
                            modalDiscountAmount; 
                          openNumpad( 
                            paymentAmountReceived || accountTotal.toFixed(2), 
                            accountTotal, 
                            "closed_account" 
                          ); 
                        }} 
                        style={{ 
                          background: "#e2e8f0", 
                          border: "1px solid #cbd5e1", 
                          padding: "10px", 
                          borderRadius: "14px", 
                          cursor: "pointer", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          boxShadow: "0 2px 4px rgba(0,0,0,0.06)", 
                          fontSize: "1.4rem", 
                          transition: "transform 0.1s ease", 
                        }} 
                        title="Teclado Numérico" 
                      > 
                        🔢 
                      </button> 
                    </div> 

                    <div 
                      style={{ 
                        marginTop: "12px", 
                        borderTop: "1px dashed #cbd5e1", 
                        paddingTop: "12px", 
                      }} 
                    > 
                      <span 
                        style={{ 
                          fontSize: "0.75rem", 
                          color: "#64748b", 
                          fontWeight: "bold", 
                          display: "block", 
                          marginBottom: "8px", 
                          textTransform: "uppercase", 
                          letterSpacing: "0.5px", 
                        }} 
                      > 
                        Suma Rápida de Billetes 💵 
                      </span> 
                      <div 
                        style={{ 
                          display: "flex", 
                          gap: "6px", 
                          overflowX: "auto", 
                          paddingBottom: "6px", 
                          scrollbarWidth: "none", 
                        }} 
                        className="no-scrollbar" 
                      > 
                        <button 
                          type="button" 
                          onClick={() => { 
                            const accountTotal = 
                              selectedAccountForPayment.subtotal + 
                              paymentTipValue - 
                              modalDiscountAmount; 
                            setPaymentAmountReceived(accountTotal.toFixed(2)); 
                          }} 
                          style={{ 
                            background: "#3b82f6", 
                            color: "white", 
                            border: "none", 
                            padding: "6px 12px", 
                            borderRadius: "10px", 
                            fontSize: "0.75rem", 
                            fontWeight: "bold", 
                            whiteSpace: "nowrap", 
                            cursor: "pointer", 
                          }} 
                        > 
                          🎯 Exacto 
                        </button> 
                        {[20, 50, 100, 200, 500, 1000].map((val) => ( 
                          <button 
                            key={val} 
                            type="button" 
                            onClick={() => { 
                              const cur = 
                                parseFloat(paymentAmountReceived) || 0; 
                              setPaymentAmountReceived( 
                                (cur + val).toString(), 
                              ); 
                            }} 
                            style={{ 
                              background: "white", 
                              color: "#0f172a", 
                              border: "1px solid #cbd5e1", 
                              padding: "6px 10px", 
                              borderRadius: "10px", 
                              fontSize: "0.75rem", 
                              fontWeight: "800", 
                              whiteSpace: "nowrap", 
                              cursor: "pointer", 
                            }} 
                          > 
                            💵 +${val} 
                          </button> 
                        ))} 
                        <button 
                          type="button" 
                          onClick={() => setPaymentAmountReceived("")} 
                          style={{ 
                            background: "#fee2e2", 
                            color: "#ef4444", 
                            border: "1px solid #fca5a5", 
                            padding: "6px 12px", 
                            borderRadius: "10px", 
                            fontSize: "0.75rem", 
                            fontWeight: "bold", 
                            whiteSpace: "nowrap", 
                            cursor: "pointer", 
                          }} 
                        > 
                          🚫 Borrar 
                        </button> 
                      </div> 
                    </div> 

                    {Number(paymentAmountReceived) > 0 && ( 
                      <div 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          marginTop: "12px", 
                        }} 
                      > 
                        <IonText color="medium">Cambio:</IonText> 
                        <IonText 
                          color={ 
                            Number(paymentAmountReceived) - 
                              (selectedAccountForPayment.subtotal + 
                                paymentTipValue - 
                                modalDiscountAmount) >= 
                            0 
                              ? "success" 
                              : "danger" 
                          } 
                          style={{ fontWeight: "black", fontSize: "1.2rem" }} 
                        > 
                          $ 
                          {( 
                            Number(paymentAmountReceived) - 
                            (selectedAccountForPayment.subtotal + 
                              paymentTipValue - 
                              modalDiscountAmount) 
                          ).toFixed(2)} 
                        </IonText> 
                      </div> 
                    )} 
                  </div> 
                )} 

                <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                  <IonButton
                    expand="block"
                    fill="outline"
                    color="medium"
                    onClick={() => setShowPaymentModal(false)}
                    style={{ flex: 1, height: "50px", "--border-radius": "14px" }}
                  >
                    Cancelar
                  </IonButton>
                  <IonButton
                    expand="block"
                    color="success"
                    onClick={() => confirmPayment(selectedAccountForPayment)}
                    disabled={
                      isProcessingPayment ||
                      (paymentMethod === "cash" && (Number(paymentAmountReceived) < (selectedAccountForPayment.subtotal + paymentTipValue - modalDiscountAmount) || !paymentAmountReceived)) ||
                      ((paymentMethod === "card" || paymentMethod === "transfer") && selectedTenant?.requireCardDigits !== false && (!paymentCardLastFour || paymentCardLastFour.length < 4))
                    }
                    style={{ flex: 2, height: "50px", "--border-radius": "14px", fontWeight: "bold" }}
                  >
                    Confirmar Pago ✓
                  </IonButton>
                </div>
              </div> 
            )} 
          </IonContent> 
        </IonModal> 
      </> 
    ); 
  }; 

  const renderNumpadModal = () => {
    const title = (() => {
      switch (numpadTarget) {
        case "card_digits":
          return "Últimos 4 Dígitos";
        case "checkout":
          return "Registrar Pago (Efectivo)";
        case "discount_target":
          return "Monto de Descuento";
        case "discount_value":
          return "Porcentaje de Descuento";
        case "tip_target":
          return "Monto de Propina";
        case "tip_value":
          return "Porcentaje de Propina";
        default:
          return "Teclado Numérico";
      }
    })();

    const subtitle = (() => {
      switch (numpadTarget) {
        case "card_digits":
          return "Ingresa los últimos 4 dígitos del comprobante";
        case "checkout":
          return "Ingresa la cantidad de efectivo recibida";
        default:
          return "Ingresa el valor para continuar";
      }
    })();

    const handleKeyClick = (val: string) => {
      if (val === "CLEAR") {
        setNumpadValue("");
      } else if (val === "BACKSPACE") {
        setNumpadValue((prev) => prev.slice(0, -1));
      } else if (val === "." || val === ",") {
        if (numpadTarget === "card_digits") return; // No decimals for last 4 digits
        if (isNumpadValueFresh) {
          setNumpadValue("0.");
          setIsNumpadValueFresh(false);
        } else if (!numpadValue.includes(".")) {
          setNumpadValue((prev) => (prev === "" ? "0." : prev + "."));
        }
      } else {
        // Number key press
        if (numpadTarget === "card_digits") {
          if (val === "00") return; // No double zero for card digits
          if (isNumpadValueFresh) {
            setNumpadValue(val);
            setIsNumpadValueFresh(false);
          } else if (numpadValue.length < 4) {
            setNumpadValue((prev) => prev + val);
          }
        } else {
          if (isNumpadValueFresh) {
            setNumpadValue(val);
            setIsNumpadValueFresh(false);
          } else {
            setNumpadValue((prev) => (prev === "0" ? val : prev + val));
          }
        }
      }
    };

    return (
      <IonModal
        isOpen={showNumpad}
        onDidDismiss={() => setShowNumpad(false)}
        style={{
          "--height": "560px",
          "--max-height": "95%",
          "--width": "100%",
          "--max-width": "420px",
          "--border-radius": "28px",
          "--box-shadow": "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        <div className="flex flex-col bg-slate-900 text-white h-full overflow-y-auto">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔢</span>
              <div>
                <h3 className="text-sm font-black text-rose-450 tracking-tight uppercase m-0 p-0">
                  {title}
                </h3>
                <p className="text-[11px] text-slate-300 font-bold m-0 p-0 mt-0.5">
                  {subtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowNumpad(false)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 cursor-pointer outline-none border-none transition"
            >
              <IonIcon icon={closeOutline} style={{ fontSize: "18px" }} />
            </button>
          </div>

          {/* Display & Total to Pay */}
          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {numpadTotal > 0 && numpadTarget !== "card_digits" && (
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl py-2.5 px-4 flex justify-between items-center text-xs font-bold text-slate-300">
                  <span className="uppercase tracking-wider">Total a pagar:</span>
                  <span className="text-emerald-400 font-black text-sm">
                    ${numpadTotal.toFixed(2)} MXN
                  </span>
                </div>
              )}

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-2 left-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {numpadTarget === "card_digits" ? "Dígitos Capturados" : "Monto Introducido"}
                </div>
                <div className="text-4xl font-extrabold text-rose-500 tracking-wider">
                  {numpadValue || (numpadTarget === "card_digits" ? "••••" : "0.00")}
                </div>
              </div>
            </div>

            {/* Keys Grid */}
            <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-2 shadow-inner">
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeyClick(num)}
                    className="bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-2xl text-lg font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => handleKeyClick("CLEAR")}
                  className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 h-12 rounded-2xl text-xs font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                >
                  C (Limpiar)
                </button>
                
                <button
                  type="button"
                  onClick={() => handleKeyClick("0")}
                  className="bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-2xl text-lg font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                >
                  0
                </button>

                {numpadTarget === "card_digits" ? (
                  <button
                    type="button"
                    onClick={() => handleKeyClick("BACKSPACE")}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-300 h-12 rounded-2xl text-xs font-black shadow flex items-center justify-center gap-1 active:scale-95 transition-all outline-none border-none cursor-pointer"
                  >
                    <IonIcon icon={backspaceOutline} style={{ fontSize: "16px" }} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleKeyClick("00")}
                    className="bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-2xl text-sm font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                  >
                    00
                  </button>
                )}
              </div>

              {numpadTarget !== "card_digits" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleKeyClick(".")}
                    className="bg-slate-800 hover:bg-slate-700 text-white h-11 rounded-2xl text-lg font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                  >
                    .
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeyClick("BACKSPACE")}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-300 h-11 rounded-2xl text-xs font-black shadow flex items-center justify-center gap-1 active:scale-95 transition-all outline-none border-none cursor-pointer"
                  >
                    <IonIcon icon={backspaceOutline} style={{ fontSize: "14px" }} />
                    Borrar
                  </button>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNumpadConfirm(numpadValue)}
                  className="w-full bg-emerald-650 hover:bg-emerald-600 text-white font-black text-xs py-3.5 rounded-2xl tracking-tight transition active:scale-95 shadow cursor-pointer border-none outline-none text-center uppercase"
                >
                  Aceptar / Confirmar ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      </IonModal>
    );
  };

  return (
    <>
      {renderPaymentModal()}
      {renderNumpadModal()}
    </>
  );
};
