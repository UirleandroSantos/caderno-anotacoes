import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardAdmin from "./pages/DashboardAdmin";
import TrocarSenha from "./pages/TrocarSenha";

export default function App() {
  // ✅ Lê o localStorage SINCROAMENTE logo na inicialização do estado
  const [user, setUser] = useState(() => {
    const userStorage = localStorage.getItem("usuario");
    if (userStorage) {
      try {
        return JSON.parse(userStorage);
      } catch (e) {
        localStorage.removeItem("usuario");
        return null;
      }
    }
    return null;
  });

  // Se não houver usuário salvo, exibe a tela de Login
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