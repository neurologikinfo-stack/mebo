"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";

export default function BusinessesTab() {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, slug, phone, email, description, created_at");
      if (!error) setBusinesses(data);
    })();
  }, []);

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Negocios</h2>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((b) => (
          <li
            key={b.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <h3 className="font-semibold text-gray-800">{b.name}</h3>
            <p className="text-xs text-gray-500">@{b.slug}</p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {b.description}
            </p>
            <div className="mt-3 text-xs text-gray-500">
              {b.phone && <p>📞 {b.phone}</p>}
              {b.email && <p>✉️ {b.email}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/business/${b.slug}`}
                className="rounded bg-black text-white text-sm px-3 py-1 hover:bg-gray-800"
              >
                Abrir
              </Link>
              <Link
                href={`/dashboard/admin/businesses/${b.id}/edit`}
                className="rounded border text-sm px-3 py-1 hover:bg-gray-50"
              >
                Editar
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
