import React from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

interface BranchSwitcherModalProps {
  showBranchSwitcherModal: boolean;
  setShowBranchSwitcherModal: (show: boolean) => void;
  restrictedOwnerKey: string | null;
  activeOwnerFilter: string | null;
  currentUser: any;
  isSystemsMode: boolean;
  COMPANY_CATALOG: any[];
  companiesConfig: Record<string, any>;
  selectedTenant: any;
  customOwners: any[];
  MAPS_API_KEY: string;
  handleSwitchBranch: (company: any) => void;
}

export const BranchSwitcherModal: React.FC<BranchSwitcherModalProps> = ({
  showBranchSwitcherModal,
  setShowBranchSwitcherModal,
  restrictedOwnerKey,
  activeOwnerFilter,
  currentUser,
  isSystemsMode,
  COMPANY_CATALOG,
  companiesConfig,
  selectedTenant,
  customOwners,
  MAPS_API_KEY,
  handleSwitchBranch,
}) => {
  if (!showBranchSwitcherModal) return null;

  const ownerKey = restrictedOwnerKey || activeOwnerFilter;
  const isSistemas = currentUser?.id.endsWith("-sistemas") || isSystemsMode;

  const filteredCompanies = COMPANY_CATALOG.filter((company) => {
    const conf = companiesConfig[company.id];
    const isVisible = conf ? conf.visible : true;
    if (!isVisible) return false;

    if (!isSistemas && ownerKey && company.ownerKey !== ownerKey) {
      return false;
    }
    return true;
  });

  const matrices = filteredCompanies.filter((c) => c.type === "Matriz");
  const sucursales = filteredCompanies.filter((c) => c.type !== "Matriz");

  return (
    <IonModal
      isOpen={showBranchSwitcherModal}
      onDidDismiss={() => setShowBranchSwitcherModal(false)}
      style={{
        "--height": "100%",
        "--width": "100%",
        "--max-height": "90vh",
        "--max-width": "800px",
        "--border-radius": "24px",
      }}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ "--background": "#fff", padding: "8px 16px" }}>
          <IonTitle style={{ fontSize: "1.2rem", fontWeight: "900", color: "#1e293b", paddingLeft: "0" }}>
            🏢 Cambiar de Sucursal / Empresa
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowBranchSwitcherModal(false)} color="dark">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
        <div className="space-y-6 max-w-3xl mx-auto pb-12 text-left">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-650 text-lg shadow-sm">
              👤
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 m-0">Sesión Activa: {currentUser?.name}</h4>
              <p className="text-[11px] text-slate-500 font-bold m-0">
                {isSistemas 
                  ? "Perfil de Sistemas: Acceso global a todos los grupos de la red." 
                  : `Perfil de Propietario: Acceso limitado a sucursales autorizadas.`}
              </p>
            </div>
          </div>

          {/* SECCIÓN 1: CASAS MATRICES (SEDE PRINCIPAL) */}
          {matrices.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 pl-1 flex items-center gap-1">
                🏠 Casa Matriz / Base de Operaciones Principal
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matrices.map((company) => {
                  const isSelected = selectedTenant?.id === company.id;
                  const ownerObj = customOwners.find(o => o.key === company.ownerKey);
                  const logoToUse = ownerObj?.logo;
                  return (
                    <div
                      key={company.id}
                      onClick={() => handleSwitchBranch(company)}
                      className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/40 shadow-inner"
                          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-350 shadow-sm"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2.5 -right-2 bg-indigo-600 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-black shadow z-10">
                          ✓
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        {logoToUse ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200 mt-0.5 shadow-sm">
                            <img src={logoToUse} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-2xl mt-0.5 shrink-0">{company.avatar}</span>
                        )}
                        <div>
                          <h4 className="text-[0.9rem] font-black text-slate-850 m-0 uppercase tracking-tight leading-tight">
                            {company.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-bold mt-1">
                            RFC: {company.rfc} • {company.type}
                          </p>
                        </div>
                      </div>
                      {company.lat && company.lng && (
                        <div className="mt-3 h-28 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner pointer-events-none">
                          <APIProvider apiKey={MAPS_API_KEY}>
                            <GoogleMap
                              defaultCenter={{ lat: company.lat, lng: company.lng }}
                              defaultZoom={15}
                              mapId="DEMO_MAP_ID"
                              disableDefaultUI={true}
                              style={{ width: '100%', height: '100%' }}
                            >
                              <AdvancedMarker position={{ lat: company.lat, lng: company.lng }}>
                                <Pin background={company.accentColor} glyphColor="#fff" />
                              </AdvancedMarker>
                            </GoogleMap>
                          </APIProvider>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECCIÓN 2: SUCURSALES */}
          {sucursales.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 pl-1 flex items-center gap-1">
                📍 Puntos de Venta y Sucursales de la Red
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sucursales.map((company) => {
                  const isSelected = selectedTenant?.id === company.id;
                  const ownerObj = customOwners.find(o => o.key === company.ownerKey);
                  const logoToUse = ownerObj?.logo;
                  return (
                    <div
                      key={company.id}
                      onClick={() => handleSwitchBranch(company)}
                      className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/40 shadow-inner"
                          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-350 shadow-sm"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2.5 -right-2 bg-indigo-600 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-black shadow z-10">
                          ✓
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        {logoToUse ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200 mt-0.5 shadow-sm">
                            <img src={logoToUse} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-2xl mt-0.5 shrink-0">{company.avatar}</span>
                        )}
                        <div>
                          <h4 className="text-[0.9rem] font-black text-slate-850 m-0 uppercase tracking-tight leading-tight">
                            {company.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-bold mt-1">
                            RFC: {company.rfc} • {company.type}
                          </p>
                        </div>
                      </div>
                      {company.lat && company.lng && (
                        <div className="mt-3 h-28 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner pointer-events-none">
                          <APIProvider apiKey={MAPS_API_KEY}>
                            <GoogleMap
                              defaultCenter={{ lat: company.lat, lng: company.lng }}
                              defaultZoom={15}
                              mapId="DEMO_MAP_ID"
                              disableDefaultUI={true}
                              style={{ width: '100%', height: '100%' }}
                            >
                              <AdvancedMarker position={{ lat: company.lat, lng: company.lng }}>
                                <Pin background={company.accentColor} glyphColor="#fff" />
                              </AdvancedMarker>
                            </GoogleMap>
                          </APIProvider>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};
