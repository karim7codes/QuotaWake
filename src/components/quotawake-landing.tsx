"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Anchor, ArrowRight, Fish, Radio, Waves } from "lucide-react";
import { appSpec } from "@/lib/domain-spec";
import { contractAddress } from "@/lib/deployment";

export function QuotaWakeLanding() {
  const [bearing, setBearing] = useState(42);

  return (
    <main className="qw-landing" data-landing="quota-nautical-wake-chart" data-palette="16-quotawake-colorhunt-combination">
      <header className="qw-chartbar">
        <a className="qw-brand" href="./"><span>QW</span><b>QuotaWake</b></a>
        <ConnectButton showBalance={false}/>
      </header>

      <section className="qw-chart">
        <div className="qw-coordinates" aria-hidden="true" />
        <svg className="qw-wake" style={{ transform: `rotate(${(bearing - 42) / 10}deg)` }} viewBox="0 0 1200 620" role="img" aria-label="A vessel wake crossing three quota zones">
          <path className="qw-wake-shadow" d="M-50 500 C180 560 260 190 470 300 S760 550 900 260 S1080 120 1260 180"/>
          <path className="qw-wake-line" d="M-50 500 C180 560 260 190 470 300 S760 550 900 260 S1080 120 1260 180"/>
          <circle cx="902" cy="258" r="10"/><circle cx="470" cy="300" r="7"/><circle cx="1110" cy="155" r="7"/>
        </svg>
        <div className="qw-zone qw-zone-a"><span>ZONE 01</span><b>SEASON POLICY</b></div>
        <div className="qw-zone qw-zone-b"><span>ZONE 02</span><b>PASSAGE LOG</b></div>
        <div className="qw-zone qw-zone-c"><span>ZONE 03</span><b>LANDING DEBIT</b></div>
        <article className="qw-copy">
          <p><Fish size={17}/> {appSpec.kicker}</p>
          <h1>Every catch<br/>leaves a wake.</h1>
          <span>{appSpec.description}</span>
        </article>
        <aside className="qw-helm" aria-label="Wake bearing preview">
          <label htmlFor="wake-bearing"><span>WAKE BEARING</span><output>{bearing}°</output></label>
          <input id="wake-bearing" type="range" min="12" max="78" value={bearing} onChange={(event) => setBearing(Number(event.target.value))}/>
          <div><button type="button" onClick={() => setBearing(24)}>COAST</button><button type="button" onClick={() => setBearing(64)}>OFFSHORE</button></div>
          <a className="qw-launch" href="./app/"><Anchor size={18}/><span><small>LIVE TIDEFIELD</small><b>Launch voyage desk</b></span><ArrowRight size={18}/></a>
        </aside>
        <aside className="qw-beacon"><Radio size={16}/><span>LEDGER BEACON</span><b>{contractAddress.slice(0,8)}...{contractAddress.slice(-6)}</b></aside>
      </section>

      <aside className="qw-method" id="wake">
        <header><Waves size={28}/><div><span>PUBLIC QUOTA CURRENT</span><h2>Season to vessel to landing.</h2></div></header>
        <table>
          <thead><tr><th>Leg</th><th>Chart mark</th><th>Public record</th><th>Terminal</th></tr></thead>
          <tbody>{appSpec.steps.map(([number,title,copy], index) => <tr key={number}><td>{String(index+1).padStart(2,"0")}</td><td><b>{number}</b></td><td><h3>{title}</h3><p>{copy}</p></td><td>{index===2?<Anchor size={20}/>:"OPEN"}</td></tr>)}</tbody>
        </table>
      </aside>
    </main>
  );
}
