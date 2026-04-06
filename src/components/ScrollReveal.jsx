import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import FuncionarioCard from "../components/FuncionarioCard";

export default function Dashboard({ user }) {
  const triggerRef = useRef(null);

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

  const [mostrarCards, setMostrarCards] = useState(false);

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  useEffect(() => {
    carregarTotais();
  }, [dataInicio, dataFim]);

  // 🔥 GATILHO LIMPO (SEM EMPURRAR LAYOUT)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMostrarCards(true);
        }
      },
      { threshold: 0.3 }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => {
      if (triggerRef.current) {
        observer.disconnect();
      }
    };
  }, []);

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

    const totalS = (servicos || []).reduce(
      (a, b) => a + Number(b.valor || 0),
      0
    );

    const totalD = (despesas || []).reduce(
      (a, b) => a + Number(b.valor || 0),
      0
    );

    setTotalServicos(totalS);
    setTotalDespesas(totalD);
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
  }

  function logout() {
    localStorage.removeItem("usuario");
    window.location.reload();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* TOPO */}
      <div className="flex justify-between items-center p-4 bg-gray-100 sticky top-0">
        <button onClick={() => alert("Abrir menu")}>☰ Menu</button>

        <button onClick={logout} className="bg-red-500 text-white px-3 py-1">
          Sair
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-5xl mx-auto w-full">

        {/* CRIAR */}
        <div className="p-4 flex gap-2">
          <input
            placeholder="Nome do funcionário"
            className="border p-2 flex-1"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <button
            onClick={criarFuncionario}
            className="bg-blue-500 text-white px-4"
          >
            Criar
          </button>
        </div>

        {/* FILTRO + TOTAIS */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 mb-3">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="border p-2"
            />

            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border p-2"
            />
          </div>

          <div className="bg-white p-3 rounded shadow">
            <p className="text-green-600">💰 Serviços: R$ {totalServicos}</p>
            <p className="text-red-600">💸 Despesas: R$ {totalDespesas}</p>
            <p className="font-bold">
              📊 Lucro: R$ {totalServicos - totalDespesas}
            </p>
          </div>
        </div>

        {/* 👇 GATILHO INVISÍVEL */}
        <div ref={triggerRef} className="h-10" />

        {/* CARDS */}
        <div
          className={`transition-all duration-500 ${
            mostrarCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex gap-4 overflow-x-auto p-4">
            {funcionarios.map((f) => (
              <FuncionarioCard key={f.id} funcionario={f} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}