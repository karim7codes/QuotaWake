"use client";

import { useMemo, useState } from "react";
import { readActions, writeActions, type FieldSpec, type ReadAction, type WriteAction } from "@/lib/domain-spec";
import { readContract, useLiveWrite } from "@/lib/live-contract";

export function castField(field: FieldSpec, value: string) {
  if (field.type === "u256") return BigInt(value || "0");
  if (field.type === "bool") return value === "true";
  return value;
}

export function useDomainRuntime() {
  const writes = writeActions as readonly WriteAction[];
  const reads = readActions as readonly ReadAction[];
  const [activeWrite, setActiveWrite] = useState<string>(writes[0].name);
  const [writeValues, setWriteValues] = useState<Record<string, string>>({});
  const [activeRead, setActiveRead] = useState<string>(reads[0].name);
  const [readValues, setReadValues] = useState<Record<string, string>>({});
  const [readState, setReadState] = useState<{ loading: boolean; data?: unknown; error?: string }>({ loading: false });
  const writer = useLiveWrite();
  const writeAction = useMemo(() => writes.find((item) => item.name === activeWrite) ?? writes[0], [activeWrite, writes]);
  const readAction = useMemo(() => reads.find((item) => item.name === activeRead) ?? reads[0], [activeRead, reads]);

  function chooseWrite(name: string) { setActiveWrite(name); setWriteValues({}); }
  function chooseRead(name: string) { setActiveRead(name); setReadValues({}); setReadState({ loading: false }); }
  function setWriteField(name: string, value: string) { setWriteValues((current) => ({ ...current, [name]: value })); }
  function setReadField(name: string, value: string) { setReadValues((current) => ({ ...current, [name]: value })); }

  async function submitWrite(event: React.FormEvent) {
    event.preventDefault();
    await writer.write(writeAction.name, writeAction.fields.map((field) => castField(field, writeValues[field.name] ?? "")));
    setWriteValues({});
  }

  async function inspect(event: React.FormEvent) {
    event.preventDefault();
    setReadState({ loading: true });
    try {
      const data = await readContract(readAction.name, readAction.fields.map((field) => castField(field, readValues[field.name] ?? "")));
      setReadState({ loading: false, data });
    } catch (cause) {
      setReadState({ loading: false, error: cause instanceof Error ? cause.message : "Read failed." });
    }
  }

  return { writes, reads, activeWrite, activeRead, writeAction, readAction, writeValues, readValues, readState, chooseWrite, chooseRead, setWriteField, setReadField, submitWrite, inspect, ...writer };
}

export function ContractField({ prefix, field, value, onChange }: { prefix: string; field: FieldSpec; value: string; onChange: (value: string) => void }) {
  if (field.type === "bool") return (
    <label className={`${prefix}-field ${prefix}-toggle`}><span>{field.label}</span><button type="button" role="switch" aria-checked={value === "true"} onClick={() => onChange(value === "true" ? "false" : "true")}><i /><b>{value === "true" ? "Yes" : "No"}</b></button></label>
  );
  const isUrl = field.name.includes("url");
  return (
    <label className={`${prefix}-field`}><span>{field.label}</span><input type={field.type === "u256" ? "number" : isUrl ? "url" : "text"} min={field.type === "u256" ? "0" : undefined} value={value} onChange={(event) => onChange(event.target.value)} placeholder={isUrl ? "https://" : field.type === "u256" ? "0" : field.label} required /></label>
  );
}
