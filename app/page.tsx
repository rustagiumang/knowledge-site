"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// 👇 ADD IT HERE
type Entity = {
  id: string;
  name: string;
  type: string;
};

export default function Home() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [entities, setEntities] = useState<Entity[]>([]);

  const addEntity = async () => {
    await supabase.from("entities").insert([{ name, type }]);
    loadEntities();
  };

  const loadEntities = async () => {
    const { data } = await supabase.from("entities").select("*");
    setEntities(data || []);
  };

  useEffect(() => {
    loadEntities();
  }, []);

  return (
    <div>
      <h1>Knowledge System</h1>

      <input onChange={(e) => setName(e.target.value)} />
      <input onChange={(e) => setType(e.target.value)} />
      <button onClick={addEntity}>Add</button>

      <h2>Entities</h2>
      {entities.map((e) => (
        <div key={e.id}>
          {e.name} ({e.type})
        </div>
      ))}
    </div>
  );
}
