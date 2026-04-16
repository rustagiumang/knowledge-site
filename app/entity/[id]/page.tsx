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
  const params = useParams(); // ✅ FIX
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

  // ADD
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

  // EDIT
  const startEdit = (fact: Fact) => {
    setEditingFactId(fact.id);
    setEditValue(fact.value);
  };

  const saveEdit = async (fact: Fact) => {
    if (!editValue) return;

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

  // DELETE
  const deleteFact = async (fact: Fact) => {
    const confirmDelete = confirm("Delete this fact?");
    if (!confirmDelete) return;

    await supabase.from("facts").delete().eq("id", fact.id);

    loadData();
  };

  if (!entity) return <div>Loading...</div>;

  // GROUP
  const groupedFacts: Record<string, Fact[]> = {};
  facts.forEach((fact) => {
    if (!groupedFacts[fact.attribute]) {
      groupedFacts[fact.attribute] = [];
    }
    groupedFacts[fact.attribute].push(fact);
  });

  return (
    <div style={{ padding: 30, maxWidth: 800, margin: "auto" }}>
      <h1>{entity.name}</h1>
      <p style={{ color: "gray" }}>{entity.type}</p>

      <hr />

      {/* ADD */}
      <h3>Add Fact</h3>
      <input
        placeholder="Attribute"
        value={attribute}
        onChange={(e) => setAttribute(e.target.value)}
      />
      <input
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={addFact}>Add</button>

      <hr />

      <h2>Timeline</h2>

      {Object.entries(groupedFacts).map(([attr, attrFacts]) => (
        <div key={attr} style={{ marginBottom: 20 }}>
          <h3>{attr}</h3>

          {attrFacts.map((f) => (
            <div
              key={f.id}
              style={{
                border: "1px solid #ddd",
                padding: 10,
                marginBottom: 10,
                opacity: f.is_current ? 1 : 0.5,
              }}
            >
              <div style={{ fontSize: 12, color: "gray" }}>
                {new Date(f.valid_from).toLocaleDateString()}
              </div>

              {editingFactId === f.id ? (
                <>
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                  <button onClick={() => saveEdit(f)}>Save</button>
                </>
              ) : (
                <>
                  <strong>{f.value}</strong>

                  {f.is_current && (
                    <>
                      <button
                        onClick={() => startEdit(f)}
                        style={{ marginLeft: 10 }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteFact(f)}
                        style={{ marginLeft: 10, color: "red" }}
                      >
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
  );
}
