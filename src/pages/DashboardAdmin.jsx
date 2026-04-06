import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function DashboardAdmin({ user }) {
  const [usuarios, setUsuarios] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    const { data } = await supabase.from("usuarios").select("*");
    setUsuarios(data || []);
  }

  async function criarUsuario() {
    if (!email) return alert("Digite um email");

    await supabase.from("usuarios").insert([
      {
        email,
        senha: "123456",
        is_admin: false,
        precisa_trocar_senha: true,
      },
    ]);

    setEmail("");
    carregarUsuarios();
  }

  async function deletarUsuario(id) {
    await supabase.from("usuarios").delete().eq("id", id);
    carregarUsuarios();
  }

  function logout() {
    localStorage.removeItem("usuario");
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel Admin</h1>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Sair
        </button>
      </div>

      {/* CRIAR USUÁRIO */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl mb-6 shadow">

        <h2 className="text-lg mb-3">Criar novo usuário</h2>

        <div className="flex gap-2">
          <input
            placeholder="Email do usuário"
            className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 outline-none focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={criarUsuario}
            className="bg-blue-600 hover:bg-blue-700 px-4 rounded"
          >
            Criar
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Senha padrão: 123456 (usuário será obrigado a trocar)
        </p>
      </div>

      {/* LISTA DE USUÁRIOS */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl shadow">

        <h2 className="text-lg mb-3">Usuários</h2>

        {usuarios.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum usuário encontrado</p>
        ) : (
          <div className="space-y-2">
            {usuarios.map((u) => (
              <div
                key={u.id}
                className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700"
              >
                <div>
                  <p className="font-medium">{u.email}</p>
                  {u.is_admin && (
                    <span className="text-xs text-blue-400">Admin</span>
                  )}
                </div>

                {!u.is_admin && (
                  <button
                    onClick={() => deletarUsuario(u.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                  >
                    Deletar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}