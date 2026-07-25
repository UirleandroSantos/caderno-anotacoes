import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import FuncionarioCard from "../components/FuncionarioCard";
import { 
  LogOut, 
  Menu, 
  PawPrint, 
  Briefcase, 
  X, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  UserPlus,
  ArrowLeft,
  BarChart2
} from "lucide-react";
import ModalDespesaAdmin from "../components/ModalDespesaAdmin";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";

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
  const [modalDespesaAdmin, setModalDespesaAdmin] = useState(false);
  const [totalCreditos, setTotalCreditos] = useState(0);

  const [funcionarios, setFuncionarios] = useState([]);
  const [nome, setNome] = useState("");

  const [menuAberto, setMenuAberto] = useState(false);
  const [modoMenu, setModoMenu] = useState("lista"); // lista | criar

  const [despesasAdmin, setDespesasAdmin] = useState([]);
  const [historicoMensal, setHistoricoMensal] = useState([]);

  useEffect(() => {
    carregarFuncionarios();
    carregarHistoricoMensal();
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
      .select("valor, tipo, categoria")
      .in("funcionario_id", idsFuncionarios)
      .gte("data", dataInicio)
      .lte("data", dataFim);

    setTotalServicos(
      (servicos || []).reduce((a, b) => a + Number(b.valor || 0), 0)
    );

    const despesasFiltradas = (despesas || []).filter(
      (d) =>
        d.categoria === "Despesa" ||
        (!d.categoria && d.tipo !== "Crédito")
    );

    const creditosFiltrados = (despesas || []).filter(
      (d) =>
        d.categoria === "Crédito" ||
        d.tipo === "Crédito"
    );

    setTotalDespesas(
      despesasFiltradas.reduce((a, b) => a + Number(b.valor || 0), 0)
    );

    setTotalCreditos(
      creditosFiltrados.reduce((a, b) => a + Number(b.valor || 0), 0)
    );
  }

  async function carregarHistoricoMensal() {
    const { data: funcs } = await supabase
      .from("funcionarios")
      .select("id")
      .eq("user_id", user.id);

    const idsFuncionarios = (funcs || []).map((f) => f.id);

    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const resultado = [];

    const agora = new Date();

    // Busca os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const ano = d.getFullYear();
      const mes = d.getMonth();

      const ini = new Date(ano, mes, 1).toISOString().split("T")[0];
      const fim = new Date(ano, mes + 1, 0).toISOString().split("T")[0];

      const { data: servs } = await supabase
        .from("servicos")
        .select("valor")
        .in("funcionario_id", idsFuncionarios)
        .gte("data", ini)
        .lte("data", fim);

      const { data: despsFunc } = await supabase
        .from("despesas_funcionario")
        .select("valor, tipo, categoria")
        .in("funcionario_id", idsFuncionarios)
        .gte("data", ini)
        .lte("data", fim);

      const { data: despsAdmin } = await supabase
        .from("despesas_administrativas")
        .select("valor")
        .eq("user_id", user.id)
        .gte("data", ini)
        .lte("data", fim);

      const fat = (servs || []).reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
      
      const despF = (despsFunc || [])
        .filter((d) => d.categoria === "Despesa" || (!d.categoria && d.tipo !== "Crédito"))
        .reduce((acc, curr) => acc + Number(curr.valor || 0), 0);

      const despA = (despsAdmin || []).reduce((acc, curr) => acc + Number(curr.valor || 0), 0);

      resultado.push({
        mes: `${mesesNomes[mes]}`,
        Faturamento: fat,
        Despesas: despF + despA,
      });
    }

    setHistoricoMensal(resultado);
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

  async function salvarDespesaAdmin(dados) {
    await supabase.from("despesas_administrativas").insert([
      {
        user_id: user.id,
        ...dados,
      },
    ]);

    setModalDespesaAdmin(false);
    carregarHistoricoMensal();
  }

  async function buscarDespesasAdmin() {
    const { data, error } = await supabase
      .from("despesas_administrativas")
      .select("*")
      .gte("data", dataInicio)
      .lte("data", dataFim)
      .order("data", { ascending: false });

    if (error) {
      console.error("Erro ao buscar despesas admin:", error);
    } else {
      setDespesasAdmin(data || []);
    }
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

  useEffect(() => {
    buscarDespesasAdmin();
  }, [dataInicio, dataFim]);

  const totalDespesasAdmin = despesasAdmin.reduce(
    (acc, d) => acc + Number(d.valor),
    0
  );

  return (
    <div
      ref={containerRef}
      className="flex overflow-x-auto w-screen h-screen snap-x snap-mandatory scroll-smooth bg-slate-950 text-slate-100 antialiased"
      style={{ touchAction: "pan-x" }}
    >
      {/* DASHBOARD */}
      <div className="min-w-full h-full snap-start flex flex-col relative overflow-y-auto pb-8">

        {/* OVERLAY & DRAWER DO MENU */}
        {menuAberto && (
          <div className="fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMenuAberto(false)}
            />

            <div className="relative w-72 max-w-[80vw] h-full bg-slate-900 border-r border-slate-800 p-5 shadow-2xl flex flex-col justify-between z-10">
              {modoMenu === "lista" && (
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                      <Menu size={18} className="text-emerald-400" />
                      Navegação
                    </h2>
                    <button 
                      onClick={() => setMenuAberto(false)} 
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setModoMenu("criar")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-200 hover:text-white transition group text-left"
                    >
                      <UserPlus size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Cadastrar Funcionário</span>
                    </button>

                    <button
                      onClick={() => setModalDespesaAdmin(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-200 hover:text-white transition group text-left"
                    >
                      <Briefcase size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Cadastrar Despesa</span>
                    </button>
                  </div>
                </div>
              )}

              {modoMenu === "criar" && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                      <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <UserPlus size={18} className="text-emerald-400" />
                        Novo Funcionário
                      </h2>
                      <button 
                        onClick={() => setModoMenu("lista")} 
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                      >
                        <ArrowLeft size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Nome Completo</label>
                        <input
                          placeholder="Ex: João Silva"
                          className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 p-2.5 rounded-xl w-full text-slate-100 placeholder-slate-500 outline-none transition text-sm"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                        />
                      </div>

                      <button
                        onClick={criarFuncionario}
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 font-medium text-white rounded-xl transition shadow-lg shadow-emerald-950/20 text-sm active:scale-[0.98]"
                      >
                        Salvar Funcionário
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setModoMenu("lista")}
                    className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 text-sm py-2 transition"
                  >
                    <ArrowLeft size={16} /> Voltar ao Menu
                  </button>
                </div>
              )}

              {modoMenu === "lista" && (
                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setMenuAberto(false)}
                    className="w-full text-center py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition"
                  >
                    Fechar Menu
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOPO / HEADER */}
        <header className="flex justify-between items-center px-5 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20">
          <button
            onClick={() => {
              setMenuAberto(true);
              setModoMenu("lista");
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 transition border border-slate-700/50 active:scale-95"
            aria-label="Abrir Menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PawPrint size={18} />
            </div>
            <span className="font-semibold text-sm tracking-wide text-slate-200">Painel Admin</span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition active:scale-95"
            aria-label="Sair"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* BOAS VINDAS / TÍTULO */}
        <div className="px-5 mt-5 mb-2 text-center">
          <span className="text-xs font-medium uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full inline-block mb-2">
            Gestão Financeira
          </span>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Olá, José Aldenir</h2>
        </div>

        <div className="w-full px-5 max-w-xl mx-auto space-y-4">

          {/* FILTRO DE DATAS */}
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 flex gap-2 items-center">
            <div className="relative flex-1">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="bg-slate-950 border border-slate-800 pl-8 pr-2 py-2 rounded-xl w-full text-xs text-slate-200 outline-none focus:border-emerald-500/50 transition"
              />
            </div>

            <span className="text-slate-500 text-xs font-bold">até</span>

            <div className="relative flex-1">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="bg-slate-950 border border-slate-800 pl-8 pr-2 py-2 rounded-xl w-full text-xs text-slate-200 outline-none focus:border-emerald-500/50 transition"
              />
            </div>
          </div>

          {/* CARDS RESUMO FINANCEIRO */}
          <div className="space-y-3">
            {/* Card Faturamento Destaque */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-4 rounded-2xl border border-emerald-500/20 shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs font-medium mb-1">Faturamento Total</p>
                  <p className="text-emerald-400 text-2xl font-extrabold tracking-tight font-mono">
                    R$ {totalServicos.toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>

            {/* Grid 2 Colunas: Despesas e Créditos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-400 text-xs font-medium">Despesas Equipe</p>
                  <TrendingDown size={14} className="text-rose-400" />
                </div>
                <p className="text-rose-400 text-lg font-bold font-mono">
                  R$ {totalDespesas.toFixed(2).replace(".", ",")}
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-400 text-xs font-medium">Créditos Equipe</p>
                  <CreditCard size={14} className="text-sky-400" />
                </div>
                <p className="text-sky-400 text-lg font-bold font-mono">
                  R$ {totalCreditos.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>

            {/* Despesas Administrativas */}
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Despesas Administrativas</p>
                  <p className="text-base font-bold text-rose-400 font-mono">
                    R$ {totalDespesasAdmin.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* GRÁFICO HISTÓRICO MÊS A MÊS */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-200">Histórico (Últimos 6 Meses)</h3>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Fat.
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Desp.
                </span>
              </div>
            </div>

            <div className="h-48 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicoMensal} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="mes" stroke="#64748b" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                    formatter={(value) => [`R$ ${Number(value).toFixed(2).replace(".", ",")}`]}
                  />
                  <Bar dataKey="Faturamento" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* CARDS DE FUNCIONÁRIOS (SLIDE LATERAL) */}
      <div className="min-w-full h-full snap-start flex">
        <div className="flex w-full h-full">
          {funcionarios.map((f) => (
            <div key={f.id} className="min-w-full h-full snap-start">
              <FuncionarioCard funcionario={f} />
            </div>
          ))}
        </div>
      </div>

      {modalDespesaAdmin && (
        <ModalDespesaAdmin
          onClose={() => setModalDespesaAdmin(false)}
          onSave={salvarDespesaAdmin}
        />
      )}
    </div>
  );
}