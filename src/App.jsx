import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardAdmin from "./pages/DashboardAdmin";
import TrocarSenha from "./pages/TrocarSenha";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStorage = localStorage.getItem("usuario_v2");
    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  }, []);

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