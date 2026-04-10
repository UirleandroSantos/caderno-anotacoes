import { Mail, Github, Linkedin, Phone, User } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full mt-10 border-t border-slate-700 bg-slate-900/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Nome */}
        <div className="flex items-center gap-2 text-white font-semibold text-lg mb-4">
          <User size={18} />
          Uirleandro Santos
        </div>

        {/* Contatos */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-400">

          <div className="flex items-center gap-2">
            <Mail size={16} />
            uirleandro.santos.19@gmail.com
          </div>

          <div className="flex items-center gap-2">
            <Github size={16} />
            github.com/UirleandroSantos
          </div>

          <div className="flex items-center gap-2">
            <Linkedin size={16} />
            linkedin.com/in/uirleandro-santos-developer
          </div>

          <div className="flex items-center gap-2">
            <Phone size={16} />
            (82) 98107-1103
          </div>

        </div>

        {/* Rodapé final */}
        <div className="text-xs text-gray-500 mt-6 text-center">
          © {new Date().getFullYear()} Uirleandro Santos. Todos os direitos reservados.
        </div>

      </div>
    </footer>
  );
}