import { useState } from "react";

export default function ModalDespesa({ onClose, onSave }) {
  const hoje = new Date().toISOString().split("T")[0];

  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje);

  function salvar() {
    if (!nome || !valor) return alert("Preencha");

    onSave({
      tipo: nome,
      valor,
      data,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-5 rounded-2xl w-[340px] shadow-xl border border-gray-800">

        <h2 className="text-lg font-bold mb-3">Nova Despesa  / Crédito</h2>

        <input
          placeholder="Descrição"
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-2 rounded outline-none focus:border-blue-500"
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          placeholder="Valor"
          inputMode="numeric"
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-2 rounded outline-none focus:border-blue-500"
          onChange={(e) => setValor(e.target.value)}
        />

        <input
          type="date"
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-3 rounded"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={salvar}
            className="bg-red-600 hover:bg-red-700 flex-1 p-2 rounded font-medium"
          >
            Salvar
          </button>

          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 flex-1 p-2 rounded"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}