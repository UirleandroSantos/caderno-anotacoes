import { useState } from "react";
import { supabase } from "../services/supabase";
import { Mail, Lock } from "lucide-react";
import Footer from "../components/Footer";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manter, setManter] = useState(true);

  async function handleLogin() {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .eq("senha", senha)
      .single();

    if (error || !data) {
      alert("Login inválido");
      return;
    }

    // Limpa gravações anteriores para evitar conflitos
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("usuario");

    // ✅ Salva no localStorage se "Manter conectado" estiver ativo (persiste ao fechar o navegador)
    // ✅ Salva no sessionStorage se não estiver ativo (mantém logado na atualização da página, mas desloga ao fechar a aba)
    if (manter) {
      localStorage.setItem("usuario", JSON.stringify(data));
      localStorage.setItem("manter_conectado", "true");
    } else {
      sessionStorage.setItem("usuario", JSON.stringify(data));
      localStorage.removeItem("manter_conectado");
    }

    // 🔐 TROCA DE SENHA
    if (data.precisa_trocar_senha) {
      alert("Você precisa trocar a senha!");
    }

    setUser(data);
  }

  return (
    <div className="relative h-screen overflow-hidden flex flex-col">
      <div className="min-h-screen flex flex-col bg-gray-950 text-white overflow-hidden">

        {/* CENTRO */}
        <div className="absolute inset-0 pb-40 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-80 shadow-xl">

            <h2 className="text-2xl font-bold mb-1 text-center">
              Bem-vindo
            </h2>

            <p className="text-gray-400 text-sm text-center mb-4">
              Faça login para continuar
            </p>

            <div className="space-y-3">

              {/* EMAIL */}
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  placeholder="Login"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 text-white"
                />
              </div>

              {/* SENHA */}
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 text-white"
                />
              </div>

              {/* CHECKBOX */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="manter"
                  checked={manter}
                  onChange={() => setManter(!manter)}
                  className="accent-blue-500 cursor-pointer"
                />
                <label htmlFor="manter" className="text-sm text-gray-400 cursor-pointer">
                  Manter conectado
                </label>
              </div>

            </div>

            {/* BOTÃO */}
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 transition p-2 mt-4 rounded font-medium"
            >
              Entrar
            </button>

          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="absolute bottom-0 w-full flex items-center justify-center">
        <Footer />
      </div>
    </div>
  );
}