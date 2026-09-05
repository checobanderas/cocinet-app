import { getTenantUsers } from '../../utils/appHelpers';
import { ConfigurePrefixModal } from '../modals/ConfigurePrefixModal';
import { ManageCompaniesModal } from '../modals/ManageCompaniesModal';
import { PinsStructureModal } from '../modals/PinsStructureModal';
import { addDeviceRequest, saveCompanyConfigInFirebase, updateDeviceRequest } from '../../utils/firestore';
import { DeviceRequestsModal } from '../modals/DeviceRequestsModal';
import { OwnerCrudModal } from '../modals/OwnerCrudModal';
import { TenantCrudModal } from '../modals/TenantCrudModal';
import { TenantUsersModal } from '../modals/TenantUsersModal';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { logoToUse, logoUrl } from 'ionicons/icons';
import { getLockedTerminalTenantId } from '../../services/pwaTerminalService';

interface LoginViewProps {
  setCompanyCatalog: any;
  dependentBranches: any;
  logoUrl: any;
  logoToUse: any;
  COMPANY_CATALOG: any;
  activeOwnerFilter: any;
  allDeviceRequests: any;
  branchNamePrefix: any;
  companiesConfig: any;
  customOwnerPins: any;
  customOwnerSupervisorPins: any;
  customOwners: any;
  devReqName: any;
  devReqRole: any;
  deviceId: any;
  deviceRequest: any;
  editingOwner: any;
  editingTenant: any;
  formOwnerAccent: any;
  formOwnerAvatar: any;
  formOwnerLogo: any;
  formOwnerName: any;
  formOwnerPin: any;
  formOwnerSupervisorPin: any;
  formTenantAccentColor: any;
  formTenantAvatar: any;
  formTenantDireccion: any;
  formTenantEmail: any;
  formTenantLat: any;
  formTenantLng: any;
  formTenantLogoUrl: any;
  formTenantName: any;
  formTenantOwnerKey: any;
  formTenantPropietario: any;
  formTenantRequireInternalFolio: any;
  formTenantRfc: any;
  formTenantSucursal: any;
  formTenantType: any;
  handleAddRow: any;
  handleCellChange: any;
  handleDeleteOwner: any;
  handleDeleteRow: any;
  handleDeleteTenant: any;
  handleEditTenantClick: any;
  handleOwnerPinSubmit: any;
  handleSaveOwner: any;
  handleSaveTenant: any;
  isSavingTenant?: boolean;
  isSavingOwner?: boolean;
  handleSelectCompanyWithPinCheck: any;
  handleSupportAction: any;
  history: any;
  isMasterAdmin: any;
  masterAdminPin?: string;
  handleUpdateMasterPin?: (newPin: string) => Promise<boolean>;
  isOwnerUnlocked: any;
  loginSubStep: any;
  mexicoClockShort: any;
  modalTenant: any;
  modalUsers: any;
  notificationsGranted: any;
  ownerPasswordInput: any;
  restrictedOwnerKey: any;
  revealedPins: any;
  selectedTenant: any;
  setActiveOwnerFilter: any;
  setBranchNamePrefix: any;
  setDevReqName: any;
  setDevReqRole: any;
  setEditingOwner: any;
  setFormOwnerAccent: any;
  setFormOwnerAvatar: any;
  setFormOwnerLogo: any;
  setFormOwnerName: any;
  setFormOwnerPin: any;
  setFormOwnerSupervisorPin: any;
  setFormTenantAccentColor: any;
  setFormTenantAvatar: any;
  setFormTenantDireccion: any;
  setFormTenantEmail: any;
  setFormTenantLat: any;
  setFormTenantLng: any;
  setFormTenantLogoUrl: any;
  setFormTenantName: any;
  setFormTenantOwnerKey: any;
  setFormTenantPropietario: any;
  setFormTenantRequireInternalFolio: any;
  setFormTenantRfc: any;
  setFormTenantSucursal: any;
  setFormTenantType: any;
  setIsMasterAdmin: any;
  setIsOwnerUnlocked: any;
  setIsSystemsMode: any;
  setLoginSubStep: any;
  setModalTenant: any;
  setModalUsers: any;
  setNotificationsGranted: any;
  setOwnerPasswordInput: any;
  setRestrictedOwnerKey: any;
  setRevealedPins: any;
  setSelectedLoginUser: any;
  setShowConfigurePrefixModal: any;
  setShowDeviceRequestsModal: any;
  setShowManageCompaniesModal: any;
  setShowOwnerCrudModal: any;
  setShowPinPanel: any;
  setShowPinsStructureModal: any;
  setShowTenantCrudModal: any;
  setShowTenantUsersModal: any;
  setTenantsVersion: any;
  setTransferIncludeBranches: any;
  setTransferStep: any;
  setTransferTargetOwnerKey: any;
  showConfigurePrefixModal: any;
  showDeviceRequestsModal: any;
  showManageCompaniesModal: any;
  showOwnerCrudModal: any;
  showPinPanel: any;
  showPinsStructureModal: any;
  showTenantCrudModal: any;
  showTenantUsersModal: any;
  transferIncludeBranches: any;
  transferStep: any;
  transferTargetOwnerKey: any;
  triggerAppNotification: any;
  users: any;
  executeTenantTransfer: any;
  resetTenantForm: any;
  companiesConfig: any;
  setCompaniesConfig: any;
  searchCompanyQuery: any;
  setSearchCompanyQuery: any;
  setSelectedTenant: any;
  formTenantAllowEfectivo: any;
  setFormTenantAllowEfectivo: any;
  formTenantAllowTarjeta: any;
  setFormTenantAllowTarjeta: any;
  formTenantAllowTransferencia: any;
  setFormTenantAllowTransferencia: any;
  formTenantAllowLupay: any;
  setFormTenantAllowLupay: any;
  formTenantRequireCardDigits: any;
  setFormTenantRequireCardDigits: any;
}

