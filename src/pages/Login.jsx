import { useState } from "react";
import { supabase } from "../services/supabase";
import { Mail, Lock } from "lucide-react";


export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manter, setManter] = useState(false);

  async function handleLogin() {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .eq("senha", senha)
      .single();

    if (error) return alert("Login inválido");

    if (manter) {
      localStorage.setItem("usuario", JSON.stringify(data));
    }

    if (data.precisa_trocar_senha) {
      alert("Você precisa trocar a senha!");
    }

    setUser(data);
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
      
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-80 shadow-xl">
        
        <h2 className="text-2xl font-bold mb-1 text-center">
          Bem-vindo
        </h2>
        <p className="text-gray-400 text-sm text-center mb-4">
          Faça login para continuar
        </p>

        <div className="space-y-3">

  {/* Inputs */}
  <div className="relative">
    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
    <input
      placeholder="Email/Usuário"
      className="w-full pl-10 pr-3 py-2 rounded bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 text-white"
      onChange={(e) => setEmail(e.target.value)}
    />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="password"
          placeholder="Senha"
          className="w-full pl-10 pr-3 py-2 rounded bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 text-white"
          onChange={(e) => setSenha(e.target.value)}
        />
      </div>

      {/* Manter conectado */}
      <div className="flex items-center gap-2 mt-2">
        <input type="checkbox" className="accent-blue-500" />
        <label className="text-sm text-gray-400">
          Manter conectado
        </label>
      </div>

    </div>
          Manter conectado
      

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-2 rounded font-medium"
        >
          Entrar
        </button>

      </div>
    </div>
  );
}