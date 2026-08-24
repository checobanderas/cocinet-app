import React, { Suspense, lazy } from "react";
import { useAppState } from "../AppStateContext";

// Lazy loading views
const LoginView = lazy(() => import("../../features/auth/LoginView"));
const FloorplanView = lazy(() => import("../../features/floorplan/FloorplanView"));
const MenuView = lazy(() => import("../../features/menu/MenuView"));
const ReviewView = lazy(() => import("../../features/menu/ReviewView"));
const CheckoutView = lazy(() => import("../../features/checkout/CheckoutView"));
const AdminPanelView = lazy(() => import("../../features/admin/AdminPanelView"));

// Loading fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
    <div className="animate-spin text-4xl">⏳</div>
  </div>
);

export const AppRouter = () => {
  const { appMode } = useAppState();

  const renderCurrentView = () => {
    switch (appMode) {
      case "login":
        return <LoginView />;
      case "floorplan":
        return <FloorplanView />;
      case "menu":
        return <MenuView />;
      case "review":
        return <ReviewView />;
      case "checkout":
        return <CheckoutView />;
      case "admin":
        return <AdminPanelView />;
      default:
        return <FloorplanView />; // Fallback
    }
  };

  return (
    <Suspense fallback={<PageLoader />}>
      {renderCurrentView()}
    </Suspense>
  );
};
