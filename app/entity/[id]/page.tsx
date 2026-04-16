"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Entity = {
  id: string;
  name: string;
  type: string;
};

type Fact = {
  id: string;
  attribute: string;
  value: string;
  valid_from: string;
  is_current: boolean;
};

export default function EntityPage({ params }: any) {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);

  const [attribute, setAttribute] = useState("");
  const [value, setValue] = useState("");

  const loadData = async () => {
    const { data: entityData } = await supabase
      .from("entities")
      .select("*")
      .eq("id", params.id)
      .single();

    const { data: factsData } = await supabase
      .from("facts")
      .select("*")
      .eq("entity_id", params.id)
      .order("valid_from", { ascending: true });

    setEntity(entityData);
    setFacts(factsData || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addFact = async () => {
    if (!attribute || !value) return;

    // make old inactive
    await supabase
      .from("facts")
      .update({ is_current: false })
      .eq("entity_id", params.id)
      .eq("attribute", attribute)
      .eq("is_current", true);

    // insert new
    await supabase.from("facts").insert([
      {
        entity_id: params.id,
        attribute,
        value,
        valid_from: new Date(),
        is_current: true,
      },
    ]);

    setAttribute("");
    setValue("");
    loadData();
  };

  if (!entity) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "auto" }}>
      <h1>{entity.name}</h1>
      <p>Type: {entity.type}</p>

      <hr />

      {/* Add Fact */}
      <h2>Add Fact</h2>
      <input
        placeholder="Attribute (e.g. CEO)"
        value={attribute}
        onChange={(e) => setAttribute(e.target.value)}
      />
      <input
        placeholder="Value (e.g. Elon Musk)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={addFact}>Add Fact</button>

      <hr />

      {/* Timeline */}
      <h2>Timeline</h2>

      <div style={{ position: "relative", paddingLeft: 30 }}>
        {/* vertical line */}
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 0,
            bottom: 0,
            width: 2,
            background: "#ccc",
          }}
        />

        {facts.map((f) => (
          <div
            key={f.id}
            style={{
              position: "relative",
              marginBottom: 30,
              opacity: f.is_current ? 1 : 0.5,
            }}
          >
            {/* dot */}
            <div
              style={{
                position: "absolute",
                left: -2,
                top: 5,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: f.is_current ? "black" : "#999",
              }}
            />

            {/* content */}
            <div style={{ marginLeft: 20 }}>
              <div style={{ fontSize: 12, color: "gray" }}>
                {new Date(f.valid_from).toLocaleDateString()}
              </div>

              <div>
                <strong>{f.attribute}:</strong> {f.value}
                {!f.is_current && <span> (old)</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
