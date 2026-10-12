import { Button } from "primereact/button";

interface DownloadSubmitButtonProps {
  isSubmitting: boolean;
}

export function DownloadSubmitButton({
  isSubmitting,
}: DownloadSubmitButtonProps) {
  return (
    <div className="shrink-0">
      <Button
        loading={isSubmitting}
        type="submit"
        label="Download"
        icon="pi pi-download"
        className="w-full sm:w-auto p-button-sm font-medium"
      />
    </div>
  );
}

export default DownloadSubmitButton;
