import { useState } from "react";
import { motion } from "framer-motion";
import { Package, ShoppingCart, AlertTriangle, ClipboardList } from "lucide-react";
import MyOrders from "@/components/MyOrders";
import SalesConference from "@/components/SalesConference";
import PurchaseConference from "@/components/PurchaseConference";
import DamageRegistration from "@/components/DamageRegistration";

type Section = "orders" | "sales" | "purchase" | "damage";

const tabs: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "orders", label: "Meus Pedidos", icon: <ClipboardList className="h-4 w-4" /> },
  { id: "sales", label: "Venda", icon: <Package className="h-4 w-4" /> },
  { id: "purchase", label: "Compras", icon: <ShoppingCart className="h-4 w-4" /> },
  { id: "damage", label: "Avaria", icon: <AlertTriangle className="h-4 w-4" /> },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>("orders");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <img
            src="https://acdn-us.mitiendanube.com/stores/005/081/561/themes/toluca/img-49697943-1757160534-b49360ea4a826198c3297547b5588ade1757160534.png?4022911048044583491"
            alt="Logo da empresa"
            className="h-10 object-contain"
          />
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Checkout Conferência</h1>
            <p className="text-xs text-muted-foreground">Sistema de conferência por bipagem</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeSection === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeSection === "orders" && <MyOrders />}
          {activeSection === "sales" && <SalesConference />}
          {activeSection === "purchase" && <PurchaseConference />}
          {activeSection === "damage" && <DamageRegistration />}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
