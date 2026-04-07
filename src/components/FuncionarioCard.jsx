import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

import ModalServico from "./ModalServico";
import ModalDespesa from "./ModalDespesa";

export default function FuncionarioCard({ funcionario }) {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const hojeFormatado = hoje.toISOString().split("T")[0];

  const [dataInicio, setDataInicio] = useState(primeiroDia);
  const [dataFim, setDataFim] = useState(hojeFormatado);

  const [servicos, setServicos] = useState([]);
  const [despesas, setDespesas] = useState([]);

  const [modalServico, setModalServico] = useState(false);
  const [modalDespesa, setModalDespesa] = useState(false);

  const [editarServico, setEditarServico] = useState(null);
  const [editarDespesa, setEditarDespesa] = useState(null);

  const [mostrarDespesas, setMostrarDespesas] = useState(false);

  // 🔥 NOVO ESTADO DO MENU DE CRÉDITO
  const [abrirCredito, setAbrirCredito] = useState(false);

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

  const totalServicos = servicos.reduce(
    (a, b) => a + Number(b.valor || 0),
    0
  );

  const totalDespesas = despesas.reduce(
    (a, b) => a + Number(b.valor || 0),
    0
  );

  const quantidadeServicos = servicos.length;

  async function salvarServico(dados) {
    if (editarServico) {
      await supabase
        .from("servicos")
        .update(dados)
        .eq("id", editarServico.id);
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
      await supabase
        .from("despesas_funcionario")
        .update(dados)
        .eq("id", editarDespesa.id);
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

  async function arquivar() {
    if (!window.confirm("Arquivar somente esse período?")) return;

    await supabase.from("registros_arquivados").insert([
      {
        funcionario_id: funcionario.id,
        data_inicio: dataInicio,
        data_fim: dataFim,
        dados: { servicos, despesas },
      },
    ]);

    await supabase
      .from("servicos")
      .delete()
      .eq("funcionario_id", funcionario.id)
      .gte("data", dataInicio)
      .lte("data", dataFim);

    await supabase
      .from("despesas_funcionario")
      .delete()
      .eq("funcionario_id", funcionario.id)
      .gte("data", dataInicio)
      .lte("data", dataFim);

    carregarDados();
  }

  return (
    <div className="min-w-full h-full bg-gray-900 text-white flex flex-col p-4">
      
      <div className="mb-3">
        <h2 className="text-xl font-bold">{funcionario.nome}</h2>
        <p className="text-gray-400 text-sm">Controle financeiro</p>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-2 w-full rounded"
        />
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-2 w-full rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-gray-400 text-sm">Serviços</p>
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
      </div>

      {/* BOTÕES */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => {
            setEditarServico(null);
            setModalServico(true);
          }}
          className="bg-green-600 hover:bg-green-700 flex-1 p-2 rounded"
        >
          + Serviço
        </button>

        {/* 🔥 BOTÃO ALTERADO */}
        <div className="relative flex-1">
          <button
            onClick={() => setAbrirCredito(!abrirCredito)}
            className="bg-red-600 hover:bg-red-700 w-full h-full p-2 rounded flex flex-col items-center justify-center text-xs"
          >
            <span className="text-[15px] opacity-80">+ Despesa / Crédito</span>
          </button>

          {abrirCredito && (
            <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded shadow">
              <button
                onClick={() => {
                  setEditarDespesa(null);
                  setModalDespesa(true);
                  setAbrirCredito(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm"
              >
                Despesa
              </button>

              <button
                onClick={() => {
                  setEditarDespesa(null);
                  setModalDespesa(true);
                  setAbrirCredito(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm"
              >
                Crédito
              </button>
            </div>
          )}
        </div>
      </div>
        <p>Total de serviços  {quantidadeServicos}</p>

      {/* SERVIÇOS */}
      <div className="flex-1 overflow-y-auto pr-1">
        {servicos.map((s) => (
          <div
            key={s.id}
            className="bg-gray-800 p-3 rounded mb-2 text-sm border border-gray-700"
          >
            <div className="font-bold">{s.cliente}</div>
            <div className="text-gray-400">{s.tipo}</div>
            <div className="text-green-400">
              R$ {s.valor.toFixed(2).replace(".", ",")}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(s.data).toLocaleDateString()}
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  setEditarServico(s);
                  setModalServico(true);
                }}
                className="text-xs bg-blue-600 px-2 py-1 rounded"
              >
                Editar
              </button>

              <button
                onClick={() => excluirServico(s.id)}
                className="text-xs bg-red-600 px-2 py-1 rounded"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESPESAS */}
      <button
        onClick={() => setMostrarDespesas(!mostrarDespesas)}
        className="text-xs text-gray-400 mt-2"
      >
        {mostrarDespesas ? "Ocultar despesas" : "Mostrar despesas"}
      </button>

      {mostrarDespesas && (
        <div className="max-h-[120px] overflow-y-auto mt-2">
          {despesas.map((d) => (
            <div
              key={d.id}
              className="text-sm border-b border-gray-700 py-1 text-gray-300 flex justify-between items-center"
            >
              <span>
                {d.tipo} - R$ {d.valor}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditarDespesa(d);
                    setModalDespesa(true);
                  }}
                  className="text-xs bg-blue-600 px-2 py-1 rounded"
                >
                  Editar
                </button>

                <button
                  onClick={() => excluirDespesa(d.id)}
                  className="text-xs bg-red-600 px-2 py-1 rounded"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* <div className="mt-auto pt-3">
        <button
          onClick={arquivar}
          className="bg-gray-700 hover:bg-gray-600 w-full p-2 rounded"
        >
          📦 Arquivar período
        </button>
      </div> */}

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
    </div>
  );
}