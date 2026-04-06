import { useState } from "react";
import { supabase } from "../services/supabase";

export default function TrocarSenha({ user, setUser }) {
  const [novaSenha, setNovaSenha] = useState("");

  async function alterarSenha() {
    if (novaSenha.length < 6) {
      return alert("Senha deve ter pelo menos 6 caracteres");
    }

    const { error } = await supabase
      .from("usuarios")
      .update({
        senha: novaSenha,
        precisa_trocar_senha: false,
      })
      .eq("id", user.id);

    if (error) return alert("Erro ao atualizar senha");

    const novoUser = {
      ...user,
      senha: novaSenha,
      precisa_trocar_senha: false,
    };

    localStorage.setItem("usuario", JSON.stringify(novoUser));
    setUser(novoUser);
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-6 shadow-lg rounded-xl w-80">
        <h2 className="text-xl mb-4">Trocar Senha</h2>

        <input
          type="password"
          placeholder="Nova senha"
          className="w-full mb-3 p-2 border"
          onChange={(e) => setNovaSenha(e.target.value)}
        />

        <button
          onClick={alterarSenha}
          className="w-full bg-green-500 text-white p-2"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}