"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function EntityPage() {
  const params = useParams();
  const id = params.id as string;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);

  const [attribute, setAttribute] = useState("");
  const [value, setValue] = useState("");

  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const loadData = async () => {
    if (!id) return;

    const { data: entityData } = await supabase
      .from("entities")
      .select("*")
      .eq("id", id)
      .single();

    const { data: factsData } = await supabase
      .from("facts")
      .select("*")
      .eq("entity_id", id)
      .order("valid_from", { ascending: true });

    setEntity(entityData);
    setFacts(factsData || []);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const addFact = async () => {
    if (!attribute || !value) return;

    await supabase
      .from("facts")
      .update({ is_current: false })
      .eq("entity_id", id)
      .eq("attribute", attribute)
      .eq("is_current", true);

    await supabase.from("facts").insert([
      {
        entity_id: id,
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

  const startEdit = (fact: Fact) => {
    setEditingFactId(fact.id);
    setEditValue(fact.value);
  };

  const saveEdit = async (fact: Fact) => {
    await supabase
      .from("facts")
      .update({ is_current: false })
      .eq("id", fact.id);

    await supabase.from("facts").insert([
      {
        entity_id: id,
        attribute: fact.attribute,
        value: editValue,
        valid_from: new Date(),
        is_current: true,
      },
    ]);

    setEditingFactId(null);
    setEditValue("");
    loadData();
  };

  const deleteFact = async (fact: Fact) => {
    await supabase.from("facts").delete().eq("id", fact.id);
    loadData();
  };

  if (!entity) return <div style={{ padding: 40 }}>Loading...</div>;

  const grouped: Record<string, Fact[]> = {};
  facts.forEach((f) => {
    if (!grouped[f.attribute]) grouped[f.attribute] = [];
    grouped[f.attribute].push(f);
  });

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
        <h1 style={{ fontSize: 32 }}>{entity.name}</h1>
        <p style={{ color: "#94a3b8" }}>{entity.type}</p>

        {/* ADD FACT */}
        <div style={cardStyle}>
          <h3>Add Fact</h3>
          <input
            placeholder="Attribute"
            value={attribute}
            onChange={(e) => setAttribute(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={inputStyle}
          />
          <button style={buttonStyle} onClick={addFact}>
            Add
          </button>
        </div>

        {/* TIMELINE */}
        {Object.entries(grouped).map(([attr, list]) => (
          <div key={attr} style={{ marginTop: 30 }}>
            <h3>{attr}</h3>

            {list.map((f) => (
              <div key={f.id} style={cardStyle}>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  {new Date(f.valid_from).toLocaleDateString()}
                </div>

                {editingFactId === f.id ? (
                  <>
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={inputStyle}
                    />
                    <button onClick={() => saveEdit(f)} style={buttonStyle}>
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <strong>{f.value}</strong>

                    {f.is_current && (
                      <>
                        <button onClick={() => startEdit(f)} style={smallBtn}>
                          Edit
                        </button>
                        <button onClick={() => deleteFact(f)} style={dangerBtn}>
                          Delete
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
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
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  background: "#3b82f6",
  color: "white",
  cursor: "pointer",
};

const smallBtn = {
  marginLeft: 10,
  background: "#334155",
  border: "none",
  padding: "5px 10px",
  borderRadius: 6,
  color: "white",
};

const dangerBtn = {
  marginLeft: 10,
  background: "#ef4444",
  border: "none",
  padding: "5px 10px",
  borderRadius: 6,
  color: "white",
};

const cardStyle = {
  background: "#1e293b",
  padding: 15,
  borderRadius: 10,
  marginTop: 10,
};
