import { Dialog } from "primereact/dialog";
import { memo } from "react";
import DownloadForm from "../DownloadForm";

interface AddDownloadDialogProps {
  visible: boolean;
  onHide: () => void;
}

export const AddDownloadDialog = memo(
  ({ visible, onHide }: AddDownloadDialogProps) => {
    return (
      <Dialog
        visible={visible}
        style={{ width: "90vw" }}
        onHide={onHide}
        dismissableMask
        showHeader={false}
        pt={{ content: { className: "p-2 sm:pt-3 sm:p-2" } }}
        position="top"
      >
        <DownloadForm />
      </Dialog>
    );
  },
);

AddDownloadDialog.displayName = "AddDownloadDialog";
