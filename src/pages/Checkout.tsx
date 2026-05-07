import { motion } from "framer-motion";
import { LogOut, LayoutDashboard, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SalesConference from "@/components/SalesConference";

const Checkout = () => {
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
              <h1 className="text-xl font-black text-white tracking-tight uppercase">Módulo de Checkout</h1>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Conferência e Bipagem</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Painel Principal
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl min-h-[700px]"
        >
          <div className="mb-8 flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <ScanBarcode className="h-8 w-8" />
             </div>
             <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Conferência de Venda</h2>
                <p className="text-zinc-500">Aponte o leitor para o código de barras para bipar os produtos.</p>
             </div>
          </div>

          {/* O componente SalesConference contém toda a lógica de busca e bipagem */}
          <SalesConference />
        </motion.div>
      </main>
    </div>
  );
};

export default Checkout;
