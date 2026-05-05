import { useState } from "react";
import { motion } from "framer-motion";
import { Boxes, FileText, ArrowLeft, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Inventory from "@/components/Inventory";

const Estoque = () => {
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
              <h1 className="text-xl font-black text-white tracking-tight uppercase">Módulo de Estoque</h1>
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
        <Tabs defaultValue="estoque" className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <TabsList className="bg-white/5 border border-white/10 p-1 h-14 rounded-2xl">
              <TabsTrigger 
                value="estoque" 
                className="rounded-xl px-8 h-12 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Boxes className="h-4 w-4 mr-2" />
                Estoque
              </TabsTrigger>
              <TabsTrigger 
                value="propostas" 
                className="rounded-xl px-8 h-12 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <FileText className="h-4 w-4 mr-2" />
                Estoque Propostas
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="estoque" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Inventory />
            </motion.div>
          </TabsContent>

          <TabsContent value="propostas" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-32 space-y-6 rounded-[2rem] border border-white/5 bg-white/[0.02]"
            >
              <div className="p-6 rounded-3xl bg-primary/10 text-primary">
                <FileText className="h-12 w-12" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">Módulo de Propostas</h3>
                <p className="text-zinc-500 max-w-sm mx-auto">
                  Este módulo está em desenvolvimento. Em breve você poderá gerenciar propostas de estoque aqui.
                </p>
              </div>
              <Button variant="outline" className="border-white/10 text-zinc-400 hover:text-white">
                Saiba Mais
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Estoque;
