import { useEffect, useState } from "react";
import { supabase } from "./services/supabase"; // 👈 Faltava importar o supabase
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardAdmin from "./pages/DashboardAdmin";
import TrocarSenha from "./pages/TrocarSenha";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Recupera o utilizador logado no carregamento
    const userStorage = localStorage.getItem("usuario_v2") || localStorage.getItem("usuario");
    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // ⚡ 2. ESCUTA EM TEMPO REAL: se alterar a senha no Supabase, desloga imediatamente
    const channel = supabase
      .channel("sessao-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // Escuta qualquer UPDATE ou DELETE
          schema: "public",
          table: "usuarios",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          // Se a senha no banco mudou ou o registo foi apagado
          if (payload.eventType === "DELETE" || payload.new.senha !== user.senha) {
            localStorage.removeItem("usuario_v2");
            localStorage.removeItem("usuario");
            setUser(null); // Derruba a tela na hora
            alert("Sua sessão foi encerrada.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) {
    return <Login setUser={setUser} />;
  }

  // 🔐 FORÇAR TROCA DE SENHA
  if (user.precisa_trocar_senha) {
    return <TrocarSenha user={user} setUser={setUser} />;
  }

  // 👑 ADMIN
  if (user.is_admin) {
    return <DashboardAdmin user={user} />;
  }

  // 👤 USUÁRIO NORMAL
  return <Dashboard user={user} />;
}