import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

import ModalServico from "./ModalServico";
import ModalDespesa from "./ModalDespesa";
import ModalCredito from "./ModalCredito";
import { Pencil, Trash, Wrench, CreditCard, HandCoins, CalendarCheck, Share2 } from "lucide-react";

export default function FuncionarioCard({ funcionario }) {
  const [servicos, setServicos] = useState([]);
  const [despesas, setDespesas] = useState([]);

  const [modalServico, setModalServico] = useState(false);
  const [modalDespesa, setModalDespesa] = useState(false);
  const [modalCredito, setModalCredito] = useState(false);

  const [editarServico, setEditarServico] = useState(null);
  const [editarDespesa, setEditarDespesa] = useState(null);

  const [mostrarDespesas, setMostrarDespesas] = useState(false);

  const hojeBase = new Date();
  const diaAtual = hojeBase.getDate();

  const inicioQuinzena =
    diaAtual <= 15
      ? new Date(hojeBase.getFullYear(), hojeBase.getMonth(), 1)
      : new Date(hojeBase.getFullYear(), hojeBase.getMonth(), 16);

  const fimQuinzena =
    diaAtual <= 15
      ? new Date(hojeBase.getFullYear(), hojeBase.getMonth(), 15)
      : hojeBase;

  const [dataInicio, setDataInicio] = useState(
    inicioQuinzena.toLocaleDateString("sv-SE")
  );

  const [dataFim, setDataFim] = useState(
    fimQuinzena.toLocaleDateString("sv-SE")
  );

  function aplicarPrimeiraQuinzena() {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 15);

    setDataInicio(inicio.toLocaleDateString("sv-SE"));
    setDataFim(fim.toLocaleDateString("sv-SE"));
  }

  function aplicarSegundaQuinzena() {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 16);

    setDataInicio(inicio.toLocaleDateString("sv-SE"));
    setDataFim(hoje.toLocaleDateString("sv-SE"));
  }

  const [filtroTipo, setFiltroTipo] = useState("");

  useEffect(() => {
    carregarDados();
  }, [dataInicio, dataFim]);

  async function carregarDados() {
    const { data: s } = await supabase
      .from("servicos")
      .select("*")
      .eq("funcionario_id", funcionario.id)
      .gte("data", dataInicio)
      .lte("data", dataFim)
      .order("data", { ascending: false });

    const { data: d } = await supabase
      .from("despesas_funcionario")
      .select("*")
      .eq("funcionario_id", funcionario.id)
      .gte("data", dataInicio)
      .lte("data", dataFim)
      .order("data", { ascending: false });

    setServicos(s || []);
    setDespesas(d || []);
  }

  const servicosFiltrados = filtroTipo
    ? servicos.filter((s) => s.tipo === filtroTipo)
    : servicos;

  const totalServicos = servicosFiltrados.reduce(
    (a, b) => a + Number(b.valor || 0),
    0
  );

  const totalDespesas = despesas
    .filter((d) => d.categoria === "Despesa" || (!d.categoria && d.tipo !== "Crédito"))
    .reduce((a, b) => a + Number(b.valor || 0), 0);

  const totalCreditos = despesas
    .filter((d) => d.categoria === "Crédito" || d.tipo === "Crédito")
    .reduce((a, b) => a + Number(b.valor || 0), 0);

  const quantidadeServicos = servicosFiltrados.length;

  async function salvarServico(dados) {
    if (editarServico) {
      await supabase.from("servicos").update(dados).eq("id", editarServico.id);
      setEditarServico(null);
    } else {
      await supabase.from("servicos").insert([
        {
          funcionario_id: funcionario.id,
          ...dados,
        },
      ]);
    }
    setModalServico(false);
    carregarDados();
  }

  async function salvarDespesa(dados) {
    if (editarDespesa) {
      await supabase.from("despesas_funcionario").update(dados).eq("id", editarDespesa.id);
      setEditarDespesa(null);
    } else {
      await supabase.from("despesas_funcionario").insert([
        {
          funcionario_id: funcionario.id,
          ...dados,
        },
      ]);
    }
    setModalDespesa(false);
    carregarDados();
  }

  async function salvarCredito(dados) {
    await supabase.from("despesas_funcionario").insert([
      {
        funcionario_id: funcionario.id,
        ...dados,
      },
    ]);
    setModalCredito(false);
    carregarDados();
  }

  async function excluirServico(id) {
    if (!window.confirm("Excluir serviço?")) return;
    await supabase.from("servicos").delete().eq("id", id);
    carregarDados();
  }

  async function excluirDespesa(id) {
    if (!window.confirm("Excluir despesa?")) return;
    await supabase.from("despesas_funcionario").delete().eq("id", id);
    carregarDados();
  }

  // Função para compartilhar o relatório diretamente formatado para texto/WhatsApp
  async function compartilharRelatorio() {
    const formatarDataInput = (dataString) => {
      if (!dataString) return "";
      const [ano, mes, dia] = dataString.split("-");
      return `${dia}/${mes}/${ano}`;
    };

    const formatarMoeda = (valor) => {
      return Number(valor).toFixed(2).replace(".", ",");
    };

    const dataInicioFormatada = formatarDataInput(dataInicio);
    const dataFimFormatada = formatarDataInput(dataFim);

    // Filtra e ordena os dados estritamente dentro do período
    const servicosNoPeriodo = servicosFiltrados
      .filter((s) => s.data >= dataInicio && s.data <= dataFim)
      .sort((a, b) => b.data.localeCompare(a.data));

    const despesasNoPeriodo = despesas
      .filter((d) => d.data >= dataInicio && d.data <= dataFim)
      .sort((a, b) => b.data.localeCompare(a.data));

    // Recalcula os totais estritos do período filtrado
    const totalS = servicosNoPeriodo.reduce((a, b) => a + Number(b.valor || 0), 0);
    
    const totalD = despesasNoPeriodo
      .filter((d) => d.categoria === "Despesa" || (!d.categoria && d.tipo !== "Crédito"))
      .reduce((a, b) => a + Number(b.valor || 0), 0);

    const totalC = despesasNoPeriodo
      .filter((d) => d.categoria === "Crédito" || d.tipo === "Crédito")
      .reduce((a, b) => a + Number(b.valor || 0), 0);

    const saldoLiquido = totalS - totalD + totalC;

    // Cabeçalho da Mensagem
    let textoRelatorio = `*Dr Tosa* 🐾\n`;
    textoRelatorio += `*Relatório de Produção*\n\n`;
    textoRelatorio += `👤 *Parceiro:* ${funcionario.nome}\n`;
    textoRelatorio += `📅 *Período:* ${dataInicioFormatada} até ${dataFimFormatada}\n\n`;
    
    textoRelatorio += `💰 *Resumo Financeiro:*\n`;
    textoRelatorio += `  • Faturamento: R$ ${formatarMoeda(totalS)}\n`;
    textoRelatorio += `  • Despesas: R$ ${formatarMoeda(totalD)}\n`;
    textoRelatorio += `  • Créditos: R$ ${formatarMoeda(totalC)}\n`;
    // textoRelatorio += `  *Saldo Líquido: R$ ${formatarMoeda(saldoLiquido)}*\n`;
    textoRelatorio += `────────────────────\n\n`;

    // Seção de Serviços Realizados com Valores
    textoRelatorio += `📋 *Serviços Realizados:*\n`;
    let dataAnteriorServico = "";

    servicosNoPeriodo.forEach((s) => {
      const dataFormatada = formatarDataInput(s.data);
      if (dataFormatada !== dataAnteriorServico) {
        const nomeDia = new Date(s.data + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long" });
        const diaTitulo = nomeDia.charAt(0).toUpperCase() + nomeDia.slice(1);
        textoRelatorio += `\n📌 *${diaTitulo} - ${dataFormatada}*\n`;
        dataAnteriorServico = dataFormatada;
      }
      textoRelatorio += `• ${s.cliente} (${s.tipo}) - R$ ${formatarMoeda(s.valor)}\n`;
    });

    if (servicosNoPeriodo.length === 0) {
      textoRelatorio += `_Nenhum serviço registrado neste período._\n`;
    }

    // Seção de Lançamentos de Despesas e Créditos Separados
    textoRelatorio += `\n────────────────────\n`;
    textoRelatorio += `🔻 *Despesas e Créditos:*\n`;

    if (despesasNoPeriodo.length === 0) {
      textoRelatorio += `\n_Nenhum lançamento registrado neste período._\n`;
    } else {
      despesasNoPeriodo.forEach((d) => {
        const isCredito = d.categoria === "Crédito" || d.tipo === "Crédito";
        const dataFormatada = formatarDataInput(d.data);
        // Alterado de 🟢 para 🟠 atendendo à solicitação
        const emoji = isCredito ? "🟠 [Crédito]" : "🔴 [Despesa]";
        const desc = d.descricao ? ` - ${d.descricao}` : "";
        
        textoRelatorio += `\n${emoji} *${dataFormatada}*\n`;
        textoRelatorio += `  ${d.tipo}${desc}: R$ ${formatarMoeda(d.valor)}\n`;
      });
    }

    // Disparador de envio nativo ou Web
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Relatório Dr Tosa - ${funcionario.nome}`,
          text: textoRelatorio,
        });
      } catch (err) {
        console.log("Compartilhamento cancelado ou falhou", err);
      }
    } else {
      const urlWhatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoRelatorio)}`;
      window.open(urlWhatsapp, "_blank");
    }
  }

  return (
    <div className="min-w-full h-full bg-gray-900 text-white flex flex-col p-4">
      
      {/* Cabeçalho da Tela */}
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h2 className="text-[30px] font-bold">{funcionario.nome}</h2>
          <p className="text-gray-400 text-sm">Folha de controle</p>
        </div>
        <div>
          <button
            onClick={compartilharRelatorio}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center gap-2 transition-colors text-sm"
          >
            <Share2 size={18} />
            Compartilhar
          </button>
        </div>
      </div>
      
      {/* Filtros de Quinzena */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={aplicarPrimeiraQuinzena}
          className="bg-purple-600 hover:bg-purple-700 flex-1 p-2 rounded text-sm"
        >
          1° Quinzena
        </button>

        <button
          onClick={aplicarSegundaQuinzena}
          className="bg-purple-800 hover:bg-purple-900 flex-1 p-2 rounded text-sm"
        >
          2° Quinzena
        </button>
      </div>

      {/* Inputs de Data */}
      <div className="flex gap-2 mb-3">
        <div>
          <span className="text-gray-500 text-xs">Data início</span>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="bg-gray-800 border border-gray-700 p-2 w-full rounded"
          />
        </div>
        <div>
          <span className="text-gray-500 text-xs">Data fim</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="bg-gray-800 border border-gray-700 p-2 w-full rounded"
          />
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-gray-400 text-sm">Faturamento</p>
          <p className="text-green-400 font-bold">
            R$ {totalServicos.toFixed(2).replace(".", ",")}
          </p>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <p className="text-gray-400 text-sm">Despesas</p>
          <p className="text-red-400 font-bold">
            R$ {totalDespesas.toFixed(2).replace(".", ",")}
          </p>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <p className="text-gray-400 text-sm">Créditos</p>
          <p className="text-orange-500 font-bold">
            R$ {totalCreditos.toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>

      {/* Botões de Ações Rápidas */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => {
            setEditarServico(null);
            setModalServico(true);
          }}
          className="bg-green-600 hover:bg-green-700 flex-1 p-2 rounded flex items-center justify-center gap-2"
        >
          <Wrench size={16} />
          Serviço
        </button>

        <button
          onClick={() => {
            setEditarDespesa(null);
            setModalDespesa(true);
          }}
          className="bg-red-600 hover:bg-red-700 flex-1 p-2 rounded flex items-center justify-center gap-2"
        >
          <CreditCard size={16} />
          Despesa
        </button>

        <button
          onClick={() => setModalCredito(true)}
          className="bg-orange-500 hover:bg-blue-700 flex-1 p-2 rounded flex items-center justify-center gap-2"
        >
          <HandCoins size={16} />
          Crédito
        </button>
      </div>

      {/* Seletor de Tipo de Filtro */}
      <div className="flex items-center justify-between w-full gap-2 mb-1">
        <p>Total de serviços: {quantidadeServicos}</p>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-xs p-1 rounded w-[70px]"
        >
          <option value="">Todos</option>
          {[...new Set(servicos.map((s) => s.tipo))].map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Serviços */}
      <div className="flex-1 overflow-y-auto pr-1">
        {servicosFiltrados.map((s, index) => {
          const dataAtual = new Date(s.data + "T00:00:00");
          const dataAnterior =
            index > 0
              ? new Date(servicosFiltrados[index - 1].data + "T00:00:00")
              : null;

          const mudouDia =
            !dataAnterior ||
            dataAtual.toDateString() !== dataAnterior.toDateString();

          const nomeDia = dataAtual.toLocaleDateString("pt-BR", {
            weekday: "long",
          });

          const nomeDiaFormatado =
            nomeDia.charAt(0).toUpperCase() + nomeDia.slice(1);

          return (
            <div key={s.id}>
              
              {/* TÍTULO DO DIA */}
              {mudouDia && (
                <div className="text-xs text-gray-500 mt-1 mb-1 px-1">
                  {nomeDiaFormatado}
                </div>
              )}

              {/* CARD DE SERVIÇO */}
              <div className="bg-gray-800 p-3 rounded mb-2 text-sm border border-gray-700 flex justify-between items-center">
                <div>
                  <div className="font-bold">{s.cliente}</div>
                  <div className="text-gray-400">{s.tipo}</div>
                  <div className="text-green-400">
                    R$ {s.valor.toFixed(2).replace(".", ",")}
                  </div>
                  <div className="text-xs text-gray-500 flex gap-1 items-center">
                    {dataAtual.toLocaleDateString()}
                    <CalendarCheck size={14} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setEditarServico(s);
                      setModalServico(true);
                    }}
                    className="bg-blue-600 px-2 py-1 rounded w-fit"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => excluirServico(s.id)}
                    className="bg-red-600 px-2 py-1 rounded w-fit"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sanfona de Despesas e Créditos */}
      <div
        onClick={() => setMostrarDespesas(!mostrarDespesas)}
        className="mt-2 bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-all duration-200"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-sm">
              {mostrarDespesas ? "▲ Despesas e Créditos" : "▼ Despesas e Créditos"}
            </p>
            <p className="text-xs text-gray-400">
              {despesas.length} registro{despesas.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="text-right">
            <p className="text-red-400 text-sm font-bold">
              <span className="text-gray-400">Despesas - </span> R$ {totalDespesas.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-orange-500 text-sm font-bold">
              <span className="text-gray-400">Crédito - </span> R$ {totalCreditos.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      </div>

      {/* Lista Despesas Expandida */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          mostrarDespesas ? "max-h-screen mt-2" : "max-h-0"
        }`}
      >
        <div className="max-h-[calc(100vh-420px)] overflow-y-auto pb-20">
          {(despesas || []).map((d) => {
            const isCredito = d.categoria === "Crédito" || d.tipo === "Crédito";

            return (
              <div
                key={d.id}
                className="text-sm border-b border-gray-700 py-2 text-gray-300 flex justify-between items-center"
              >
                <div>
                  <div className="text-xs text-gray-500">
                    {new Date(d.data + "T00:00:00").toLocaleDateString()}
                  </div>
                  <div className="font-medium">
                    {d.tipo}
                    {d.descricao && ` - ${d.descricao}`}
                  </div>
                  <div className="text-red-400">
                    R$ {Number(d.valor || 0).toFixed(2).replace(".", ",")}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isCredito && (
                    <button
                      onClick={() => {
                        setEditarDespesa(d);
                        setModalDespesa(true);
                      }}
                      className="text-xs bg-blue-600 px-2 py-1 rounded z-[9999]"
                    >
                      <Pencil size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => excluirDespesa(d.id)}
                    className="text-xs bg-red-600 px-2 py-1 rounded z-[9999]"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modais */}
      {modalServico && (
        <ModalServico
          onClose={() => setModalServico(false)}
          onSave={salvarServico}
          dados={editarServico}
        />
      )}

      {modalDespesa && (
        <ModalDespesa
          onClose={() => setModalDespesa(false)}
          onSave={salvarDespesa}
          dados={editarDespesa}
        />
      )}

      {modalCredito && (
        <ModalCredito
          onClose={() => setModalCredito(false)}
          onSave={salvarCredito}
        />
      )}
    </div>
  );
}