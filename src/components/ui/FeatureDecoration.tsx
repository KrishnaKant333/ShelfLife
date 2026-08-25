import {
  Bell,
  BarChart3,
  Barcode,
  Clock3,
  Layers3,
  Sparkles,
} from "lucide-react";

interface FeatureDecorationProps {
  feature: string;
}

export default function FeatureDecoration({
  feature,
}: FeatureDecorationProps) {
  const decorations: Record<
    string,
    { icon: React.ReactNode; label: string }
  > = {
    "Expiry Tracking": {
      icon: <Clock3 size={28} />,
      label: "2d",
    },

    "Smart Alerts": {
      icon: <Bell size={28} />,
      label: "Alert",
    },

    "Batch Tracking": {
      icon: <Layers3 size={28} />,
      label: "Batch",
    },

    "Barcode & OCR": {
      icon: <Barcode size={32} />,
      label: "Scan",
    },

    "Waste Analytics": {
      icon: <BarChart3 size={30} />,
      label: "-18%",
    },

    "AI Recommendations": {
      icon: <Sparkles size={30} />,
      label: "Insight",
    },
  };

  const decoration = decorations[feature];

  if (!decoration) return null;

  return (
    <div className="pointer-events-none absolute right-9 top-17 flex translate-y-2 items-center gap-2 text-[var(--shelf-green)] opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-70">
      {decoration.icon}

      <span className="text-xs font-medium">
        {decoration.label}
      </span>
    </div>
  );
}