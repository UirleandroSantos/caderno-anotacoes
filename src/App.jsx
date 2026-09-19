import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardAdmin from "./pages/DashboardAdmin";
import TrocarSenha from "./pages/TrocarSenha";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validarSessao() {
      const userStorage = localStorage.getItem("usuario_v2");

      if (!userStorage) {
        setLoading(false);
        return;
      }

      const usuarioLocal = JSON.parse(userStorage);

      try {
        // 🔒 Verifica se o usuário com a senha salva ainda existe no banco
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("email", usuarioLocal.email)
          .eq("senha", usuarioLocal.senha)
          .single();

        // Se a senha mudou ou o usuário foi removido, desloga na hora
        if (error || !data) {
          localStorage.removeItem("usuario_v2");
          setUser(null);
        } else {
          // Mantém os dados atualizados do banco (caso precise de flags como precisa_trocar_senha)
          setUser(data);
        }
      } catch (err) {
        console.error("Erro ao validar sessão:", err);
        localStorage.removeItem("usuario_v2");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    validarSessao();
  }, []);

  // Evita 'piscar' a tela de login enquanto valida no Supabase
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

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