import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import FuncionarioCard from "../components/FuncionarioCard";

export default function Dashboard({ user }) {
  const containerRef = useRef(null);

  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const hojeFormatado = hoje.toISOString().split("T")[0];

  const [dataInicio, setDataInicio] = useState(primeiroDia);
  const [dataFim, setDataFim] = useState(hojeFormatado);

  const [totalServicos, setTotalServicos] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);

  const [funcionarios, setFuncionarios] = useState([]);
  const [nome, setNome] = useState("");

  const [menuAberto, setMenuAberto] = useState(false);
  const [modoMenu, setModoMenu] = useState("lista"); // lista | criar

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  useEffect(() => {
    carregarTotais();
  }, [dataInicio, dataFim]);

  async function carregarFuncionarios() {
    const { data } = await supabase
      .from("funcionarios")
      .select("*")
      .eq("user_id", user.id);

    setFuncionarios(data || []);
  }

  async function carregarTotais() {
    const { data: servicos } = await supabase
      .from("servicos")
      .select("valor")
      .gte("data", dataInicio)
      .lte("data", dataFim);

    const { data: despesas } = await supabase
      .from("despesas_funcionario")
      .select("valor")
      .gte("data", dataInicio)
      .lte("data", dataFim);

    setTotalServicos(
      (servicos || []).reduce((a, b) => a + Number(b.valor || 0), 0)
    );

    setTotalDespesas(
      (despesas || []).reduce((a, b) => a + Number(b.valor || 0), 0)
    );
  }

  async function criarFuncionario() {
    if (!nome) return alert("Digite um nome");

    await supabase.from("funcionarios").insert([
      {
        nome,
        user_id: user.id,
      },
    ]);

    setNome("");
    carregarFuncionarios();

    // volta pro menu principal
    setModoMenu("lista");
  }

  function logout() {
    localStorage.removeItem("usuario");
    window.location.reload();
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex overflow-x-auto w-screen h-screen snap-x snap-mandatory scroll-smooth bg-gray-900 text-white"
      style={{ touchAction: "pan-x" }}
    >
      {/* DASHBOARD */}
      <div className="min-w-full h-full snap-start flex flex-col relative">

        {/* MENU */}
        {menuAberto && (
            <div className="absolute top-0 left-0 w-64 h-full bg-gray-800 p-4 z-50 shadow-lg">

            {modoMenu === "lista" && (
              <>
                <h2 className="text-lg font-bold mb-4">Menu</h2>

                <button
                  onClick={() => setModoMenu("criar")}
                  className="w-full text-left p-2 rounded hover:bg-gray-700"
                >
                  ➕ Cadastrar Funcionário
                </button>

                <button
                  onClick={() => setMenuAberto(false)}
                  className="mt-4 text-gray-400 text-sm"
                  >
                  Fechar
                </button>
              </>
            )}

            {modoMenu === "criar" && (
                <>
                <h2 className="text-lg font-bold mb-4">
                  Novo Funcionário
                </h2>

                <input
                  placeholder="Nome"
                  className="bg-gray-700 p-2 w-full rounded mb-3"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />

                <button
                  onClick={criarFuncionario}
                  className="bg-blue-600 w-full p-2 rounded mb-2"
                  >
                  Salvar
                </button>

                <button
                  onClick={() => setModoMenu("lista")}
                  className="text-gray-400 text-sm"
                  >
                  ← Voltar
                </button>
              </>
            )}
          </div>
        )}

        {/* TOPO */}
        <div className="flex justify-between items-center p-4 bg-gray-800 shadow">
          <button
            onClick={() => {
                setMenuAberto(true);
                setModoMenu("lista");
            }}
            className="text-gray-300"
            >
            ☰ Menu
          </button>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
            Sair
          </button>
        </div>
              <h1 className="text-white-800 font-bold text-center text-xl mt-5">Dashboard Financeiro</h1>

        <div className="w-full px-4">

          {/* FILTRO */}
          <div className="flex gap-2 my-4">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-gray-800 border border-gray-700 p-2 rounded w-full"
            />

            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-gray-800 border border-gray-700 p-2 rounded w-full"
            />
          </div>

          {/* CARDS MOBILE */}
          <div className="flex flex-col gap-3">
            <div className="bg-gray-800 p-4 rounded">
              <p className="text-gray-400 text-sm">Serviços</p>
              <p className="text-green-400 text-xl font-bold">
                R$ {totalServicos}
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <p className="text-gray-400 text-sm">Despesas</p>
              <p className="text-red-400 text-xl font-bold">
                R$ {totalDespesas}
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <p className="text-gray-400 text-sm">Lucro</p>
              <p className="text-blue-400 text-xl font-bold">
                R$ {totalServicos - totalDespesas}
              </p>
            </div>
          </div>

          <div className="text-center text-gray-500 mt-6">
            👉 Arraste para o lado
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div className="min-w-full h-full snap-start flex">
        <div className="flex w-full h-full">
          {funcionarios.map((f) => (
            <div key={f.id} className="min-w-full h-full snap-start">
              <FuncionarioCard funcionario={f} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}