import { motion } from "framer-motion";
import { Boxes, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Inventory from "@/components/Inventory";

const EstoqueLojista = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0c0b] text-zinc-300">
      {/* Premium Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
               <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
               <img
                src="https://acdn-us.mitiendanube.com/stores/005/081/561/themes/toluca/img-49697943-1757160534-b49360ea4a826198c3297547b5588ade1757160534.png?4022911048044583491"
                alt="Logo Uze Nails"
                className="h-12 relative z-10"
              />
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase">Estoque Lojista</h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] opacity-70">Uze Nails System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Painel Principal
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <Boxes className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Consulta de Saldos</h2>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* O componente Inventory já consome /api/estoques/saldos */}
            <Inventory />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default EstoqueLojista;
