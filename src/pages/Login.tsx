import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Lock, User } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a bit of delay for a premium feel
    setTimeout(() => {
      const validUser = "vendedor@uzenails";
      const validPass = "#Uzenails";

      if (username.toLowerCase().trim() === validUser && password === validPass) {
        localStorage.setItem("isAuthenticated", "true");
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao sistema Uze Nails.",
        });
        navigate("/");
      } else {
        toast({
          variant: "destructive",
          title: "Erro na autenticação",
          description: "Usuário ou senha incorretos.",
        });
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0f0d]">
      {/* Dynamic Background Elements - pointer-events-none to prevent blocking */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Background Image with Overlay - pointer-events-none */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay transition-transform duration-10000 hover:scale-105 pointer-events-none"
        style={{ backgroundImage: "url('/login-bg.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent backdrop-blur-[1px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary/50 to-emerald-500/50 opacity-20 blur-xl pointer-events-none" />

        <Card className="border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden rounded-[1.5rem]">
          <CardHeader className="space-y-2 text-center pb-8 pt-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 border border-white/10 text-primary shadow-inner">
                  <Lock className="w-10 h-10" />
                </div>
              </div>
            </motion.div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white bg-clip-text">Acesso Uze Nails</CardTitle>
            <CardDescription className="text-zinc-400 text-base">
              Identifique-se para gerenciar o estoque
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5 px-8">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-300 ml-1">Usuário</Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors z-20" />
                  <Input
                    id="username"
                    placeholder="vendedor@uzenails"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-lg relative z-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" name="Senha" className="text-zinc-300 ml-1">Senha</Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors z-20" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-lg relative z-10"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-6 pb-10 flex flex-col space-y-6 px-8">
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/20 border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-zinc-500">
                  © {new Date().getFullYear()} Uze Nails
                </p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
                  Advanced Inventory Management
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;

