import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import FuncionarioCard from "../components/FuncionarioCard";
import { LogOut, Menu, RefreshCw, PawPrint   } from "lucide-react";

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
  const [totalCreditos, setTotalCreditos] = useState(0);

  const [funcionarios, setFuncionarios] = useState([]);
  const [nome, setNome] = useState("");

  const [menuAberto, setMenuAberto] = useState(false);
  const [modoMenu, setModoMenu] = useState("lista"); // lista | criar

  // 🔎 BUSCA
  const [busca, setBusca] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState([]);

  const totalBusca = resultadosBusca.reduce(
  (acc, item) => acc + Number(item.valor || 0),
    0
  );

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  useEffect(() => {
    carregarTotais();
  }, [dataInicio, dataFim]);

  function atualizarPagina() {
  window.location.reload();
}

  useEffect(() => {
  if (busca) {
    buscarServicos();
  } else {
    setResultadosBusca([]);
  }
}, [busca, dataInicio, dataFim]);

  async function carregarFuncionarios() {
    const { data } = await supabase
      .from("funcionarios")
      .select("*")
      .eq("user_id", user.id);

    setFuncionarios(data || []);
  }

  async function carregarTotais() {

    const { data: funcs } = await supabase
      .from("funcionarios")
      .select("id")
      .eq("user_id", user.id);

    const idsFuncionarios = (funcs || []).map((f) => f.id);

    const { data: servicos } = await supabase
      .from("servicos")
      .select("valor")
      .in("funcionario_id", idsFuncionarios)
      .gte("data", dataInicio)
      .lte("data", dataFim);

    const { data: despesas } = await supabase
      .from("despesas_funcionario")
      .select("valor, tipo")
      .in("funcionario_id", idsFuncionarios)
      .gte("data", dataInicio)
      .lte("data", dataFim);

    setTotalServicos(
      (servicos || []).reduce((a, b) => a + Number(b.valor || 0), 0)
    );

    const despesasFiltradas = (despesas || []).filter(
        (d) => d.tipo !== "Crédito"
      );

      const creditosFiltrados = (despesas || []).filter(
        (d) => d.tipo === "Crédito"
      );

      setTotalDespesas(
        despesasFiltradas.reduce((a, b) => a + Number(b.valor || 0), 0)
      );

      setTotalCreditos(
        creditosFiltrados.reduce((a, b) => a + Number(b.valor || 0), 0)
      );
  }

  // 🔎 BUSCAR SERVIÇOS POR CLIENTE/PET
async function buscarServicos() {
  const { data: funcs } = await supabase
    .from("funcionarios")
    .select("id, nome")
    .eq("user_id", user.id);

  const idsFuncionarios = (funcs || []).map((f) => f.id);

  const { data: servicos } = await supabase
    .from("servicos")
    .select("*")
    .in("funcionario_id", idsFuncionarios)
    .ilike("cliente", `%${busca}%`)
    .gte("data", dataInicio)
    .lte("data", dataFim)
    .order("data", { ascending: false });

  const resultadoComFuncionario = (servicos || []).map((s) => {
    const func = funcs.find((f) => f.id === s.funcionario_id);
    return {
      ...s,
      funcionario_nome: func?.nome || "Desconhecido",
    };
  });

  setResultadosBusca(resultadoComFuncionario);
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

  const lucro = totalServicos - (totalDespesas * 0.5);

  return (
    <div
      ref={containerRef}
      className="flex overflow-x-auto w-screen h-screen snap-x snap-mandatory scroll-smooth bg-gray-900 text-white"
      style={{ touchAction: "pan-x" }}
    >
      {/* 🔄 BOTÃO FLUTUANTE DE ATUALIZAR */}
    <button
      onClick={atualizarPagina}
      className="fixed bottom-6 right-6 bg-green-500 z-[9999] hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
    >
      <RefreshCw size={20} />
    </button>
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
            <Menu size={24} />
          </button>
            <h1 className="flex items-center gap-2"><span>Dr Tosa</span><span><PawPrint size={16} /></span></h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
            <LogOut size={16} />
          </button>
        </div>
              <h2 className="text-white-800 font-bold text-center text-xl mt-5">Gestão Financeira</h2>

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
              <p className="text-gray-400 text-sm">Valor total Serviços</p>
              <p className="text-green-400 text-xl font-bold">
                R$ {totalServicos.toFixed(2).replace(".",",")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 p-4 rounded">
              <p className="text-gray-400 text-sm">Despesas</p>
              <p className="text-red-400 text-xl font-bold">
                R$ {totalDespesas.toFixed(2).replace(".",",")}
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <p className="text-gray-400 text-sm">Créditos</p>
              <p className="text-blue-400 text-xl font-bold">
                R$ {totalCreditos.toFixed(2).replace(".",",")}
              </p>
            </div>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <p className="text-gray-400 text-sm">Lucro</p>
              <p className="text-blue-400 text-xl font-bold">
                R$ {lucro.toFixed(2).replace(".",",")}
              </p>
            </div>
          </div>

          <div className="text-center text-gray-500 mt-6">
            👉 Arraste para o lado
          </div>
          {/* 🔎 BUSCA */}
          <input
            placeholder="Buscar cliente/pet..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-gray-800 border border-gray-700 p-2 rounded w-full mt-4"
          />

          {/* RESULTADO DA BUSCA */}
{busca && (
  <div className="mt-3">

    {/* ✅ TOTAL DA BUSCA */}
    <div className="bg-gray-800 p-2 rounded mb-2 text-sm border border-gray-700 flex justify-between">
      <span>Total da busca</span>
      <span className="text-green-400 font-bold">
        R$ {totalBusca.toFixed(2).replace(".", ",")}
      </span>
    </div>

    {/* 🔎 LISTA DE RESULTADOS */}
    <div className="max-h-[300px] overflow-y-auto">
      {resultadosBusca.map((s) => (
        <div
          key={s.id}
          className="bg-gray-800 p-3 rounded mb-2 text-sm border border-gray-700"
        >
          <div className="font-bold">{s.cliente}</div>

          <div className="text-gray-400">{s.tipo}</div>

          <div className="text-green-400">
            R$ {Number(s.valor).toFixed(2).replace(".", ",")}
          </div>

          <div className="text-xs text-gray-500">
            {new Date(s.data + "T00:00:00").toLocaleDateString()}
          </div>

          <div className="text-xs text-blue-400 mt-1">
            Funcionário: {s.funcionario_nome}
          </div>
        </div>
      ))}
    </div>

  </div>
)}
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