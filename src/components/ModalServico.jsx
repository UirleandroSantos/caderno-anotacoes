import { useState } from "react";

export default function ModalServico({ onClose, onSave }) {
  const hoje = new Date().toLocaleDateString("sv-SE");

  const [cliente, setCliente] = useState("");
  const [tipo, setTipo] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje);
  const [obs, setObs] = useState("");

  function salvar() {
    if (!cliente || !valor) return alert("Preencha os campos");

    onSave({
      cliente,
      tipo,
      valor,
      data, // 👈 salva exatamente a data escolhida
      observacoes: obs,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-5 rounded-2xl w-[340px] shadow-xl border border-gray-800">

        <h2 className="text-lg font-bold mb-3">Novo Serviço</h2>

        <input
          placeholder="Cliente/Pet"
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-2 rounded outline-none focus:border-blue-500"
          onChange={(e) => setCliente(e.target.value)}
        />

        <select
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-2 rounded outline-none"
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Tipo</option>
          <option>Banho</option>
          <option>Banho + Tosa Completa</option>
          <option>Banho + Tosa Higiênica</option>
          <option>Outro</option>
        </select>

        <input
          placeholder="Valor"
          inputMode="numeric"
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-2 rounded outline-none focus:border-blue-500"
          onChange={(e) => setValor(e.target.value)}
        />

        <input
          type="date"
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-2 rounded"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <textarea
          placeholder="Observações"
          className="bg-gray-800 border border-gray-700 p-2 w-full mb-3 rounded outline-none resize-none"
          rows={3}
          onChange={(e) => setObs(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={salvar}
            className="bg-green-600 hover:bg-green-700 flex-1 p-2 rounded font-medium"
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