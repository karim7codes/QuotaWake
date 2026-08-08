"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ArrowDown,
  ArrowUpRight,
  AudioWaveform,
  BookOpen,
  CandlestickChart,
  Check,
  CircleDot,
  Clock3,
  ExternalLink,
  KeyRound,
  LoaderCircle,
  Radio,
  Satellite,
  Search,
  Shield,
  TicketCheck,
  WalletCards,
  Waves,
} from "lucide-react";
import { appSpec } from "@/lib/domain-spec";
import { contractAddress, contractExplorerUrl } from "@/lib/deployment";
import { ContractField, useDomainRuntime } from "@/lib/domain-runtime";

export function QuotaWakeTidefield() {
  const desk = useDomainRuntime();
  return (
    <main
      className="tide-site"
      id="top"
      data-landing="full-bleed-quota-tidefield"
      data-palette="16-quotawake-colorhunt-combination"
      data-design-reference={appSpec.reference}
    >
      <header className="tide-nav">
        <a className="tide-brand" href="../">
          <span>QW</span>
          <b>{appSpec.brand}</b>
        </a>
        <div className="tide-wallet">
          <ConnectButton showBalance={false} />
        </div>
      </header>
      <section className="tide-hero">
        <figure className="tide-ocean">
          <div className="tide-media">
            <video src={appSpec.media} autoPlay muted loop playsInline />
            <span className="tide-media-grid" />
          </div>
          <figcaption>
            <Waves size={17} /> Live quota current
          </figcaption>
        </figure>
        <div className="tide-hero-copy">
          <p className="tide-kicker">
            <CircleDot size={14} /> {appSpec.kicker}
          </p>
          <h1>{appSpec.brand}</h1>
          <h2>{appSpec.headline}</h2>
          <p className="tide-lede">{appSpec.description}</p>
          <div className="tide-hero-actions">
            <a href="./">
              {appSpec.primary} <ArrowDown size={16} />
            </a>
            <a href={contractExplorerUrl} target="_blank" rel="noreferrer">
              Verified contract <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <aside className="tide-signal">
          <span>
            <Radio size={14} /> Studionet live
          </span>
          <b>
            {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
          </b>
          <small>Source-verified deployment</small>
        </aside>
        <dl className="tide-buoys">
          <div>
            <dt>Buoy A</dt>
            <dd>Season policy</dd>
          </div>
          <div>
            <dt>Buoy B</dt>
            <dd>Voyage track</dd>
          </div>
          <div>
            <dt>Buoy C</dt>
            <dd>Landing debit</dd>
          </div>
        </dl>
      </section>
      <section className="tide-workflow" id="workflow">
        <header>
          <span>Tidal ledger</span>
          <h2>How QuotaWake works</h2>
        </header>
        <ul className="tide-steps">
          {appSpec.steps.map(([number, title, copy]) => (
            <li key={number}>
              <i>{number}</i>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
              <ArrowDown size={18} />
            </li>
          ))}
        </ul>
        <footer className="tide-stats">
          {appSpec.stats.map(([value, label]) => (
            <span key={label}>
              <b>{value}</b>
              {label}
            </span>
          ))}
        </footer>
      </section>
      <section className="tide-studio" id="studio">
        <header className="tide-studio-head">
          <div>
            <span>Marine station</span>
            <h2>{appSpec.workspace}</h2>
          </div>
          <p>{appSpec.workspaceCopy}</p>
          <a href={contractExplorerUrl}>
            Ledger beacon <ExternalLink size={14} />
          </a>
        </header>
        <div
          className="tide-workarea"
          data-contract-surface="tide-full-bleed-ocean-observatory"
        >
          <aside className="tide-inspector">
            <header>
              <Radio size={18} />
              <span>Sonar reads</span>
            </header>
            <menu className="tide-read-tabs">
              {desk.reads.map((action) => (
                <li key={action.name}>
                  <button
                    className={action.name === desk.activeRead ? "active" : ""}
                    onClick={() => desk.chooseRead(action.name)}
                  >
                    {action.label}
                  </button>
                </li>
              ))}
            </menu>
            <form onSubmit={desk.inspect}>
              {desk.readAction.fields.map((field) => (
                <ContractField
                  key={field.name}
                  prefix="tide"
                  field={field}
                  value={desk.readValues[field.name] ?? ""}
                  onChange={(value) => desk.setReadField(field.name, value)}
                />
              ))}
              <button className="tide-inspect">
                <Search size={16} />
                Ping ledger
              </button>
            </form>
            <div className="tide-result" aria-live="polite">
              {desk.readState.error ? (
                <p className="tide-error">{desk.readState.error}</p>
              ) : desk.readState.data !== undefined ? (
                <pre>{JSON.stringify(desk.readState.data, null, 2)}</pre>
              ) : (
                <p>
                  Select a lens, provide its identifier, and inspect verified
                  on-chain state.
                </p>
              )}
            </div>
          </aside>
          <form className="tide-composer" onSubmit={desk.submitWrite}>
            <header>
              <span>Active maritime entry</span>
              <h3>{desk.writeAction.label}</h3>
              <p>{desk.writeAction.description}</p>
            </header>
            <div className="tide-fields">
              {desk.writeAction.fields.map((field) => (
                <ContractField
                  key={field.name}
                  prefix="tide"
                  field={field}
                  value={desk.writeValues[field.name] ?? ""}
                  onChange={(value) => desk.setWriteField(field.name, value)}
                />
              ))}
            </div>
            <button
              className="tide-sign"
              type="submit"
              disabled={!desk.connected || desk.status.stage === "finalizing"}
            >
              {desk.status.stage === "finalizing" ? (
                <LoaderCircle className="spin" size={17} />
              ) : desk.status.stage === "finalized" ? (
                <Check size={17} />
              ) : (
                <WalletCards size={17} />
              )}{" "}
              {desk.status.stage === "finalizing"
                ? "Awaiting consensus"
                : desk.connected
                  ? "Sign on Studionet"
                  : "Connect wallet to sign"}
            </button>
            {desk.status.error ? (
              <p className="tide-error" role="alert">
                {desk.status.error}
              </p>
            ) : null}
            {desk.status.hash ? (
              <a
                className="tide-tx"
                href={
                  "https://explorer-studio.genlayer.com/transactions/" +
                  desk.status.hash
                }
                target="_blank"
                rel="noreferrer"
              >
                Transaction {desk.status.hash.slice(0, 12)}...{" "}
                <ArrowUpRight size={14} />
              </a>
            ) : null}
            <figure className="tide-track">
              <span />
              <span />
              <span />
              <figcaption>Season / voyage / landing</figcaption>
            </figure>
          </form>
          <nav className="tide-operations">
            {desk.writes.map((action, index) => (
              <button
                key={action.name}
                className={action.name === desk.activeWrite ? "active" : ""}
                onClick={() => desk.chooseWrite(action.name)}
              >
                <i>{String(index + 1).padStart(2, "0")}</i>
                <b>{action.label}</b>
              </button>
            ))}
          </nav>
        </div>
      </section>
      <footer className="tide-footer">
        <div>
          <b>{appSpec.brand}</b>
          <span>Built on GenLayer Studionet</span>
        </div>
        <p>Design direction: {appSpec.reference}</p>
        <a href="../">
          Landing page <ArrowUpRight size={14} />
        </a>
      </footer>
    </main>
  );
}