export const LoginView: React.FC<LoginViewProps> = ({
  COMPANY_CATALOG,
  activeOwnerFilter,
  allDeviceRequests,
  branchNamePrefix,
  companiesConfig,
  customOwnerPins,
  customOwnerSupervisorPins,
  customOwners,
  devReqName,
  devReqRole,
  deviceId,
  deviceRequest,
  editingOwner,
  editingTenant,
  formOwnerAccent,
  formOwnerAvatar,
  formOwnerLogo,
  formOwnerName,
  formOwnerPin,
  formOwnerSupervisorPin,
  formTenantAccentColor,
  formTenantAvatar,
  formTenantDireccion,
  formTenantEmail,
  formTenantLat,
  formTenantLng,
  formTenantLogoUrl,
  formTenantName,
  formTenantOwnerKey,
  formTenantPropietario,
  formTenantRequireInternalFolio,
  formTenantRfc,
  formTenantSucursal,
  formTenantType,
  handleAddRow,
  handleCellChange,
  handleDeleteOwner,
  handleDeleteRow,
  handleDeleteTenant,
  handleEditTenantClick,
  handleOwnerPinSubmit,
  handleSaveOwner,
  handleSaveTenant,
  isSavingTenant,
  isSavingOwner,
  handleSelectCompanyWithPinCheck,
  handleSupportAction,
  history,
  isMasterAdmin,
  masterAdminPin,
  handleUpdateMasterPin,
  isOwnerUnlocked,
  loginSubStep,
  mexicoClockShort,
  modalTenant,
  modalUsers,
  notificationsGranted,
  ownerPasswordInput,
  restrictedOwnerKey,
  revealedPins,
  selectedTenant,
  setActiveOwnerFilter,
  setBranchNamePrefix,
  setDevReqName,
  setDevReqRole,
  setEditingOwner,
  setFormOwnerAccent,
  setFormOwnerAvatar,
  setFormOwnerLogo,
  setFormOwnerName,
  setFormOwnerPin,
  setFormOwnerSupervisorPin,
  setFormTenantAccentColor,
  setFormTenantAvatar,
  setFormTenantDireccion,
  setFormTenantEmail,
  setFormTenantLat,
  setFormTenantLng,
  setFormTenantLogoUrl,
  setFormTenantName,
  setFormTenantOwnerKey,
  setFormTenantPropietario,
  setFormTenantRequireInternalFolio,
  setFormTenantRfc,
  setFormTenantSucursal,
  setFormTenantType,
  setIsMasterAdmin,
  setIsOwnerUnlocked,
  setIsSystemsMode,
  setLoginSubStep,
  setModalTenant,
  setModalUsers,
  setNotificationsGranted,
  setOwnerPasswordInput,
  setRestrictedOwnerKey,
  setRevealedPins,
  setSelectedLoginUser,
  setShowConfigurePrefixModal,
  setShowDeviceRequestsModal,
  setShowManageCompaniesModal,
  setShowOwnerCrudModal,
  setShowPinPanel,
  setShowPinsStructureModal,
  setShowTenantCrudModal,
  setShowTenantUsersModal,
  setTenantsVersion,
  setTransferIncludeBranches,
  setTransferStep,
  setTransferTargetOwnerKey,
  showConfigurePrefixModal,
  showDeviceRequestsModal,
  showManageCompaniesModal,
  showOwnerCrudModal,
  showPinPanel,
  showPinsStructureModal,
  showTenantCrudModal,
  showTenantUsersModal,
  transferIncludeBranches,
  transferStep,
  transferTargetOwnerKey,
  triggerAppNotification,
  users,
  executeTenantTransfer, resetTenantForm,
  setCompanyCatalog,
  dependentBranches,
  logoUrl,
  logoToUse,
  setCompaniesConfig,
  searchCompanyQuery,
  setSearchCompanyQuery,
  setSelectedTenant,
  formTenantAllowEfectivo,
  setFormTenantAllowEfectivo,
  formTenantAllowTarjeta,
  setFormTenantAllowTarjeta,
  formTenantAllowTransferencia,
  setFormTenantAllowTransferencia,
  formTenantAllowLupay,
  setFormTenantAllowLupay,
  formTenantRequireCardDigits,
  setFormTenantRequireCardDigits,
}) => {
  const [showEditMasterPinModal, setShowEditMasterPinModal] = React.useState(false);
  const [newMasterPinInput, setNewMasterPinInput] = React.useState("");
  const [confirmMasterPinInput, setConfirmMasterPinInput] = React.useState("");
  const [isSavingMasterPin, setIsSavingMasterPin] = React.useState(false);

  // 🏢 Resolver Tenant activo e identidad de marca (Logo / Avatar / Nombre)
  const lockedTerminalId = typeof window !== "undefined" ? getLockedTerminalTenantId() : null;
  const effectiveTenant = selectedTenant || (lockedTerminalId ? COMPANY_CATALOG?.find((c: any) => c.id === lockedTerminalId) : null);

  const effectiveOwnerObj = effectiveTenant?.ownerKey
    ? (Array.isArray(customOwners) ? customOwners.find((o: any) => o.key === effectiveTenant.ownerKey) : null)
    : null;

  const resolvedTenantLogo = (effectiveTenant && (effectiveTenant.logoUrl || effectiveTenant.logo)) || (effectiveOwnerObj && effectiveOwnerObj.logo) || "";
  const resolvedTenantName = effectiveTenant ? (effectiveTenant.name || effectiveTenant.sucursalDefault || "COCINET") : "COCINET Pro";
  const resolvedTenantAvatar = effectiveTenant?.avatar || "🍽️";
  const resolvedAccentColor = effectiveTenant?.accentColor || "#2563eb";
  const neutralPlatformLogo = "https://img.icons8.com/fluency/256/restaurant.png";

return (
      <IonPage>
        <TenantUsersModal
          showTenantUsersModal={showTenantUsersModal}
          setShowTenantUsersModal={setShowTenantUsersModal}
          modalTenant={modalTenant}
          modalUsers={modalUsers}
          handleAddRow={handleAddRow}
          handleCellChange={handleCellChange}
          handleDeleteRow={handleDeleteRow}
          revealedPins={revealedPins}
          setRevealedPins={setRevealedPins}
          triggerAppNotification={triggerAppNotification}
        />
        <TenantCrudModal
          showTenantCrudModal={showTenantCrudModal}
          setShowTenantCrudModal={setShowTenantCrudModal}
          editingTenant={editingTenant}
          resetTenantForm={resetTenantForm}
          COMPANY_CATALOG={COMPANY_CATALOG}
          customOwners={customOwners}
          dependentBranches={dependentBranches}
          formTenantType={formTenantType}
          setFormTenantType={setFormTenantType}
          formTenantName={formTenantName}
          setFormTenantName={setFormTenantName}
          formTenantPropietario={formTenantPropietario}
          setFormTenantPropietario={setFormTenantPropietario}
          formTenantOwnerKey={formTenantOwnerKey}
          setFormTenantOwnerKey={setFormTenantOwnerKey}
          formTenantSucursal={formTenantSucursal}
          setFormTenantSucursal={setFormTenantSucursal}
          formTenantRfc={formTenantRfc}
          setFormTenantRfc={setFormTenantRfc}
          formTenantDireccion={formTenantDireccion}
          setFormTenantDireccion={setFormTenantDireccion}
          formTenantEmail={formTenantEmail}
          setFormTenantEmail={setFormTenantEmail}
          formTenantLat={formTenantLat}
          setFormTenantLat={setFormTenantLat}
          formTenantLng={formTenantLng}
          setFormTenantLng={setFormTenantLng}
          formTenantLogoUrl={formTenantLogoUrl}
          setFormTenantLogoUrl={setFormTenantLogoUrl}
          formTenantAvatar={formTenantAvatar}
          setFormTenantAvatar={setFormTenantAvatar}
          formTenantAccentColor={formTenantAccentColor}
          setFormTenantAccentColor={setFormTenantAccentColor}
          formTenantRequireInternalFolio={formTenantRequireInternalFolio}
          setFormTenantRequireInternalFolio={setFormTenantRequireInternalFolio}
          formTenantAllowEfectivo={formTenantAllowEfectivo}
          setFormTenantAllowEfectivo={setFormTenantAllowEfectivo}
          formTenantAllowTarjeta={formTenantAllowTarjeta}
          setFormTenantAllowTarjeta={setFormTenantAllowTarjeta}
          formTenantAllowTransferencia={formTenantAllowTransferencia}
          setFormTenantAllowTransferencia={setFormTenantAllowTransferencia}
          formTenantAllowLupay={formTenantAllowLupay}
          setFormTenantAllowLupay={setFormTenantAllowLupay}
          formTenantRequireCardDigits={formTenantRequireCardDigits}
          setFormTenantRequireCardDigits={setFormTenantRequireCardDigits}
          transferStep={transferStep}
          setTransferStep={setTransferStep}
          transferTargetOwnerKey={transferTargetOwnerKey}
          setTransferTargetOwnerKey={setTransferTargetOwnerKey}
          transferIncludeBranches={transferIncludeBranches}
          setTransferIncludeBranches={setTransferIncludeBranches}
          handleSaveTenant={handleSaveTenant}
          handleDeleteTenant={handleDeleteTenant}
          executeTenantTransfer={executeTenantTransfer}
          triggerAppNotification={triggerAppNotification}
          isSavingTenant={isSavingTenant}
        />
        <OwnerCrudModal
          showOwnerCrudModal={showOwnerCrudModal}
          setShowOwnerCrudModal={setShowOwnerCrudModal}
          editingOwner={editingOwner}
          setEditingOwner={setEditingOwner}
          formOwnerName={formOwnerName}
          setFormOwnerName={setFormOwnerName}
          formOwnerPin={formOwnerPin}
          setFormOwnerPin={setFormOwnerPin}
          formOwnerSupervisorPin={formOwnerSupervisorPin}
          setFormOwnerSupervisorPin={setFormOwnerSupervisorPin}
          formOwnerAccent={formOwnerAccent}
          setFormOwnerAccent={setFormOwnerAccent}
          formOwnerLogo={formOwnerLogo}
          setFormOwnerLogo={setFormOwnerLogo}
          formOwnerAvatar={formOwnerAvatar}
          setFormOwnerAvatar={setFormOwnerAvatar}
          handleSaveOwner={handleSaveOwner}
          handleDeleteOwner={handleDeleteOwner}
          triggerAppNotification={triggerAppNotification}
          isSavingOwner={isSavingOwner}
        />
        {/* Device Requests Modal (Master Admin only) */}
        <DeviceRequestsModal
          showDeviceRequestsModal={showDeviceRequestsModal}
          setShowDeviceRequestsModal={setShowDeviceRequestsModal}
          allDeviceRequests={allDeviceRequests}
          COMPANY_CATALOG={COMPANY_CATALOG}
          updateDeviceRequest={updateDeviceRequest}
        />

        

        {/* Modal informativo sobre Estructura Systemática de PINs de Acceso */}
        <PinsStructureModal
          showPinsStructureModal={showPinsStructureModal}
          setShowPinsStructureModal={setShowPinsStructureModal}
          COMPANY_CATALOG={COMPANY_CATALOG}
        />

        {/* Modal Gestor de Empresas (MySQL Model) */}
<ManageCompaniesModal
          showManageCompaniesModal={showManageCompaniesModal}
          setShowManageCompaniesModal={setShowManageCompaniesModal}
          activeOwnerFilter={activeOwnerFilter}
          users={users}
          COMPANY_CATALOG={COMPANY_CATALOG}
          setCompanyCatalog={setCompanyCatalog}
          triggerAppNotification={triggerAppNotification}
          companiesConfig={companiesConfig}
          setCompaniesConfig={setCompaniesConfig}
          searchCompanyQuery={searchCompanyQuery}
          setSearchCompanyQuery={setSearchCompanyQuery}
          selectedTenant={selectedTenant}
          setSelectedTenant={setSelectedTenant}
          item={null}
        />

        {/* Modal Configurar Sucursales (Filtros por Prefijo Roy/Sombrerudos) */}
        <ConfigurePrefixModal
          showConfigurePrefixModal={showConfigurePrefixModal}
          setShowConfigurePrefixModal={setShowConfigurePrefixModal}
          branchNamePrefix={branchNamePrefix}
          setBranchNamePrefix={setBranchNamePrefix}
          triggerAppNotification={triggerAppNotification}
          COMPANY_CATALOG={COMPANY_CATALOG}
        />

        <IonContent
          style={{
            "--background": "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            "--padding-top": "0px",
            "--padding-bottom": "0px",
            "--padding-start": "0px",
            "--padding-end": "0px",
          }}
        >
          <style>{`
            @keyframes lock-glowing-pulse {
              0%, 100% {
                transform: scale(1);
                filter: drop-shadow(0 0 2px rgba(217, 119, 6, 0.4));
              }
              50% {
                transform: scale(1.22);
                filter: drop-shadow(0 0 12px rgba(217, 119, 6, 0.85));
              }
            }
            .animate-lock {
              display: inline-block;
              animation: lock-glowing-pulse 1.8s infinite ease-in-out;
            }
          `}</style>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              padding: "0",
            }}
          >
            {!showPinPanel && (
              <div
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest(".no-pin-trigger") || target.closest("button") || target.closest("[role='button']")) {
                    return;
                  }
                  setShowPinPanel(true);
                }}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  minHeight: "100vh",
                  maxHeight: "100vh",
                  margin: "0",
                  padding: "1rem 1rem",
                  backgroundColor: "#f4ecd8",
                  textAlign: "center",
                  boxShadow: "inset 0 0 40px rgba(140, 124, 104, 0.3)",
                  borderRadius: "0px",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
                className="select-none overflow-hidden"
              >
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    right: "10px",
                    bottom: "10px",
                    border: "2px solid #8c7c68",
                    opacity: 0.4,
                    pointerEvents: "none",
                  }}
                ></div>

                {/* 🌊 MARCA DE AGUA DEL LOGO OFICIAL COCINET / TENANT */}
                {/* 🎨 EMBLEMA / LOGO DE FONDO (MARCA DE AGUA) */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "min(85vw, 480px)",
                    height: "min(85vh, 480px)",
                    backgroundImage: resolvedTenantLogo
                      ? `url('${resolvedTenantLogo}')`
                      : `url('${neutralPlatformLogo}')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "contain",
                    opacity: resolvedTenantLogo ? 0.12 : 0.04,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />

                {/* 🎨 EMBLEMA / LOGO SUPERIOR DEL SISTEMA O DE LA SUCURSAL */}
                <div className="relative z-10 mb-2 flex flex-col items-center justify-center">
                  {resolvedTenantLogo ? (
                    <img
                      src={resolvedTenantLogo}
                      alt={resolvedTenantName}
                      className="h-20 sm:h-24 max-h-[22vh] w-auto object-contain drop-shadow-md transition-transform hover:scale-105"
                      style={{ filter: "drop-shadow(0px 4px 10px rgba(45, 36, 28, 0.18))" }}
                    />
                  ) : effectiveTenant ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 p-2.5 px-5 rounded-2xl bg-white/80 backdrop-blur-xs border border-amber-900/15 shadow-xs">
                      <div 
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-inner"
                        style={{ backgroundColor: `${resolvedAccentColor}18`, border: `2px solid ${resolvedAccentColor}50` }}
                      >
                        <span>{resolvedTenantAvatar}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 text-center max-w-[280px] leading-tight">
                        {resolvedTenantName}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <img
                        src={neutralPlatformLogo}
                        alt="COCINET Pro"
                        className="h-16 sm:h-20 max-h-[18vh] w-auto object-contain drop-shadow-md"
                      />
                      <span className="text-sm sm:text-base font-black tracking-wider text-slate-900 uppercase">
                        COCINET <span className="text-blue-600 font-extrabold">PRO</span>
                      </span>
                    </div>
                  )}
                  <span
                    className="mt-2 px-3.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#2d241c]/75 bg-[#2d241c]/5 border border-[#2d241c]/10 shadow-2xs"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    SEP 2026
                  </span>
                </div>

                {/* 🔒 GRAN CANDADO PULSANTE EN EL CENTRO */}
                <div className="my-2.5 relative z-10">
                  <span
                    className="animate-lock cursor-pointer"
                    style={{ fontSize: "2.8rem" }}
                    role="img"
                    aria-label="candado"
                  >
                    🔒
                  </span>
                  <div className="text-[12px] sm:text-[13px] font-black uppercase text-amber-800 tracking-wider mt-1">
                    Haga clic para acceder
                  </div>
                </div>

                {/* 📞💬🎬 FILA DE EMOJIS DE SOPORTE DIRECTO DEBAJO DEL CANDADO */}
                <div 
                  className="flex flex-col items-center justify-center mt-3 pt-3 border-t border-dashed border-[#8c7c68]/40 w-full no-pin-trigger relative z-20"
                  onClick={(e) => e.stopPropagation()} // Para que hacer clic en los emojis no abra el panel del PIN
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-[11px] sm:text-[12px] font-extrabold uppercase text-amber-900/80 tracking-widest mb-2">
                    Soporte técnico
                  </div>
                  <div className="flex items-center justify-center gap-7">
                    {/* Teléfono */}
                    <button
                      type="button"
                      onClick={(e) => handleSupportAction("phone", e)}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-3xl sm:text-4xl hover:scale-130 active:scale-95 transition-all duration-200 select-none cursor-pointer bg-transparent border-none p-0 focus:outline-none relative z-30"
                      title="Llamar al 951-127-3796"
                    >
                      📞
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={(e) => handleSupportAction("whatsapp", e)}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-3xl sm:text-4xl hover:scale-130 active:scale-95 transition-all duration-200 select-none cursor-pointer bg-transparent border-none p-0 focus:outline-none relative z-30"
                      title="Enviar WhatsApp al 951-127-3796"
                    >
                      💬
                    </button>

                    {/* Video Tutorial / FAQ (🎬) */}
                    <button
                      type="button"
                      onClick={(e) => handleSupportAction("video", e)}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-3xl sm:text-4xl hover:scale-130 active:scale-95 transition-all duration-200 select-none cursor-pointer bg-transparent border-none p-0 focus:outline-none relative z-30"
                      title="Video Tutorial y Preguntas Frecuentes"
                    >
                      🎬
                    </button>
                  </div>
                </div>

                {/* 📅 Reloj y Calendario en tiempo real estilo Tarjeta */}
                <div 
                  className="mt-3 flex flex-col items-stretch justify-center gap-3 bg-[#fcf9f2]/90 backdrop-blur-sm border border-[#d2c2ad] rounded-2xl p-4 shadow-sm max-w-[420px] mx-auto w-full no-pin-trigger relative z-20"
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Fecha - Tipo Calendario */}
                  <div className="flex items-center justify-center gap-3 text-[#5c4d3c] w-full text-center">
                    <div className="text-3xl select-none shrink-0" role="img" aria-label="Calendario">📅</div>
                    <div className="text-center">
                      <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Fecha</div>
                      <div className="text-[16px] sm:text-[17px] font-black uppercase text-slate-700 leading-tight">
                        {(() => {
                          const str = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
                          return str.charAt(0).toUpperCase() + str.slice(1);
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Separador Horizontal */}
                  <div className="w-full h-[1px] bg-[#d2c2ad]"></div>

                  {/* Hora - Tipo Reloj */}
                  <div className="flex items-center justify-center gap-3 text-[#5c4d3c] w-full text-center">
                    <div className="text-3xl select-none shrink-0" role="img" aria-label="Reloj">⏰</div>
                    <div className="text-center">
                      <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Hora</div>
                      <div className="text-[20px] sm:text-[22px] font-black font-mono tracking-widest text-slate-800 leading-none">
                        {mexicoClockShort || new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1rem",
                    borderTop: "2px dashed #8c7c68",
                    fontSize: "1rem",
                    color: "#4a3f35",
                    letterSpacing: "2px",
                    fontWeight: "bold",
                  }}
                ></div>
              </div>
            )}

            {/* 📱 SECTOR DE REGISTRO DE DISPOSITIVO */}
            {!showPinPanel && loginSubStep === "device_registration" ? (
              <div className="w-full max-w-[600px] bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md mb-8 space-y-6 text-center mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center shadow-inner">
                     <i className="fa-solid fa-mobile-screen-button text-4xl text-indigo-500"></i>
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">Vincular Dispositivo</h2>
                  <p className="text-slate-500 text-sm">
                    Este dispositivo no está vinculado a ninguna sucursal. Ingresa tus datos para mandar una solicitud al administrador.
                  </p>

                  {!deviceRequest || deviceRequest.status === "rejected" ? (
                    <form 
                      className="w-full space-y-4 mt-4 text-left"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!devReqName) {
                           alert("Ingresa tu nombre"); return;
                        }
                        await addDeviceRequest({
                           deviceId,
                           deviceName: devReqName,
                           role: devReqRole,
                        });
                      }}
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tu Nombre</label>
                        <input
                          type="text"
                          value={devReqName}
                          onChange={(e) => setDevReqName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                          placeholder="Ej. Juan Pérez"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Puesto / Rol</label>
                        <select
                          value={devReqRole}
                          onChange={(e) => setDevReqRole(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        >
                          <option value="mesero">Mesero (Atención general)</option>
                          <option value="cajero">Cajero (Cobro e Inventarios)</option>
                        </select>
                      </div>
                      
                      {deviceRequest?.status === "rejected" && (
                         <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2">
                           <i className="fa-solid fa-circle-xmark"></i> Solicitud rechazada. Intenta de nuevo.
                         </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-md transition-all active:scale-[0.98] mt-4 shadow-indigo-600/20"
                      >
                        Enviar Solicitud al Administrador <i className="fa-solid fa-paper-plane ml-2"></i>
                      </button>

                    </form>
                  ) : (
                    <div className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center gap-4">
                       <i className="fa-solid fa-spinner fa-spin text-3xl text-indigo-500"></i>
                       <h3 className="text-lg font-bold text-slate-800">Esperando Autorización...</h3>
                       <p className="text-sm text-slate-500 text-center">
                         Notificamos al administrador. Una vez que apruebe tu dispositivo, entrarás automáticamente al sistema.
                       </p>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl w-full border border-slate-200">
                    <p className="text-[12px] text-slate-500 mb-2 font-bold uppercase tracking-widest">¿Eres Administrador?</p>
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        placeholder="PIN..." 
                        className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none text-center w-24 font-mono tracking-widest"
                        onChange={(e) => {
                          if (e.target.value === "2052") {
                            setIsMasterAdmin(true);
                            localStorage.setItem("pos_master_admin", "true");
                            setLoginSubStep("tenant");
                            if (typeof window !== "undefined" && "Notification" in window) {
                               Notification.requestPermission();
                            }
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : showPinPanel ? (
              <div className="w-full max-w-[600px] landscape:max-w-[1200px] lg:max-w-[1200px] bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md mb-8 space-y-6 text-center animate-fade-in mx-auto">
                
                {/* 🛡️ BANNER SUPERIOR CON ESTADO DE RED LOCAL Y WEBSOCKETS (Solo se muestra en el Paso 2 si ya está desbloqueado) */}
                {(isOwnerUnlocked || restrictedOwnerKey) && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4 text-left">
                    <div>
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        BIENVENIDO
                      </h3>
                      <p className="text-[11px] text-slate-500 font-bold">
                        📅 {new Date().toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • ⏰ {new Date().toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMasterAdmin(false);
                          localStorage.removeItem("pos_master_admin");
                          setIsSystemsMode(false);
                          localStorage.setItem("cocinet_is_systems", "false");
                          setIsOwnerUnlocked(false);
                          localStorage.setItem("cocinet_is_owner_unlocked", "false");
                          setActiveOwnerFilter(null);
                          localStorage.removeItem("cocinet_active_owner_filter");
                          setRestrictedOwnerKey(null);
                          localStorage.removeItem("cocinet_restricted_owner_key");
                          setSelectedLoginUser(null);
                          setLoginSubStep("tenant");
                          setShowPinPanel(false);
                          try {
                            window.history.replaceState({}, document.title, window.location.pathname);
                          } catch (e) {}
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer select-none border-none"
                      >
                        🚪 Volver a Inicio
                      </button>
                    </div>
                  </div>
                )}

                {/* 🤠 PASO 1: SELECCIÓN DEL PROPIETARIO / PATRÓN (BLOQUEO DE VISTA DE CONTEOS) */}
                {!isOwnerUnlocked && !restrictedOwnerKey ? (
                  <div className="space-y-6 py-4 max-w-sm mx-auto transition-all duration-300">
                    <div className="text-left">
                      <button
                        type="button"
                        onClick={() => {
                          setOwnerPasswordInput("");
                          setShowPinPanel(false);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black rounded-xl flex items-center gap-1.5 transition-all select-none border-none cursor-pointer"
                      >
                        ↩️ Volver a Inicio
                      </button>
                    </div>

                    <div className="text-center space-y-1 pb-2">
                      <span className="text-[13px] uppercase font-extrabold text-indigo-700 tracking-widest bg-indigo-50 px-3.5 py-1 rounded-full inline-block mb-1.5 shadow-2xs">
                        {effectiveTenant ? `Sucursal: ${resolvedTenantName} 🏪` : "Acceso al Sistema 🔒"}
                      </span>
                      <h4 className="text-lg font-black text-slate-800 tracking-tight">
                        Ingrese su PIN de Seguridad 🔑
                      </h4>
                    </div>

                    {/* Display Dots */}
                    <div className="flex justify-center gap-3 my-4">
                      {[0, 1, 2, 3].map((index) => {
                        const hasDigit = ownerPasswordInput.length > index;
                        return (
                          <div
                            key={index}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                              hasDigit
                                ? "bg-indigo-600 border-indigo-600 scale-110"
                                : "bg-slate-100 border-slate-300"
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Numeric Keypad */}
                    <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            if (ownerPasswordInput.length < 4) {
                              const newVal = ownerPasswordInput + num;
                              setOwnerPasswordInput(newVal);
                              if (newVal.length === 4) {
                                handleOwnerPinSubmit(newVal);
                              }
                            }
                          }}
                          className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xl font-bold flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer select-none"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setOwnerPasswordInput("")}
                        className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-black flex items-center justify-center transition-all active:scale-95 cursor-pointer select-none"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (ownerPasswordInput.length < 4) {
                            const newVal = ownerPasswordInput + "0";
                            setOwnerPasswordInput(newVal);
                            if (newVal.length === 4) {
                              handleOwnerPinSubmit(newVal);
                            }
                          }
                        }}
                        className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xl font-bold flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer select-none"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (ownerPasswordInput.length > 0) {
                            setOwnerPasswordInput(ownerPasswordInput.slice(0, -1));
                          }
                        }}
                        className="w-16 h-16 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xl font-bold flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer select-none"
                      >
                        ⌫
                      </button>
                    </div>

                    <div className="pt-2 text-center">
                      <p className="text-[11px] text-slate-400 font-semibold m-0">
                        🛡️ Terminal aislada y segura • Cocinet POS
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 🏢 PASO 2: SELECCIÓN DE EMPRESA, MATRIZ O SUCURSAL */
                  <div className="space-y-6 transition-all duration-300">
                    
                    {/* ENCABEZADO DE ENFOQUE PROPIETARIO */}
                    {(() => {
                      const ownerObj = customOwners.find(o => o.key === activeOwnerFilter);
                      if (!ownerObj && activeOwnerFilter) return null;

                      const selectedOwnerName = ownerObj ? `${ownerObj.name} ${ownerObj.avatar}` : "Auditor Maestro 🌟";
                      const selectedOwnerAvatar = ownerObj ? ownerObj.avatar : "🌟";
                      
                      const selectedOwnerBg = 
                        ownerObj?.accentColor === "red" ? "bg-red-50 text-red-900 border-red-200" :
                        ownerObj?.accentColor === "purple" ? "bg-purple-50 text-purple-900 border-purple-200" :
                        ownerObj?.accentColor === "pink" ? "bg-pink-50 text-pink-900 border-pink-200" :
                        ownerObj?.accentColor === "teal" ? "bg-teal-50 text-teal-900 border-teal-200" :
                        ownerObj?.accentColor === "amber" ? "bg-amber-50 text-amber-900 border-amber-200" :
                        ownerObj?.accentColor === "emerald" ? "bg-emerald-50 text-emerald-900 border-emerald-200" :
                        ownerObj?.accentColor === "indigo" ? "bg-indigo-50 text-indigo-900 border-indigo-200" :
                        ownerObj?.accentColor === "cyan" ? "bg-cyan-50 text-cyan-900 border-cyan-200" :
                        "bg-indigo-50 text-indigo-900 border-indigo-200";

                      return (
                        <div className={`p-4 rounded-2xl border ${selectedOwnerBg} text-left flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm`}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{selectedOwnerAvatar}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black uppercase tracking-tight">
                                  GRUPO: {ownerObj ? ownerObj.name : "VISTA GLOBAL DE RED"}
                                </h3>
                                {isMasterAdmin && ownerObj && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingOwner(ownerObj);
                                      setFormOwnerName(ownerObj.name);
                                      setFormOwnerAvatar(ownerObj.avatar);
                                      setFormOwnerAccent(ownerObj.accentColor);
                                      setFormOwnerPin(customOwnerPins[ownerObj.key] || "");
                                      setShowOwnerCrudModal(true);
                                    }}
                                    className="p-1 hover:bg-black/5 rounded text-[11px] cursor-pointer transition-all border-none bg-transparent font-bold"
                                    title="Modificar Nombre del Propietario"
                                  >
                                    ✏️
                                  </button>
                                )}
                              </div>
                              <p className="text-[10px] opacity-75 font-bold">
                                {ownerObj ? `Clave de Red: #${ownerObj.key} • PIN Acceso: ${customOwnerPins[ownerObj.key] || "No asig."}` : "Consola maestra de supervisión de transacciones locales."}
                              </p>
                            </div>
                          </div>
               
                          {!restrictedOwnerKey && (activeOwnerFilter || !isMasterAdmin) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (isMasterAdmin) {
                                  setActiveOwnerFilter(null);
                                  localStorage.removeItem("cocinet_active_owner_filter");
                                  triggerAppNotification(
                                    "👥 Directorio de Patrones",
                                    "Regresando al directorio general de propietarios.",
                                    "info"
                                  );
                                } else {
                                  setIsOwnerUnlocked(false);
                                  localStorage.setItem("cocinet_is_owner_unlocked", "false");
                                  setActiveOwnerFilter(null);
                                  localStorage.removeItem("cocinet_active_owner_filter");
                                  triggerAppNotification(
                                    "🔒 Filtro Retirado",
                                    "Regresando a la selección del propietario principal.",
                                    "info"
                                  );
                                }
                              }}
                              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl px-4 py-2 text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs"
                            >
                              ⬅️ Cambiar Patrón
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    <div className="text-center max-w-xl mx-auto space-y-1">
                      <span className="text-[10px] uppercase font-extrabold text-teal-700 tracking-widest bg-teal-50 px-2.5 py-1 rounded-full">
                        Paso 2 de 2: Conexión de Empresa y Sucursal
                      </span>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                        Seleccione el Punto de Venta / Sucursal Autorizada
                      </h4>
                      <p className="text-[11px] text-slate-500 font-bold">
                        Las cuentas, comandas y arqueos físicos se guardarán exclusivamente bajo esta base de datos local con UUIDs únicos de sincronización en caliente.
                      </p>
                    </div>

                    {isMasterAdmin && (
                      <div className="flex flex-wrap items-center justify-center gap-2.5 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            resetTenantForm();
                            setShowTenantCrudModal(true);
                          }}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md border-none uppercase tracking-wider animate-pulse"
                          style={{ backgroundColor: "#e11d48" }}
                        >
                          🛠️ Registrar / Gestionar Inquilinos
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewMasterPinInput(masterAdminPin || "2052");
                            setConfirmMasterPinInput(masterAdminPin || "2052");
                            setShowEditMasterPinModal(true);
                          }}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md border-none uppercase tracking-wider"
                        >
                          🔑 Cambiar PIN Maestro (Actual: {masterAdminPin || "2052"})
                        </button>
                      </div>
                    )}

                    {(() => {
                      if (isMasterAdmin && !activeOwnerFilter) {
                        // Render Propietarios list as cards
                        return (
                          <div className="space-y-6 text-left">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
                              <div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                  👥 Directorio de Propietarios Autorizados
                                </h3>
                                <p className="text-[11px] text-slate-500 font-bold">
                                  Seleccione un propietario para gestionar su red de matrices, puntos de venta y realizar acciones CRUD.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOwner(null);
                                  setFormOwnerName("");
                                  setFormOwnerAvatar("🤠");
                                  setFormOwnerAccent("indigo");
                                  setFormOwnerPin("");
                                  setFormOwnerLogo("");
                                  setShowOwnerCrudModal(true);
                                }}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md border-none transition-all uppercase tracking-wider font-sans"
                                style={{ backgroundColor: "#4f46e5" }}
                              >
                                ➕ Agregar Propietario
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                              {customOwners.map((owner) => {
                                const ownerBranches = COMPANY_CATALOG.filter(c => c.ownerKey === owner.key);
                                const numMatrices = ownerBranches.filter(c => c.type === 'Matriz').length;
                                const numSucursales = ownerBranches.filter(c => c.type !== 'Matriz').length;
                                const pin = customOwnerPins[owner.key] || "No asig.";

                                const colHex = 
                                  owner.accentColor === "red" ? "#dc2626" :
                                  owner.accentColor === "purple" ? "#7c3aed" :
                                  owner.accentColor === "pink" ? "#db2777" :
                                  owner.accentColor === "teal" ? "#0d9488" :
                                  owner.accentColor === "amber" ? "#d97706" :
                                  owner.accentColor === "emerald" ? "#059669" :
                                  owner.accentColor === "indigo" ? "#4f46e5" :
                                  owner.accentColor === "cyan" ? "#0891b2" :
                                  "#4f46e5";

                                const bgColLight = 
                                  owner.accentColor === "red" ? "from-red-50 to-red-100/40" :
                                  owner.accentColor === "purple" ? "from-purple-50 to-purple-100/40" :
                                  owner.accentColor === "pink" ? "from-pink-50 to-pink-100/40" :
                                  owner.accentColor === "teal" ? "from-teal-50 to-teal-100/40" :
                                  owner.accentColor === "amber" ? "from-amber-50 to-amber-100/40" :
                                  owner.accentColor === "emerald" ? "from-emerald-50 to-emerald-100/40" :
                                  owner.accentColor === "indigo" ? "from-indigo-50 to-indigo-100/40" :
                                  owner.accentColor === "cyan" ? "from-cyan-50 to-cyan-100/40" :
                                  "from-slate-50 to-slate-100";

                                return (
                                  <div
                                    key={owner.key}
                                    onClick={() => {
                                      setActiveOwnerFilter(owner.key);
                                      localStorage.setItem("cocinet_active_owner_filter", owner.key);
                                    }}
                                    className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between border-slate-150 bg-gradient-to-br ${bgColLight}`}
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                          <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-sm overflow-hidden bg-white"
                                            style={{ backgroundColor: colHex }}
                                          >
                                            {owner.logo ? (
                                              <img src={owner.logo} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                              owner.avatar
                                            )}
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">
                                              {owner.name}
                                            </h4>
                                            <span className="text-[11px] text-slate-400 font-bold block mt-1 uppercase">
                                              Grupo Patrón: #{owner.key}
                                            </span>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingOwner(owner);
                                            setFormOwnerName(owner.name);
                                            setFormOwnerAvatar(owner.avatar);
                                            setFormOwnerAccent(owner.accentColor);
                                            setFormOwnerPin(pin);
                                            setFormOwnerSupervisorPin(customOwnerSupervisorPins[owner.key] || "");
                                            setFormOwnerLogo(owner.logo || "");
                                            setShowOwnerCrudModal(true);
                                          }}
                                          className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-250 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-xs border-none font-bold"
                                          title="Modificar Propietario / PIN Supervisor"
                                        >
                                          ✏️
                                        </button>
                                      </div>

                                      <div className="pt-2 border-t border-slate-100 space-y-1 text-[12.5px] text-slate-500 font-semibold">
                                        <div className="flex items-center justify-between">
                                          <span>🔑 PIN Acceso:</span>
                                          <span className="font-mono bg-white text-slate-850 px-1.5 py-0.5 rounded text-[11.5px] font-black tracking-widest border border-slate-200">
                                            {pin}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span>🏠 Casas Matrices:</span>
                                          <span className="text-slate-800 font-bold">{numMatrices}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span>📍 Puntos de Venta:</span>
                                          <span className="text-slate-800 font-bold">{numSucursales}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-750 font-black uppercase tracking-wider">
                                      <span>Ver sucursales &rarr;</span>
                                      <span className="bg-white/60 px-2 py-0.5 rounded border border-slate-100">ENTRAR 📂</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      // Otherwise, filter and display matrices and sucursales
                      const filteredCompanies = COMPANY_CATALOG.filter((company) => {
                        const conf = companiesConfig[company.id];
                        const isVisible = conf ? conf.visible : true;
                        if (!isVisible) return false;

                        if (activeOwnerFilter && company.ownerKey !== activeOwnerFilter) {
                          return false;
                        }
                        return true;
                      });

                      const matrices = filteredCompanies.filter(c => c.type === "Matriz");
                      const sucursales = filteredCompanies.filter(c => c.type !== "Matriz");

                      return (
                        <div className="space-y-6 text-left">
                          
                          {/* Botón para registrar sucursal dentro de la vista del propietario */}
                          {isMasterAdmin && activeOwnerFilter && (
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  resetTenantForm();
                                  const ownerObj = customOwners.find(o => o.key === activeOwnerFilter);
                                  if (ownerObj) {
                                    setFormTenantOwnerKey(ownerObj.key);
                                    setFormTenantPropietario(ownerObj.name);
                                    setFormTenantEmail("contacto@cocinet.mx");
                                    setFormTenantAvatar(ownerObj.avatar || "🏢");
                                    setFormTenantAccentColor("#10b981");
                                  }
                                  setFormTenantType("Sucursal");
                                  setShowTenantCrudModal(true);
                                }}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md border-none transition-all uppercase tracking-wider"
                                style={{ backgroundColor: "#0d9488" }}
                              >
                                ➕ Agregar Sucursal a este Patrón
                              </button>
                            </div>
                          )}

                          {/* SECCIÓN 1: CASAS MATRICES (SEDE PRINCIPAL) */}
                          {matrices.length > 0 && (
                            <div className="space-y-3">
                              <span className="text-[12.5px] uppercase font-black tracking-wider text-slate-400 pl-1 flex items-center gap-1">
                                🏠 Casa Matriz / Base de Operaciones Principal
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {matrices.map((company) => {
                                  const isSelected = selectedTenant?.id === company.id;
                                  return (
                                    <div
                                      key={company.id}
                                      onClick={() => handleSelectCompanyWithPinCheck(company, "login")}
                                      className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between ${
                                        isSelected
                                          ? "border-indigo-600 bg-indigo-50/40 shadow-inner"
                                          : "border-slate-150 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="absolute -top-2.5 -right-2 bg-indigo-600 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center text-[11px] font-black shadow z-10">
                                          ✓
                                        </div>
                                      )}
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2.5">
                                            {(() => {
                                              const ownerObj = customOwners.find(o => o.key === company.ownerKey);
                                              const logoToUse = company.logoUrl || ownerObj?.logo;
                                              return (
                                                <div className="relative group shrink-0" onClick={(e) => e.stopPropagation()}>
                                                  <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md overflow-hidden bg-white shrink-0 border border-slate-100"
                                                    style={{ backgroundColor: company.accentColor }}
                                                  >
                                                    {logoToUse ? (
                                                      <img src={logoToUse} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                      <span className="text-lg">{company.avatar}</span>
                                                    )}
                                                  </div>
                                                  {isMasterAdmin && (
                                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl cursor-pointer text-[10px] text-white font-black">
                                                      📷
                                                      <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                          const file = e.target.files?.[0];
                                                          if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = async () => {
                                                              const base64 = reader.result as string;
                                                              const idx = COMPANY_CATALOG.findIndex(c => c.id === company.id);
                                                              if (idx !== -1) {
                                                                COMPANY_CATALOG[idx] = { ...COMPANY_CATALOG[idx], logoUrl: base64 };
                                                                localStorage.setItem("cocinet_custom_tenants_v3", JSON.stringify(COMPANY_CATALOG));
                                                                setTenantsVersion(prev => prev + 1);
                                                                
                                                                try {
                                                                  await saveCompanyConfigInFirebase(company.id, {
                                                                    businessName: company.name,
                                                                    rfc: company.rfc,
                                                                    sucursal: company.sucursalDefault,
                                                                    footerMessage: `¡Gracias por su visita! Vuelva pronto 🌮 (${company.ownerEmail})`,
                                                                    logoUrl: base64,
                                                                  });
                                                                  triggerAppNotification("🖼️ Logotipo Sincronizado", `Se actualizó el logo de "${company.name}" en Firebase.`, "success");
                                                                } catch (err) {
                                                                  console.error("Firebase error:", err);
                                                                  triggerAppNotification("⚠️ Error Firebase", "No se pudo sincronizar, pero se guardó localmente.", "warning");
                                                                }
                                                              }
                                                            };
                                                            reader.readAsDataURL(file);
                                                          }
                                                        }}
                                                      />
                                                    </label>
                                                  )}
                                                </div>
                                              );
                                            })()}
                                                <div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                  <h4 className="text-sm font-black text-slate-800 tracking-tight leading-snug uppercase">
                                                    {company.name}
                                                  </h4>
                                                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                    MATRIZ 🏡
                                                  </span>
                                                  <span className="text-[10.5px] bg-slate-900 text-amber-300 font-mono font-black px-2 py-0.5 rounded border border-slate-700">
                                                    TENANT: {company.id}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                  <span className="text-[11px] text-slate-400 font-mono font-bold">
                                                    {company.rfc}
                                                  </span>
                                                  <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-mono font-bold">
                                                    🔗 ?tenant={company.id.replace('tenant-', '')}
                                                  </span>
                                                </div>
                                              </div>
                                          </div>

                                          {isMasterAdmin && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditTenantClick(company);
                                              }}
                                              className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center text-xs border border-amber-250 cursor-pointer transition-all font-bold"
                                              title="Modificar Inquilino"
                                            >
                                              ✏️
                                            </button>
                                          )}
                                        </div>

                                        <div className="space-y-1 pt-1 text-[12px] border-t border-slate-50 mt-1">
                                          <div className="flex items-center gap-1 text-slate-500 font-semibold truncate">
                                            <span>📧</span> <span className="font-bold">Contacto:</span> {company.ownerEmail}
                                          </div>
                                          <div className="flex items-center gap-1 text-slate-500 font-semibold">
                                            <span>📍</span> <span className="font-bold">Sucursal:</span> {company.sucursalDefault}
                                          </div>
                                          {company.direccion && (
                                            <div className="flex items-center gap-1 text-slate-500 font-semibold truncate">
                                              <span>🗺️</span> <span className="font-bold">Dirección:</span> {company.direccion}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="mt-3 pt-2 border-t border-slate-100/60 flex items-center justify-between">
                                        <span className="text-[11px] uppercase font-black text-slate-400">Canal de Sincronización</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isSelected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                                          {isSelected ? "CONECTADO EN TIEMPO REAL" : "DISPONIBLE"}
                                        </span>
                                      </div>

                                      <div className="mt-3 pt-2 border-t border-slate-100/60 flex items-center justify-between">
                                        <span className="text-[11px] uppercase font-black text-slate-400">Control de Accesos</span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setModalTenant(company);
                                            setModalUsers(getTenantUsers(company.id));
                                            setShowTenantUsersModal(true);
                                          }}
                                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-sm border-none"
                                        >
                                          👥 Compartir Acceso / PINs
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* SECCIÓN 2: SUCURSALES AUTORIZADAS */}
                          {sucursales.length > 0 && (
                            <div className="space-y-3 pt-2">
                              <span className="text-[12.5px] uppercase font-black tracking-wider text-slate-400 pl-1 flex items-center gap-1">
                                📍 Puntos de Venta y Sucursales de la Red
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {sucursales.map((company) => {
                                  const isSelected = selectedTenant?.id === company.id;
                                  return (
                                    <div
                                      key={company.id}
                                      onClick={() => handleSelectCompanyWithPinCheck(company, "login")}
                                      className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between ${
                                        isSelected
                                          ? "border-indigo-600 bg-indigo-50/40 shadow-inner"
                                          : "border-slate-150 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="absolute -top-2.5 -right-2 bg-indigo-600 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center text-[11px] font-black shadow z-10">
                                          ✓
                                        </div>
                                      )}
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2.5">
                                            {(() => {
                                              const ownerObj = customOwners.find(o => o.key === company.ownerKey);
                                              const logoToUse = company.logoUrl || ownerObj?.logo;
                                              return (
                                                <div className="relative group shrink-0" onClick={(e) => e.stopPropagation()}>
                                                  <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md overflow-hidden bg-white shrink-0 border border-slate-100"
                                                    style={{ backgroundColor: company.accentColor }}
                                                  >
                                                    {logoToUse ? (
                                                      <img src={logoToUse} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                      <span className="text-lg">{company.avatar}</span>
                                                    )}
                                                  </div>
                                                  {isMasterAdmin && (
                                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl cursor-pointer text-[10px] text-white font-black">
                                                      📷
                                                      <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                          const file = e.target.files?.[0];
                                                          if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = async () => {
                                                              const base64 = reader.result as string;
                                                              const idx = COMPANY_CATALOG.findIndex(c => c.id === company.id);
                                                              if (idx !== -1) {
                                                                COMPANY_CATALOG[idx] = { ...COMPANY_CATALOG[idx], logoUrl: base64 };
                                                                localStorage.setItem("cocinet_custom_tenants_v3", JSON.stringify(COMPANY_CATALOG));
                                                                setTenantsVersion(prev => prev + 1);
                                                                
                                                                try {
                                                                  await saveCompanyConfigInFirebase(company.id, {
                                                                    businessName: company.name,
                                                                    rfc: company.rfc,
                                                                    sucursal: company.sucursalDefault,
                                                                    footerMessage: `¡Gracias por su visita! Vuelva pronto 🌮 (${company.ownerEmail})`,
                                                                    logoUrl: base64,
                                                                  });
                                                                  triggerAppNotification("🖼️ Logotipo Sincronizado", `Se actualizó el logo de "${company.name}" en Firebase.`, "success");
                                                                } catch (err) {
                                                                  console.error("Firebase error:", err);
                                                                  triggerAppNotification("⚠️ Error Firebase", "No se pudo sincronizar, pero se guardó localmente.", "warning");
                                                                }
                                                              }
                                                            };
                                                            reader.readAsDataURL(file);
                                                          }
                                                        }}
                                                      />
                                                    </label>
                                                  )}
                                                </div>
                                              );
                                            })()}
                                                <div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                  <h4 className="text-sm font-black text-slate-800 tracking-tight leading-snug uppercase">
                                                    {company.name}
                                                  </h4>
                                                  <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                    SUCURSAL 📍
                                                  </span>
                                                  <span className="text-[10.5px] bg-slate-900 text-amber-300 font-mono font-black px-2 py-0.5 rounded border border-slate-700">
                                                    TENANT: {company.id}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                  <span className="text-[11px] text-slate-400 font-mono font-bold">
                                                    {company.rfc}
                                                  </span>
                                                  <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-mono font-bold">
                                                    🔗 ?tenant={company.id.replace('tenant-', '')}
                                                  </span>
                                                </div>
                                              </div>
                                          </div>

                                          {isMasterAdmin && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditTenantClick(company);
                                              }}
                                              className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center text-xs border border-amber-250 cursor-pointer transition-all font-bold"
                                              title="Modificar Inquilino"
                                            >
                                              ✏️
                                            </button>
                                          )}
                                        </div>

                                        <div className="space-y-1 pt-1 text-[12px] border-t border-slate-50 mt-1">
                                          <div className="flex items-center gap-1 text-slate-500 font-semibold truncate">
                                            <span>📧</span> <span className="font-bold">Contacto:</span> {company.ownerEmail}
                                          </div>
                                          <div className="flex items-center gap-1 text-slate-500 font-semibold">
                                            <span>📍</span> <span className="font-bold">Sucursal:</span> {company.sucursalDefault}
                                          </div>
                                          {company.direccion && (
                                            <div className="flex items-center gap-1 text-slate-500 font-semibold truncate">
                                              <span>🗺️</span> <span className="font-bold">Dirección:</span> {company.direccion}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="mt-3 pt-2 border-t border-slate-100/60 flex items-center justify-between">
                                        <span className="text-[11px] uppercase font-black text-slate-400">Canal de Sincronización</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isSelected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                                          {isSelected ? "CONECTADO EN TIEMPO REAL" : "DISPONIBLE"}
                                        </span>
                                      </div>

                                      <div className="mt-3 pt-2 border-t border-slate-100/60 flex items-center justify-between">
                                        <span className="text-[11px] uppercase font-black text-slate-400">Control de Accesos</span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setModalTenant(company);
                                            setModalUsers(getTenantUsers(company.id));
                                            setShowTenantUsersModal(true);
                                          }}
                                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-sm border-none"
                                        >
                                          👥 Compartir Acceso / PINs
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {filteredCompanies.length === 0 && (
                            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                              <span className="text-3xl block mb-2">🚫</span>
                              <h4 className="text-sm font-black text-slate-700 mb-1">No hay sucursales configuradas</h4>
                              <p className="text-[11px] max-w-md mx-auto leading-relaxed">
                                No se encontraron sucursales asociadas o autorizadas para este propietario actualmente. Abre el Gestor de Empresas para registrarlas.
                              </p>
                            </div>
                          )}

                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 🔔 CONTROL DE CONFIGURACIÓN DE NOTIFICACIONES PWA EN CALIENTE */}
                <div className="pt-4 border-t border-dashed border-slate-200">
                  <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between border border-slate-100 gap-3">
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-2xl animate-bounce">🔔</span>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">Centro de Notificaciones en Vivo ⚡</h5>
                        <p className="text-[10px] text-slate-500 font-bold">Activa las alertas del navegador para cambios de caja, gastos y comandas en caliente vía WebSockets.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="toggle-pwa-notifications"
                      onClick={() => {
                        if (typeof Notification !== "undefined") {
                          Notification.requestPermission().then((permission) => {
                            if (permission === "granted") {
                              setNotificationsGranted(true);
                              new Notification("🔔 Canal Sincronizado", {
                                body: "Las notificaciones en tiempo real para transacciones MySQL y WebSockets han sido activadas con éxito.",
                                icon: "/public/icon.png"
                              });
                              triggerAppNotification(
                                "🔔 Notificaciones Conectadas",
                                "¡Perfecto! Has activado con éxito las notificaciones en tiempo real sobre transacciones de caja. 🚀",
                                "success"
                              );
                            } else {
                              setNotificationsGranted(false);
                              triggerAppNotification(
                                "⚠️ Notificaciones Bloqueadas",
                                "Por favor autoriza las notificaciones directamente en tu navegador.",
                                "warning"
                              );
                            }
                          });
                        }
                      }}
                      className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer border-none ${
                        notificationsGranted 
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {notificationsGranted ? "🟢 Notificaciones Activas" : "🔔 Activar Notificaciones"}
                    </button>
                  </div>
                </div>

              </div>

            ) : null}

          </div>

          {showEditMasterPinModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(4px)",
                zIndex: 99999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  maxWidth: "420px",
                  width: "100%",
                  padding: "24px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  animation: "scaleUp 0.2s ease-out",
                }}
              >
                <div className="text-center space-y-2 mb-5">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
                    🔑
                  </div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                    Cambiar PIN Maestro
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Este PIN te otorga acceso total de Administrador General. Se almacena directamente en Firestore en la colección <strong className="text-indigo-600 font-mono">principal</strong> (campo: <strong className="text-indigo-600 font-mono">pin</strong>).
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                      Nuevo PIN (4 dígitos numéricos)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newMasterPinInput}
                      onChange={(e) => setNewMasterPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="Ej. 2052"
                      className="w-full text-center text-2xl font-mono font-black tracking-widest px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 rounded-xl outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                      Confirmar Nuevo PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={confirmMasterPinInput}
                      onChange={(e) => setConfirmMasterPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="Repite el PIN"
                      className="w-full text-center text-2xl font-mono font-black tracking-widest px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 rounded-xl outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 mt-6">
                  <button
                    type="button"
                    disabled={isSavingMasterPin}
                    onClick={() => {
                      setShowEditMasterPinModal(false);
                      setNewMasterPinInput("");
                      setConfirmMasterPinInput("");
                    }}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer border-none uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isSavingMasterPin || newMasterPinInput.length !== 4}
                    onClick={async () => {
                      if (newMasterPinInput.length !== 4) {
                        triggerAppNotification("⚠️ Longitud Incorrecta", "El PIN debe ser de 4 dígitos numéricos.", "warning");
                        return;
                      }
                      if (newMasterPinInput !== confirmMasterPinInput) {
                        triggerAppNotification("⚠️ No Coinciden", "Los dos campos de PIN deben ser exactamente iguales.", "warning");
                        return;
                      }
                      setIsSavingMasterPin(true);
                      try {
                        if (handleUpdateMasterPin) {
                          const ok = await handleUpdateMasterPin(newMasterPinInput);
                          if (ok) {
                            setShowEditMasterPinModal(false);
                          }
                        }
                      } finally {
                        setIsSavingMasterPin(false);
                      }
                    }}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl transition-all cursor-pointer border-none shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    {isSavingMasterPin ? "Guardando..." : "💾 Guardar PIN"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </IonContent>
      </IonPage>
    );
};
