"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";

export default function useProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      setLoading(true);
      setError(null);

      try {
        const clerkId = user.id; // Ej: user_32L4NaJd...
        const clerkIdNoPrefix = clerkId.replace(/^user_/, "");

        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone, avatar_url, role, clerk_id")
          .or(`clerk_id.eq.${clerkId},clerk_id.eq.${clerkIdNoPrefix}`)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error("❌ Error cargando perfil:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  return { profile, loading, error };
}
