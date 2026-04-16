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

  const filtered = entities.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: 40,
      }}
    >
      <div style={{ maxWidth: 800, margin: "auto" }}>
        <h1 style={{ fontSize: 32, marginBottom: 20 }}>Knowledge System</h1>

        {/* CREATE CARD */}
        <div
          style={{
            background: "#1e293b",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <h3>Create Entity</h3>

          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={inputStyle}
            />

            <button style={buttonStyle} onClick={addEntity}>
              Add
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          placeholder="Search entities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...inputStyle,
            width: "100%",
            marginBottom: 20,
          }}
        />

        {/* LIST */}
        {filtered.map((e) => (
          <Link key={e.id} href={`/entity/${e.id}`}>
            <div style={cardStyle}>
              <div style={{ fontSize: 18 }}>{e.name}</div>
              <div style={{ color: "#94a3b8" }}>{e.type}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// STYLES
const inputStyle = {
  padding: 10,
  marginRight: 10,
  borderRadius: 8,
  border: "none",
  background: "#0f172a",
  color: "white",
};

const buttonStyle = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: "#3b82f6",
  color: "white",
  cursor: "pointer",
};

const cardStyle = {
  background: "#1e293b",
  padding: 15,
  borderRadius: 10,
  marginBottom: 10,
  cursor: "pointer",
};
