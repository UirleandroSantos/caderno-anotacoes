import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function RegistrosArquivados({ voltar }) {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await supabase
      .from("registros_arquivados")
      .select("*")
      .order("created_at", { ascending: false });

    setRegistros(data || []);
  }

  return (
    <div className="p-4">
      <button onClick={voltar} className="mb-4 bg-gray-300 px-3 py-1">
        ← Voltar
      </button>

      <h1 className="text-xl mb-4">Registros Arquivados</h1>

      {registros.map((r) => (
        <div key={r.id} className="border p-3 mb-3">
          <div className="font-bold mb-2">
            Funcionário ID: {r.funcionario_id}
          </div>

          <div className="text-sm text-gray-500">
            {r.data_inicio} até {r.data_fim}
          </div>

          <div className="mt-2">
            <b>Serviços:</b>
            {r.dados?.servicos?.map((s, i) => (
              <div key={i}>{s.cliente} - R$ {s.valor}</div>
            ))}
          </div>

          <div className="mt-2">
            <b>Despesas:</b>
            {r.dados?.despesas?.map((d, i) => (
              <div key={i}>{d.tipo} - R$ {d.valor}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}