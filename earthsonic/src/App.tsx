import "./App.css";
import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Contrast,
  Eye,
  FileText,
  Globe2,
  Headphones,
  Image as ImageIcon,
  Keyboard,
  Menu,
  Music,
  Play,
  Radio,
  Sliders,
  Sparkles,
  Volume2,
  Waves,
  X,
  Zap,
} from "lucide-react";

// REAL_RECORDS contains the slugs of records with verified real NASA frames in public/frames/
// UPDATE THIS ARRAY whenever you add real frames for another record!
const REAL_RECORDS = ["night-lights"];

const records = [
  {
    id: "01",
    slug: "night-lights",
    title: "Night Lights",
    category: "HUMAN ACTIVITY",
    description: "Listen to the pulse of our growing cities.",
    visualization: "Change in Night Lights between 2012 and 2023",
    color: "amber",
    icon: "◉",
  },
  {
    id: "02",
    slug: "lightning-from-the-iss",
    title: "Lightning",
    category: "ATMOSPHERIC EVENTS",
    description: "Experience the electrical energy of our skies.",
    visualization: "Lightning Events Detected from the ISS 2017–2023",
    color: "blue",
    icon: "ϟ",
  },
  {
    id: "03",
    slug: "geos-aerosols",
    title: "Aerosols",
    category: "ATMOSPHERIC SCIENCE",
    description: "Hear invisible particles moving through our air.",
    visualization: "GEOS Aerosols Atmospheric Composition Simulation",
    color: "violet",
    icon: "✳",
  },
  {
    id: "04",
    slug: "ocean-currents",
    title: "Ocean Currents",
    category: "OCEAN SCIENCE",
    description: "Discover the rhythm of our moving oceans.",
    visualization: "Perpetual Ocean 2: Western Boundary Currents",
    color: "cyan",
    icon: "≈",
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState("01");
  const [studioOpen, setStudioOpen] = useState(false);
  const [failedAudio, setFailedAudio] = useState<Record<string, boolean>>({});

  const selected = records.find(
    (record) => record.id === selectedRecord
  )!;

  const studioUrl = `${import.meta.env.BASE_URL}studio.html#${Number(selected.id)}`;

  const handleAudioError = (slug: string) => {
    setFailedAudio((prev) => ({ ...prev, [slug]: true }));
  };

  const visiblePlaylist = records.filter((r) => !failedAudio[r.slug]);
  const showPlaylist = visiblePlaylist.length > 0;

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
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#accessibility" onClick={() => setMenuOpen(false)}>Accessibility</a>
          {showPlaylist && <a href="#playlist" onClick={() => setMenuOpen(false)}>Playlist</a>}
          <a href="#credits" onClick={() => setMenuOpen(false)}>Data &amp; Credits</a>
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

            <a
              href={`${import.meta.env.BASE_URL}studio.html?tour=1#1`}
              className="secondary-button tour-link"
            >
              Watch the guided tour <ArrowRight size={15} />
            </a>

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
              className={`record-card ${record.color} ${selectedRecord === record.id ? "selected" : ""
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

      {/* A) How It Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><span className="live-dot" /> DATA SONIFICATION PIPELINE</div>
            <h2>HOW IT <span>WORKS.</span></h2>
            <p>From orbital observation frames to live synthesized audio in your browser.</p>
          </div>
        </div>

        <div className="pipeline-steps">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon"><ImageIcon size={28} /></div>
            <h3>NASA Frame</h3>
            <p>High-resolution frames from NASA Scientific Visualization Studio and Earth Information Center.</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon"><Sliders size={28} /></div>
            <h3>Scan-Line Analysis</h3>
            <p>A glowing scan-line reads pixel brightness, chromatic hue, coordinates, and frame difference.</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon"><Music size={28} /></div>
            <h3>Harmonic Mapping</h3>
            <p>Visual values are harmonically snapped to a pure D minor pentatonic scale (D3 to C6).</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-num">04</div>
            <div className="step-icon"><Headphones size={28} /></div>
            <h3>Live Browser Sound</h3>
            <p>Tone.js synthesizers generate dynamic, multi-timbral polyphonic audio client-side in real time.</p>
          </div>
        </div>

        <div
          className="mapping-table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Sonification mapping table, scrollable"
        >
          <h3>Sonification Mapping Parameters</h3>
          <table className="mapping-table">
            <thead>
              <tr>
                <th>Visual Feature</th>
                <th>Physical Meaning</th>
                <th>Synthesizer Parameter</th>
                <th>Musical Experience</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Brightness</strong></td>
                <td>Light / energy intensity</td>
                <td>Note pitch (D minor scale)</td>
                <td>Brighter regions sound higher; darkness stays quiet</td>
              </tr>
              <tr>
                <td><strong>Color / Hue</strong></td>
                <td>Aerosol type / water warmth</td>
                <td>Instrument timbre (saw, sine, flute)</td>
                <td>Unique instrumental voice per particle or warmth layer</td>
              </tr>
              <tr>
                <td><strong>X Position</strong></td>
                <td>Orbital longitude</td>
                <td>Stereo panning (-1.0 to +1.0)</td>
                <td>Sound moves across stereo field following the scan-line</td>
              </tr>
              <tr>
                <td><strong>Frame Change</strong></td>
                <td>Dynamic evolution rate</td>
                <td>Urgency, filter sweep &amp; tempo</td>
                <td>Faster climate changes create brighter, busier soundscapes</td>
              </tr>
              <tr>
                <td><strong>Sudden Flash</strong></td>
                <td>Orbital lightning transient</td>
                <td>Sub-bass kick &amp; noise percussion</td>
                <td>Immediate rhythmic percussion pulse for detected flash strikes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* B) Built For Everyone (Accessibility) Section */}
      <section className="a11y-section" id="accessibility">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><span className="live-dot" /> INCLUSIVE BY DESIGN</div>
            <h2>BUILT FOR <span>EVERYONE.</span></h2>
            <p>Engineered for full accessibility, multimodal comprehension, and diverse sensory needs.</p>
          </div>
        </div>

        <div className="a11y-grid">
          <div className="a11y-card">
            <div className="a11y-icon"><Keyboard size={24} /></div>
            <h3>Full Keyboard Control</h3>
            <p>Complete control via standard keys: Space for play/pause, Left/Right arrows for records, M for mute, and Up/Down for volume.</p>
          </div>

          <div className="a11y-card">
            <div className="a11y-icon"><Eye size={24} /></div>
            <h3>Screen-Reader Live Region</h3>
            <p>ARIA-live polite announcements describe phenomenon statistics, detected flash events, and active column updates in real time.</p>
          </div>

          <div className="a11y-card">
            <div className="a11y-icon"><Volume2 size={24} /></div>
            <h3>Spoken Audio Description</h3>
            <p>Integrated browser Web Speech API vocalizes planetary shifts, lighting changes, and aerosol densities aloud as they unfold.</p>
          </div>

          <div className="a11y-card">
            <div className="a11y-icon"><Contrast size={24} /></div>
            <h3>High Contrast Mode</h3>
            <p>Dedicated high-contrast toggle enforces pure black backgrounds with vibrant cyan, amber, and white with strong contrast.</p>
          </div>

          <div className="a11y-card">
            <div className="a11y-icon"><Zap size={24} /></div>
            <h3>Reduced Motion Support</h3>
            <p>Automatic OS preference detection plus manual toggle eliminates vinyl spin, canvas oscillations, and rapid transitions for vestibular safety.</p>
          </div>

          <div className="a11y-card">
            <div className="a11y-icon"><FileText size={24} /></div>
            <h3>Plain-Text "Explain This Sound"</h3>
            <p>Clear pedagogical breakdowns document exactly what the algorithm sees, which feature is extracted, and why each timbre is played.</p>
          </div>
        </div>
      </section>

      {/* C) Playlist Section (Hidden if all fail) */}
      {showPlaylist && (
        <section className="playlist-section" id="playlist">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="live-dot" /> OFFLINE PREVIEWS</div>
              <h2>THE AUDIO <span>PLAYLIST.</span></h2>
              <p>Listen directly to 30-second studio recordings exported from our live sonification engine.</p>
            </div>
          </div>

          <div className="playlist-grid">
            {records.map((r) => {
              if (failedAudio[r.slug]) return null;
              return (
                <div key={r.slug} className={`playlist-card ${r.color}`}>
                  <div className="playlist-top">
                    <span className="playlist-category">{r.category}</span>
                    <span className="playlist-badge">
                      {REAL_RECORDS.includes(r.slug) ? "NASA DATA" : "DEMO"}
                    </span>
                  </div>
                  <h3>{r.title}</h3>
                  <p>{r.description}</p>
                  <div className="audio-wrap">
                    <audio
                      controls
                      preload="none"
                      src={`${import.meta.env.BASE_URL}audio/${r.slug}.webm`}
                      aria-label={`Listen to 30-second preview of ${r.title}`}
                      onError={() => handleAudioError(r.slug)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* D) Data and Credits Section */}
      <section className="credits-section" id="credits">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><span className="live-dot" /> SCIENTIFIC ATTRIBUTION</div>
            <h2>DATA &amp; <span>CREDITS.</span></h2>
            <p>Earth observations and atmospheric visualizations powering the EarthSonic experience.</p>
          </div>
        </div>

        <div className="credits-grid">
          {records.map((r) => (
            <div key={r.slug} className="credit-card">
              <div className="credit-top">
                <span className="credit-title">{r.title}</span>
                <span className={`credit-badge ${REAL_RECORDS.includes(r.slug) ? "real" : "demo"}`}>
                  {REAL_RECORDS.includes(r.slug) ? "Real NASA frames" : "Demo frames"}
                </span>
              </div>
              <h4>{r.visualization}</h4>
              <p className="credit-meta">
                Source: NASA Earth Information Center / Scientific Visualization Studio
              </p>
            </div>
          ))}
        </div>

        <div className="credits-notice">
          <p>
            Visualizations: NASA's Scientific Visualization Studio / Earth Information Center.
            This project is not endorsed by NASA.
          </p>
          <p className="sub-notice">
            Records without real frames use clearly labelled synthetic demonstration frames.
            Brightness, hue, and optical differences serve as visual proxies for environmental quantities.
          </p>
        </div>
      </section>

      <footer className="footer">
        <a className="brand" href="#">
          <span className="brand-icon"><AudioLines size={18} /></span>
          EARTH<span className="brand-light">SONIC</span>
        </a>
        <span>HEAR THE PLANET CHANGE.</span>
        <span>AN INDEPENDENT NASA SPACE APPS PROJECT · 2026</span>
        <p className="credit">
          Visualizations: NASA Earth Information Center / Scientific Visualization Studio.
          This project is not endorsed by NASA.
        </p>
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
              <a className="primary-button launch" href={studioUrl}>
                <Play size={17} fill="currentColor" />
                Launch {selected.title}
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
