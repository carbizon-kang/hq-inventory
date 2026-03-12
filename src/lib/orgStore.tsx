"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";

export interface OrgUnit {
  id: string;
  type: "부문" | "본부" | "팀";
  name: string;
  parentName: string; // 본부→부문명, 팀→본부명, 부문→""
}

interface OrgContextType {
  orgUnits: OrgUnit[];
  divisions: OrgUnit[];      // type === "부문"
  headquarters: OrgUnit[];   // type === "본부"
  teams: OrgUnit[];          // type === "팀"
  addOrgUnit: (type: OrgUnit["type"], name: string, parentName: string) => Promise<void>;
  deleteOrgUnit: (id: string) => Promise<void>;
  // 연계 필터 헬퍼
  getHQsByDivision: (divisionName: string) => OrgUnit[];
  getTeamsByHQ: (hqName: string) => OrgUnit[];
}

const OrgContext = createContext<OrgContextType | null>(null);

function rowToOrgUnit(r: Record<string, unknown>): OrgUnit {
  return {
    id: r.id as string,
    type: r.type as OrgUnit["type"],
    name: r.name as string,
    parentName: (r.parent_name as string) || "",
  };
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);

  useEffect(() => {
    loadOrgUnits();
    const channel = supabase
      .channel("org-units-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "org_units" }, loadOrgUnits)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadOrgUnits() {
    const { data } = await supabase.from("org_units").select("*").order("type").order("name");
    if (data) setOrgUnits(data.map(rowToOrgUnit));
  }

  async function addOrgUnit(type: OrgUnit["type"], name: string, parentName: string) {
    const id = `org${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
    const { error } = await supabase.from("org_units").insert({ id, type, name, parent_name: parentName });
    if (error) throw new Error(`추가 실패: ${error.message}`);
    await loadOrgUnits();
  }

  async function deleteOrgUnit(id: string) {
    const { error } = await supabase.from("org_units").delete().eq("id", id);
    if (error) throw new Error(`삭제 실패: ${error.message}`);
    await loadOrgUnits();
  }

  const divisions    = orgUnits.filter((o) => o.type === "부문");
  const headquarters = orgUnits.filter((o) => o.type === "본부");
  const teams        = orgUnits.filter((o) => o.type === "팀");

  function getHQsByDivision(divisionName: string) {
    return headquarters.filter((h) => !h.parentName || h.parentName === divisionName);
  }

  function getTeamsByHQ(hqName: string) {
    return teams.filter((t) => !t.parentName || t.parentName === hqName);
  }

  return (
    <OrgContext.Provider value={{ orgUnits, divisions, headquarters, teams, addOrgUnit, deleteOrgUnit, getHQsByDivision, getTeamsByHQ }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg는 OrgProvider 안에서만 사용 가능합니다.");
  return ctx;
}
