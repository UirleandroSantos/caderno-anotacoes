import { useState } from "react";

export default function ModalDespesaAdmin({ onClose, onSave, dados }) {
  const [descricao, setDescricao] = useState(dados?.descricao || "");
  const [tipo, setTipo] = useState(dados?.tipo || "");
  const [valor, setValor] = useState(dados?.valor || "");
  const [data, setData] = useState(
    dados?.data || new Date().toISOString().split("T")[0]
  );

  function handleSubmit() {
    if (!descricao || !valor || !data) {
      return alert("Preencha os campos obrigatórios");
    }

    onSave({
      descricao,
      tipo,
      valor: Number(valor),
      data,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      
      <div className="bg-gray-900 p-4 rounded w-full max-w-sm border border-gray-700">
        
        {/* TÍTULO */}
        <h2 className="text-lg font-bold mb-4 text-white">
          {dados ? "Editar Despesa Administrativa" : "Nova Despesa Administrativa"}
        </h2>

        {/* DESCRIÇÃO */}
        <input
          placeholder="Descrição"
          className="bg-gray-800 border border-gray-700 p-2 w-full rounded mb-2 text-white"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        {/* TIPO */}
        <input
          placeholder="Tipo (Ex: Aluguel, Internet...)"
          className="bg-gray-800 border border-gray-700 p-2 w-full rounded mb-2 text-white"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        />

        {/* VALOR */}
        <input
          type="number"
          placeholder="Valor"
          className="bg-gray-800 border border-gray-700 p-2 w-full rounded mb-2 text-white"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        {/* DATA */}
        <input
          type="date"
          className="bg-gray-800 border border-gray-700 p-2 w-full rounded mb-4 text-white"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        {/* BOTÕES */}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 flex-1 p-2 rounded font-medium"
          >
            Salvar
          </button>

          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 flex-1 p-2 rounded font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}