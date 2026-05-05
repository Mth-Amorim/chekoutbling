import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Package, Search, BarChart3, Truck, Boxes, ClipboardList, ChevronRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Inventory from "@/components/Inventory";
import OrderDetails from "@/components/OrderDetails";
import Dashboard from "@/components/Dashboard";
import PrePostagem from "../components/PrePostagem";

type Section = "inventory" | "order_details" | "dashboard" | "pre_postagem";

const tabs: { id: Section; label: string; icon: any }[] = [
  { id: "inventory", label: "Estoque", icon: Package },
  { id: "order_details", label: "Detalhes Pedido", icon: Search },
  { id: "pre_postagem", label: "Pré-postagem", icon: Truck },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>("inventory");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0c0b] text-zinc-300">
      {/* Premium Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => navigate("/")}>
               <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
               <img
                src="https://acdn-us.mitiendanube.com/stores/005/081/561/themes/toluca/img-49697943-1757160534-b49360ea4a826198c3297547b5588ade1757160534.png?4022911048044583491"
                alt="Logo Uze Nails"
                className="h-12 relative z-10"
              />
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase">Control Center</h1>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sistema Operacional Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/estoque")}
              className="hidden sm:flex border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary rounded-xl"
            >
              <Boxes className="h-4 w-4 mr-2" />
              Módulo de Estoque
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white/5 border border-white/5 rounded-3xl p-4 space-y-2">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-4 mb-4">Menu Principal</p>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group ${
                      activeSection === tab.id
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${activeSection === tab.id ? "text-white" : "text-zinc-500 group-hover:text-primary"}`} />
                    {tab.label}
                    {activeSection === tab.id && (
                      <motion.div layoutId="activePill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Quick Link to new Estoque page */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/estoque")}
              className="bg-gradient-to-br from-primary/20 to-emerald-500/20 border border-primary/20 rounded-3xl p-6 cursor-pointer group"
            >
              <Boxes className="h-8 w-8 text-primary mb-4 group-hover:rotate-12 transition-transform" />
              <h3 className="font-bold text-white mb-1">Novo Módulo de Estoque</h3>
              <p className="text-xs text-zinc-400">Acesse as abas Estoque e Estoque Propostas.</p>
              <div className="mt-4 flex items-center text-[10px] font-black text-primary uppercase tracking-widest">
                Acessar agora <ChevronRight className="h-3 w-3 ml-1" />
              </div>
            </motion.div>
          </aside>

          {/* Dynamic Section Content */}
          <section className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="min-h-[600px]"
              >
                <div className="mb-8">
                  <h2 className="text-4xl font-black text-white tracking-tighter">
                    {tabs.find(t => t.id === activeSection)?.label}
                  </h2>
                  <p className="text-zinc-500 mt-2">Gerenciamento operacional em tempo real</p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl">
                  {activeSection === "inventory" && <Inventory />}
                  {activeSection === "order_details" && <OrderDetails />}
                  {activeSection === "pre_postagem" && <PrePostagem />}
                  {activeSection === "dashboard" && <Dashboard />}
                </div>
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;

