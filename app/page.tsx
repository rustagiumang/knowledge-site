"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Entity = {
  id: string;
  name: string;
  type: string;
};

export default function Home() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [entities, setEntities] = useState<Entity[]>([]);

  // Load all entities
  const loadEntities = async () => {
    const { data } = await supabase
      .from("entities")
      .select("*")
      .order("created_at", { ascending: false });

    setEntities(data || []);
  };

  useEffect(() => {
    loadEntities();
  }, []);

  // Add new entity
  const addEntity = async () => {
    if (!name || !type) return;

    await supabase.from("entities").insert([
      {
        name,
        type,
      },
    ]);

    setName("");
    setType("");

    loadEntities(); // refresh list
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "auto" }}>
      <h1>Knowledge System</h1>

      <hr />

      {/* Create Entity */}
      <h2>Create Entity</h2>

      <input
        placeholder="Name (e.g. Elon Musk)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginRight: 10 }}
      />

      <input
        placeholder="Type (e.g. Person, Company)"
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ marginRight: 10 }}
      />

      <button onClick={addEntity}>Add Entity</button>

      <hr />

      {/* Entity List */}
      <h2>Entities</h2>

      {entities.length === 0 && <p>No entities yet</p>}

      {entities.map((e) => (
        <div key={e.id} style={{ marginBottom: 10 }}>
          <Link href={`/entity/${e.id}`}>
            <span style={{ cursor: "pointer", color: "blue" }}>
              {e.name} ({e.type})
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}
