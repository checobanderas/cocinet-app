import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/react';
import { trashOutline, saveOutline, closeOutline } from 'ionicons/icons';

interface OwnerCrudModalProps {
  showOwnerCrudModal: boolean;
  setShowOwnerCrudModal: (v: boolean) => void;
  editingOwner: any;
  setEditingOwner: (v: any) => void;
  formOwnerName: string;
  setFormOwnerName: (v: string) => void;
  formOwnerPin: string;
  setFormOwnerPin: (v: string) => void;
  formOwnerSupervisorPin: string;
  setFormOwnerSupervisorPin: (v: string) => void;
  formOwnerAccent: string;
  setFormOwnerAccent: (v: string) => void;
  formOwnerLogo: string;
  setFormOwnerLogo: (v: string) => void;
  formOwnerAvatar: string;
  setFormOwnerAvatar: (v: string) => void;
  handleSaveOwner: () => Promise<void>;
  handleDeleteOwner: () => Promise<void>;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const OwnerCrudModal: React.FC<OwnerCrudModalProps> = ({
  showOwnerCrudModal,
  setShowOwnerCrudModal,
  editingOwner,
  setEditingOwner,
  formOwnerName,
  setFormOwnerName,
  formOwnerPin,
  setFormOwnerPin,
  formOwnerSupervisorPin,
  setFormOwnerSupervisorPin,
  formOwnerAccent,
  setFormOwnerAccent,
  formOwnerLogo,
  setFormOwnerLogo,
  formOwnerAvatar,
  setFormOwnerAvatar,
  handleSaveOwner,
  handleDeleteOwner,
  triggerAppNotification
}) => {};
