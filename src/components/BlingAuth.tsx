import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

const BlingAuth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleTestConnection = async () => {
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha o usuário e a senha.",
      });
      return;
    }

    setIsLoading(true);
    setStatus("idle");
    
    try {
      const response = await fetch("http://localhost:8000/bling-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        toast({
          title: "Sucesso!",
          description: "Conexão com o Bling validada.",
        });
      } else {
        setStatus("error");
        setMessage(data.message);
        toast({
          variant: "destructive",
          title: "Falha na conexão",
          description: data.message,
        });
      }
    } catch (error) {
      setStatus("error");
      setMessage("Não foi possível conectar ao servidor da API.");
      toast({
        variant: "destructive",
        title: "Erro de Servidor",
        description: "Certifique-se que o backend (FastAPI) está rodando.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-border shadow-2xl bg-card/50 backdrop-blur-md overflow-hidden">
          <CardHeader className="space-y-1 pb-8 text-center border-b border-border/50 bg-accent/5">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">Validador Bling</CardTitle>
            <CardDescription className="text-sm font-medium">
              Insira suas credenciais para testar a integração.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Usuário / E-mail
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="username"
                    placeholder="ex@exemplo.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  VALIDANDO...
                </>
              ) : (
                "TESTAR CONEXÃO"
              )}
            </Button>

            <AnimatePresence mode="wait">
              {status !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl flex items-center gap-3 border ${
                    status === "success" 
                      ? "bg-green-500/10 border-green-500/20 text-green-600" 
                      : "bg-destructive/10 border-destructive/20 text-destructive"
                  }`}
                >
                  {status === "success" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0" />
                  )}
                  <p className="text-sm font-bold">{message}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BlingAuth;
