import { useState } from "react";

export default function ModalDespesa({ onClose, onSave }) {
  const hoje = new Date().toISOString().split("T")[0];

  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje);

  function salvar() {
    if (!tipo || !valor) return alert("Preencha");

    onSave({
      categoria: "Despesa", // 🔥 NOVO
      tipo,
      descricao,
      valor: Number(valor),
      data,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-5 rounded-2xl w-[340px] border border-gray-800">

        <h2 className="text-lg font-bold mb-3">Nova Despesa</h2>

        <input
          placeholder="Tipo (ex: Alimentação, Conta, etc)"
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-2 rounded"
          onChange={(e) => setTipo(e.target.value)}
        />

        <input
          placeholder="Descrição (opcional)"
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-2 rounded"
          onChange={(e) => setDescricao(e.target.value)}
        />

        <input
          placeholder="Valor"
          inputMode="numeric"
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-2 rounded"
          onChange={(e) => setValor(e.target.value)}
        />

        <input
          type="date"
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-3 rounded"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <div className="flex gap-2">
          <button onClick={salvar} className="bg-red-600 flex-1 p-2 rounded">
            Salvar
          </button>

          <button onClick={onClose} className="bg-gray-700 flex-1 p-2 rounded">
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}