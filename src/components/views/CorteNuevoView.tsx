import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';



interface CorteNuevoViewProps {
  arq100: any;
  arq1000: any;
  arq20: any;
  arq200: any;
  arq50: any;
  arq500: any;
  arqM05: any;
  arqM1: any;
  arqM10: any;
  arqM2: any;
  arqM5: any;
  arqueosHistory: any;
  cashierSessions: any;
  corteFilterUserId: any;
  corteNuevoAmount: any;
  corteNuevoConcept: any;
  corteNuevoDescription: any;
  corteNuevoType: any;
  currentUser: any;
  guidedAmount: any;
  guidedConcept: any;
  guidedDescription: any;
  guidedFlowStep: any;
  guidedSelectedSupplier: any;
  guidedSelectedUser: any;
  guidedType: any;
  history: any;
  setAppMode: any;
  setArq100: any;
  setArq1000: any;
  setArq20: any;
  setArq200: any;
  setArq50: any;
  setArq500: any;
  setArqM05: any;
  setArqM1: any;
  setArqM10: any;
  setArqM2: any;
  setArqM5: any;
  setCorteFilterUserId: any;
  setCorteNuevoAmount: any;
  setCorteNuevoConcept: any;
  setCorteNuevoDescription: any;
  setGastoCategory: any;
  setGastoDescription: any;
  setGastoItems: any;
  setGuidedAmount: any;
  setGuidedConcept: any;
  setGuidedDescription: any;
  setGuidedFlowStep: any;
  setGuidedSelectedSupplier: any;
  setGuidedSelectedUser: any;
  setGuidedType: any;
  setSelectedScheduleSupplier: any;
  setShowArqueoFormModal: any;
  setShowGastoRegisterModal: any;
  setShowPrintPreviewModal: any;
  setShowSidebar: any;
  setShowSupplierPurchaseModal: any;
  setSupplierPurchaseIsPaid: any;
  setSupplierPurchaseItems: any;
  showArqueoFormModal: any;
  showGastoRegisterModal: any;
  showPrintPreviewModal: any;
  showSupplierPurchaseModal: any;
  suppliers: any;
  syncStatus: any;
  triggerAppNotification: any;
  users: any;
}

export const CorteNuevoView: React.FC<CorteNuevoViewProps> = ({
  arq100,
  arq1000,
  arq20,
  arq200,
  arq50,
  arq500,
  arqM05,
  arqM1,
  arqM10,
  arqM2,
  arqM5,
  arqueosHistory,
  cashierSessions,
  corteFilterUserId,
  corteNuevoAmount,
  corteNuevoConcept,
  corteNuevoDescription,
  corteNuevoType,
  currentUser,
  guidedAmount,
  guidedConcept,
  guidedDescription,
  guidedFlowStep,
  guidedSelectedSupplier,
  guidedSelectedUser,
  guidedType,
  history,
  setAppMode,
  setArq100,
  setArq1000,
  setArq20,
  setArq200,
  setArq50,
  setArq500,
  setArqM05,
  setArqM1,
  setArqM10,
  setArqM2,
  setArqM5,
  setCorteFilterUserId,
  setCorteNuevoAmount,
  setCorteNuevoConcept,
  setCorteNuevoDescription,
  setGastoCategory,
  setGastoDescription,
  setGastoItems,
  setGuidedAmount,
  setGuidedConcept,
  setGuidedDescription,
  setGuidedFlowStep,
  setGuidedSelectedSupplier,
  setGuidedSelectedUser,
  setGuidedType,
  setSelectedScheduleSupplier,
  setShowArqueoFormModal,
  setShowGastoRegisterModal,
  setShowPrintPreviewModal,
  setShowSidebar,
  setShowSupplierPurchaseModal,
  setSupplierPurchaseIsPaid,
  setSupplierPurchaseItems,
  showArqueoFormModal,
  showGastoRegisterModal,
  showPrintPreviewModal,
  showSupplierPurchaseModal,
  suppliers,
  syncStatus,
  triggerAppNotification,
  users
}) => {
  return (
<DashboardView
      arq100={arq100}
      arq1000={arq1000}
      arq20={arq20}
      arq200={arq200}
      arq50={arq50}
      arq500={arq500}
      arqM05={arqM05}
      arqM1={arqM1}
      arqM10={arqM10}
      arqM2={arqM2}
      arqM5={arqM5}
      arqueosHistory={arqueosHistory}
      cashierSessions={cashierSessions}
      corteFilterUserId={corteFilterUserId}
      corteNuevoAmount={corteNuevoAmount}
      corteNuevoConcept={corteNuevoConcept}
      corteNuevoDescription={corteNuevoDescription}
      corteNuevoType={corteNuevoType}
      currentUser={currentUser}
      guidedAmount={guidedAmount}
      guidedConcept={guidedConcept}
      guidedDescription={guidedDescription}
      guidedFlowStep={guidedFlowStep}
      guidedSelectedSupplier={guidedSelectedSupplier}
      guidedSelectedUser={guidedSelectedUser}
      guidedType={guidedType}
      history={history}
      setAppMode={setAppMode}
      setArq100={setArq100}
      setArq1000={setArq1000}
      setArq20={setArq20}
      setArq200={setArq200}
      setArq50={setArq50}
      setArq500={setArq500}
      setArqM05={setArqM05}
      setArqM1={setArqM1}
      setArqM10={setArqM10}
      setArqM2={setArqM2}
      setArqM5={setArqM5}
      setCorteFilterUserId={setCorteFilterUserId}
      setCorteNuevoAmount={setCorteNuevoAmount}
      setCorteNuevoConcept={setCorteNuevoConcept}
      setCorteNuevoDescription={setCorteNuevoDescription}
      setGastoCategory={setGastoCategory}
      setGastoDescription={setGastoDescription}
      setGastoItems={setGastoItems}
      setGuidedAmount={setGuidedAmount}
      setGuidedConcept={setGuidedConcept}
      setGuidedDescription={setGuidedDescription}
      setGuidedFlowStep={setGuidedFlowStep}
      setGuidedSelectedSupplier={setGuidedSelectedSupplier}
      setGuidedSelectedUser={setGuidedSelectedUser}
      setGuidedType={setGuidedType}
      setSelectedScheduleSupplier={setSelectedScheduleSupplier}
      setShowArqueoFormModal={setShowArqueoFormModal}
      setShowGastoRegisterModal={setShowGastoRegisterModal}
      setShowPrintPreviewModal={setShowPrintPreviewModal}
      setShowSidebar={setShowSidebar}
      setShowSupplierPurchaseModal={setShowSupplierPurchaseModal}
      setSupplierPurchaseIsPaid={setSupplierPurchaseIsPaid}
      setSupplierPurchaseItems={setSupplierPurchaseItems}
      showArqueoFormModal={showArqueoFormModal}
      showGastoRegisterModal={showGastoRegisterModal}
      showPrintPreviewModal={showPrintPreviewModal}
      showSupplierPurchaseModal={showSupplierPurchaseModal}
      suppliers={suppliers}
      syncStatus={syncStatus}
      triggerAppNotification={triggerAppNotification}
      users={users}
      nullconstrenderCorteNuevo={nullconstrenderCorteNuevo}
    />
  );
};
