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
  const [search, setSearch] = useState("");

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

  const addEntity = async () => {
    if (!name || !type) return;

    await supabase.from("entities").insert([{ name, type }]);

    setName("");
    setType("");
    loadEntities();
  };

  // 🔍 FILTER
  const filteredEntities = entities.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ padding: 30, maxWidth: 800, margin: "auto" }}>
      <h1>Knowledge System</h1>

      <hr />

      {/* CREATE */}
      <div style={{ marginBottom: 20 }}>
        <h3>Create Entity</h3>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          placeholder="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={addEntity}>Add</button>
      </div>

      <hr />

      {/* SEARCH */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      {/* LIST */}
      <h2>Entities</h2>

      {filteredEntities.map((e) => (
        <div
          key={e.id}
          style={{
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <Link href={`/entity/${e.id}`}>
            <strong>{e.name}</strong>
          </Link>
          <div style={{ color: "gray" }}>{e.type}</div>
        </div>
      ))}
    </div>
  );
}
