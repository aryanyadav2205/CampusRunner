import React from "react";
import { 
  Lock, CheckCircle2, Clock, Truck, 
  MapPin, XCircle, ChevronRight 
} from "lucide-react";

export default function StatusBadge({ status }) {
  let label = status;
  let bg = "var(--bg-card)";
  let color = "var(--text-secondary)";
  let Icon = Clock;

  switch (status) {
    case "OPEN":
      label = "Open";
      bg = "rgba(56, 189, 248, 0.1)";
      color = "#38bdf8";
      Icon = Clock;
      break;
    case "ACCEPTED":
      label = "Accepted";
      bg = "rgba(99, 102, 241, 0.1)";
      color = "#818cf8";
      Icon = ChevronRight;
      break;
    case "PICKED_UP":
      label = "Picked Up";
      bg = "rgba(234, 179, 8, 0.1)";
      color = "#eab308";
      Icon = MapPin;
      break;
    case "OUT_FOR_DELIVERY":
      label = "Out for Delivery";
      bg = "rgba(249, 115, 22, 0.1)";
      color = "#f97316";
      Icon = Truck;
      break;
    case "OTP_VERIFICATION":
      label = "OTP Verification";
      bg = "rgba(168, 85, 247, 0.1)";
      color = "#a855f7";
      Icon = Lock;
      break;
    case "COMPLETED":
      label = "Completed";
      bg = "rgba(34, 197, 94, 0.1)";
      color = "#22c55e";
      Icon = CheckCircle2;
      break;
    case "CANCELLED":
      label = "Cancelled";
      bg = "rgba(239, 68, 68, 0.1)";
      color = "#ef4444";
      Icon = XCircle;
      break;
    default:
      break;
  }

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "600",
      backgroundColor: bg,
      color: color,
      border: `1px solid ${color}22`,
      textTransform: "uppercase",
      letterSpacing: "0.025em"
    }}>
      <Icon size={12} />
      {label}
    </span>
  );
}
