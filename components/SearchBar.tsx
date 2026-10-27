"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [termo, setTermo] = useState("");

  function pesquisar(e: React.FormEvent) {
    e.preventDefault();
    const q = termo.trim();
    router.push(q ? `/produtos?q=${encodeURIComponent(q)}` : "/produtos");
  }

  return (
    <form onSubmit={pesquisar} className="mt-5 flex gap-2">
      <input
        type="text"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Pesquisar produto ou referência…"
        className="flex-1 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
      />
      <button
        type="submit"
        className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
      >
        Pesquisar
      </button>
    </form>
  );
}
