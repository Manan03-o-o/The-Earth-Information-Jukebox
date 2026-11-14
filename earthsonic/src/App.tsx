
import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Globe2,
  Headphones,
  Menu,
  Play,
  Radio,
  Sparkles,
  Waves,
  X,
} from "lucide-react";
import "./App.css";

const records = [
  {
    id: "01",
    title: "Night Lights",
    category: "HUMAN ACTIVITY",
    description: "Listen to the pulse of our growing cities.",
    color: "amber",
    icon: "◉",
  },
  {
    id: "02",
    title: "Lightning",
    category: "ATMOSPHERIC EVENTS",
    description: "Experience the electrical energy of our skies.",
    color: "blue",
    icon: "ϟ",
  },
  {
    id: "03",
    title: "Aerosols",
    category: "ATMOSPHERIC SCIENCE",
    description: "Hear invisible particles moving through our air.",
    color: "violet",
    icon: "✳",
  },
  {
    id: "04",
    title: "Ocean Currents",
    category: "OCEAN SCIENCE",
    description: "Discover the rhythm of our moving oceans.",
    color: "cyan",
    icon: "≈",
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState("01");
  const [studioOpen, setStudioOpen] = useState(false);

  const selected = records.find(
    (record) => record.id === selectedRecord
  )!;

  return (
    <main className="app-shell">
      <nav className="navbar">
        <a className="brand" href="#">
          <span className="brand-icon">
            <AudioLines size={21} />
          </span>
          <span>EARTH<span className="brand-light">SONIC</span></span>
        </a>

        <div className={`nav-links ${menuOpen ? "mobile-open" : ""}`}>
          <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>
          <a href="#records" onClick={() => setMenuOpen(false)}>Earth Records</a>
          <a href="#science" onClick={() => setMenuOpen(false)}>The Science</a>
        </div>

        <button
          className="nav-cta"
          onClick={() => setStudioOpen(true)}
        >
          Enter Studio <ArrowUpRight size={16} />
        </button>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <section className="hero" id="experience">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="live-dot" />
            NASA SPACE APPS CHALLENGE 2026
          </div>

          <h1>
            HEAR THE
            <br />
            <span>PLANET</span>
            <br />
            CHANGE<span className="period">.</span>
          </h1>

          <p className="hero-description">
            Every pixel tells a story. Every frequency reveals a
            changing world. Experience Earth's science through sound.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={() => setStudioOpen(true)}
            >
              <Play size={17} fill="currentColor" />
              Enter Earth Jukebox
              <ArrowUpRight size={17} />
            </button>

            <a href="#science" className="secondary-button">
              Discover the science <ArrowDown size={15} />
            </a>
          </div>

          <div className="hero-footnote">
            <span><Radio size={15} /> REAL-TIME SONIFICATION</span>
            <span><Globe2 size={15} /> EARTH DATA, REIMAGINED</span>
          </div>
        </div>

        <div className="earth-stage">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />

          <div className="earth-glow" />

          <div className="earth">
            <div className="earth-texture" />
            <div className="earth-atmosphere" />
          </div>

          <div className="earth-scan" />

          <div className="orbit-point point-one" />
          <div className="orbit-point point-two" />
          <div className="orbit-point point-three" />

          <div className="earth-label label-top">
            <span className="label-line" />
            <span>OUR PLANET</span>
            <strong>001 / EARTH</strong>
          </div>

          <div className="earth-label label-bottom">
            <AudioLines size={16} />
            <span>LISTEN TO THE UNSEEN</span>
          </div>

          <div className="frequency">
            <span>FREQUENCY</span>
            <div className="frequency-bars">
              {Array.from({ length: 28 }).map((_, i) => (
                <i key={i} style={{
                  height: `${12 + Math.abs(Math.sin(i * 0.7)) * 36}px`,
                  animationDelay: `${i * 0.035}s`
                }} />
              ))}
            </div>
            <span>EARTH SIGNAL / LIVE VISUALIZATION</span>
          </div>
        </div>

        <div className="hero-index">
          <span>01</span>
          <span className="index-line" />
          <span>04</span>
        </div>
      </section>

      <section className="records-section" id="records">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><span className="live-dot" /> THE EARTH COLLECTION</div>
            <h2>FOUR STORIES. <span>ONE PLANET.</span></h2>
            <p>Choose an Earth phenomenon. Discover its unique sound.</p>
          </div>
          <span className="collection-count">COLLECTION / 004</span>
        </div>

        <div className="record-grid">
          {records.map((record) => (
            <button
              className={`record-card ${record.color} ${
                selectedRecord === record.id ? "selected" : ""
              }`}
              key={record.id}
              onClick={() => {
                setSelectedRecord(record.id);
                setStudioOpen(true);
              }}
            >
              <div className="record-top">
                <span>RECORD {record.id}</span>
                <ArrowUpRight size={18} />
              </div>

              <div className="record-art">
                <div className="record-orbit">
                  <span>{record.icon}</span>
                </div>
                <div className="record-art-number">{record.id}</div>
              </div>

              <div className="record-info">
                <span>{record.category}</span>
                <h3>{record.title}</h3>
                <p>{record.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="science-section" id="science">
        <div className="science-visual">
          <div className="science-circle">
            <Waves size={62} strokeWidth={1} />
            <div className="science-rings" />
          </div>
        </div>

        <div className="science-copy">
          <div className="eyebrow">THE SCIENCE OF SOUND</div>
          <h2>TURNING <span>VISION</span><br />INTO FREQUENCY.</h2>
          <p>
            We analyze Earth visualization frames, extract their visual
            patterns and translate them into musical elements. What was
            once only visible becomes an experience you can hear.
          </p>
          <div className="science-points">
            <span><Sparkles size={16} /> Computer vision</span>
            <span><AudioLines size={16} /> Data sonification</span>
            <span><Headphones size={16} /> Accessible science</span>
          </div>
        </div>
      </section>

      <footer className="footer">
        <a className="brand" href="#">
          <span className="brand-icon"><AudioLines size={18} /></span>
          EARTH<span className="brand-light">SONIC</span>
        </a>
        <span>HEAR THE PLANET CHANGE.</span>
        <span>AN INDEPENDENT NASA SPACE APPS PROJECT · 2026</span>
      </footer>

      {studioOpen && (
        <div className="studio-overlay" role="dialog" aria-modal="true" aria-label="Earth Jukebox preview">
          <div className="studio-modal">
            <button className="modal-close" onClick={() => setStudioOpen(false)} aria-label="Close studio">
              <X />
            </button>
            <div className="eyebrow"><span className="live-dot" /> EARTH JUKEBOX STUDIO</div>
            <h2>SELECT YOUR <span>EARTH.</span></h2>
            <p>Choose a record to begin your listening experience.</p>
            <div className="modal-records">
              {records.map((record) => (
                <button
                  key={record.id}
                  className={`modal-record ${selectedRecord === record.id ? "active" : ""}`}
                  onClick={() => setSelectedRecord(record.id)}
                >
                  <span>{record.id}</span>
                  <strong>{record.title}</strong>
                  <ArrowRight size={17} />
                </button>
              ))}
            </div>
            <div className="selected-message">
              <span>SELECTED RECORD</span>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
              <small>Studio audio engine will be connected in the next development phase.</small>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
