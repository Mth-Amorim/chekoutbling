import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  TriangleAlert,
  Camera,
  PackageSearch,
} from "lucide-react";

type AdminSection =
  | "dashboard"
  | "documents"
  | "damages"
  | "divergences"
  | "photo-count"
  | "partial-order";

type DashboardFilter = "7d" | "15d" | "est mes" | "mes passado";

const tabs: { id: AdminSection; label: string; icon: ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    id: "documents",
    label: "Docs",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "damages",
    label: "Avarias",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    id: "divergences",
    label: "Divergencias",
    icon: <TriangleAlert className="h-4 w-4" />,
  },
  {
    id: "photo-count",
    label: "Foto",
    icon: <Camera className="h-4 w-4" />,
  },
  {
    id: "partial-order",
    label: "Pedido parcial",
    icon: <PackageSearch className="h-4 w-4" />,
  },
];

const sectionTitle: Record<AdminSection, string> = {
  dashboard: "Dashboard",
  documents: "Docs",
  damages: "Avarias",
  divergences: "Divergencias",
  "photo-count": "Foto",
  "partial-order": "Pedido parcial",
};

const dashboardFilters: DashboardFilter[] = [
  "7d",
  "15d",
  "est mes",
  "mes passado",
];

const AdministradorExpedicao = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [activeDashboardFilter, setActiveDashboardFilter] =
    useState<DashboardFilter>("7d");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <img
            src="https://acdn-us.mitiendanube.com/stores/005/081/561/themes/toluca/img-49697943-1757160534-b49360ea4a826198c3297547b5588ade1757160534.png?4022911048044583491"
            alt="Logo da empresa"
            className="h-10 object-contain"
          />
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Administrador de Expedição
            </h1>
            <p className="text-xs text-muted-foreground">
              Gestão central da expedição
            </p>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeSection === tab.id && (
                  <motion.div
                    layoutId="adminActiveTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-lg border border-border bg-card p-6"
        >
          <h2 className="text-xl font-semibold text-foreground">
            {sectionTitle[activeSection]}
          </h2>

          {activeSection === "dashboard" && (
            <div className="mt-4 flex flex-wrap gap-2">
              {dashboardFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveDashboardFilter(filter)}
                  className={`h-9 px-3 rounded-md border text-sm font-medium transition-colors ${
                    activeDashboardFilter === filter
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdministradorExpedicao;
