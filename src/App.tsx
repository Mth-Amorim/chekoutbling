import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Estoque from "./pages/Estoque.tsx";
import NotFound from "./pages/NotFound.tsx";
import PeridoPercial from "./pages/PeridoPercial.tsx";
import AdministradorExpedicao from "./pages/AdministradorExpedicao.tsx";
import Login from "./pages/Login.tsx";
import EstoqueLojista from "./pages/EstoqueLojista.tsx";
import Checkout from "./pages/Checkout.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administradorExpedicao"
            element={
              <ProtectedRoute>
                <AdministradorExpedicao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedidoparcial"
            element={
              <ProtectedRoute>
                <PeridoPercial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/peridopercial"
            element={<Navigate to="/pedidoparcial" replace />}
          />
          <Route
            path="/estoque"
            element={
              <ProtectedRoute>
                <Estoque />
              </ProtectedRoute>
            }
          />
          <Route
            path="/EstoqueLojista"
            element={
              <ProtectedRoute>
                <EstoqueLojista />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
