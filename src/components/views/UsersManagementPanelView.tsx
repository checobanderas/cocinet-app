import React, { useState } from 'react';
import { TenantUsersModal } from '../modals/TenantUsersModal';
import { getTenantUsers } from '../../utils/appHelpers';

interface UsersManagementPanelViewProps {
  COMPANY_CATALOG?: any;
  activeOwnerFilter?: any;
  currentUser?: any;
  handleAddRow?: any;
  handleCellChange?: any;
  handleDeleteRow?: any;
  isSystemsMode?: any;
  restrictedOwnerKey?: any;
  selectedTenant: any;
  setShowEmployeeGuide?: any;
  showEmployeeGuide?: any;
  triggerAppNotification: any;
  users?: any;
}

export const UsersManagementPanelView: React.FC<UsersManagementPanelViewProps> = ({
  selectedTenant,
  handleAddRow,
  handleCellChange,
  handleDeleteRow,
  triggerAppNotification,
  users
}) => {
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  const tenantUsers = (users && users.length > 0)
    ? users
    : (selectedTenant ? getTenantUsers(selectedTenant.id) : []);

  return (
    <div className="py-2">
      <TenantUsersModal
        isInline={true}
        modalTenant={selectedTenant}
        modalUsers={tenantUsers}
        handleAddRow={() => handleAddRow && handleAddRow(selectedTenant?.id)}
        handleCellChange={(userId: string, field: string, value: any, targetTenantId?: string) =>
          handleCellChange && handleCellChange(userId, field, value, targetTenantId || selectedTenant?.id)
        }
        handleDeleteRow={(userId: string, targetTenantId?: string) =>
          handleDeleteRow && handleDeleteRow(userId, targetTenantId || selectedTenant?.id)
        }
        revealedPins={revealedPins}
        setRevealedPins={setRevealedPins}
        triggerAppNotification={triggerAppNotification}
      />
    </div>
  );
};
