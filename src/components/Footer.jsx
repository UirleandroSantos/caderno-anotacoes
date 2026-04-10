import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full mt-10 border-t border-slate-700 bg-slate-900/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Contatos */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-400">

          <div className="flex items-center gap-2">
            <Mail size={16} />
            <a href="mailto:uirleandro.santos.19@gmail.com">uirleandro.santos.19@gmail.com</a>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="text-gray-400"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.84 10.91.57.1.78-.25.78-.55v-2.02c-3.19.69-3.87-1.38-3.87-1.38-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.74 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.52-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.73.8 1.18 1.82 1.18 3.07 0 4.4-2.68 5.36-5.24 5.65.41.36.77 1.08.77 2.18v3.23c0 .3.21.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
              </svg>    
          </div>
            <a href="https://github.com/UirleandroSantos" target="_blank">GitHub</a>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="text-gray-400"
              >
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4v12h-4V8zm7.5 0h3.8v1.64h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.75 2.63 4.75 6.05V20h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.97V20h-4V8z"/>
              </svg>
              <div>
                <a href="www.linkedin.com/in/uirleandro-santos-developer" target="_blank">LinkedIn</a>
              </div>
            </div>
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