import { Button } from "primereact/button";
import { memo } from "react";

interface SettingsFooterProps {
  loading: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const SettingsFooter = memo(
  ({ loading, onCancel, onSave }: SettingsFooterProps) => {
    return (
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          onClick={onCancel}
          className="p-button-sm px-4"
        />
        <Button
          type="button"
          label="Save Settings"
          icon="pi pi-check"
          loading={loading}
          severity="info"
          onClick={onSave}
          className="p-button-sm px-4 font-semibold"
        />
      </div>
    );
  },
);

SettingsFooter.displayName = "SettingsFooter";
