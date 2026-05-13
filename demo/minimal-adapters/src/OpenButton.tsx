import { useDialog } from "dialogist";

export const OpenButton = ({ adapterLabel }: { adapterLabel: string }) => {
  const dialog = useDialog("minimal-demo");

  const handleAlert = () =>
    dialog.open({
      type: "alert",
      title: `${adapterLabel} alert`,
      message: `This dialog is rendered through the ${adapterLabel} adapter. Click OK to close.`,
    });

  const handleConfirm = async () => {
    const result = await dialog.openAsync({
      type: "confirm",
      title: `${adapterLabel} confirm`,
      message: "Are you sure? This is a confirm dialog driven by Dialogist's promise-based API.",
    });
    // eslint-disable-next-line no-console
    console.log("confirm result:", result);
  };

  return (
    <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
      <button type="button" onClick={handleAlert} style={btn}>
        Open alert
      </button>
      <button type="button" onClick={handleConfirm} style={btn}>
        Open confirm
      </button>
    </div>
  );
};

const btn: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 6,
  border: "1px solid #1976d2",
  background: "#1976d2",
  color: "white",
  cursor: "pointer",
  fontSize: "0.9rem",
};
