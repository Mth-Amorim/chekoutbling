import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Package, Search, BarChart3, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Inventory from "@/components/Inventory";
import OrderDetails from "@/components/OrderDetails";
import Dashboard from "@/components/Dashboard";

import PrePostagem from "../components/PrePostagem";

type Section = "inventory" | "order_details" | "dashboard" | "pre_postagem";

const tabs: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "inventory", label: "Estoque", icon: <Package className="h-4 w-4" /> },
  { id: "order_details", label: "Detalhes Pedido", icon: <Search className="h-4 w-4" /> },
  { id: "pre_postagem", label: "Pré-postagem", icon: <Truck className="h-4 w-4" /> },
  { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>("inventory");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
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
          {activeSection === "inventory" && <Inventory />}
          {activeSection === "order_details" && <OrderDetails />}
          {activeSection === "pre_postagem" && <PrePostagem />}
          {activeSection === "dashboard" && <Dashboard />}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
