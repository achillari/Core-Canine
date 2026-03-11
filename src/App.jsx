import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  obsidian: "#1A1A1A", charcoal: "#2C2C2C", graphite: "#3D3D3D", steel: "#5A5A5A",
  silver: "#9A9A9A", fog: "#E8E4DC", cream: "#F5F1E8", white: "#FDFCFA",
  gold: "#C9933A", goldLight: "#E8B86D", goldDim: "#8B6520",
  sage: "#4A7C59", sageDim: "#2D4A35", sageLight: "#7AB08A",
  rust: "#B85C38", rustLight: "#E07A5F", sky: "#3A6B8C", skyLight: "#6B9EBF",
};

const GOOGLE_REVIEW_URL = "https://g.page/r/CftsJCiG-FFAEBM/review";

// ─── SESSION TYPES ─────────────────────────────────────────────────────────────
const SESSION_TYPES = [
  { value: "initial-facility",  label: "Initial Session — Facility",  location: "facility", kind: "initial",  duration: 90 },
  { value: "followup-facility", label: "Follow-Up Session — Facility", location: "facility", kind: "followup", duration: 90 },
  { value: "initial-inhome",    label: "Initial Session — In-Home",    location: "in-home",  kind: "initial",  duration: 90 },
  { value: "followup-inhome",   label: "Follow-Up Session — In-Home",  location: "in-home",  kind: "followup", duration: 90 },
];
const getSessionType = val => SESSION_TYPES.find(s => s.value === val) || SESSION_TYPES[0];

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_STAFF = [
  { id: 1, name: "You (Owner)", firstName: "Owner", phone: "555-0001", role: "admin", bio: "Head trainer & owner of Core Canine.", services: ["private", "group"], active: true },
  { id: 2, name: "Jessica R.", firstName: "Jessica", phone: "555-0002", role: "trainer", bio: "Certified positive reinforcement trainer, 6 years experience.", services: ["private", "group"], active: true },
];

const SEED_CLASS_TEMPLATES = [
  { id: 1, name: "Puppy Kindergarten", weeks: 5, maxDogs: 6, price: 175, description: "Foundation skills & socialization for puppies 8–16 weeks.", waitlistEnabled: true },
  { id: 2, name: "Reactive Dog Workshop", weeks: 6, maxDogs: 4, price: 220, description: "Behavior modification for leash-reactive dogs.", waitlistEnabled: true },
  { id: 3, name: "Intermediate Obedience", weeks: 4, maxDogs: 8, price: 150, description: "Real-world reliability for dogs who know the basics.", waitlistEnabled: false },
  { id: 4, name: "Canine Good Citizen Prep", weeks: 4, maxDogs: 6, price: 165, description: "Prepare for the AKC CGC test.", waitlistEnabled: false },
];

const SEED_CLASS_INSTANCES = [
  { id: 1, templateId: 1, instructorId: 1, startDate: "2026-03-26", time: "18:00", duration: 60, enrolledIds: [1, 2], waitlist: [] },
  { id: 2, templateId: 2, instructorId: 2, startDate: "2026-04-05", time: "10:00", duration: 90, enrolledIds: [3], waitlist: [1] },
  { id: 3, templateId: 3, instructorId: 1, startDate: "2026-04-08", time: "17:00", duration: 60, enrolledIds: [1, 3, 4], waitlist: [] },
];

const SEED_CLIENTS = [
  { id: 1, name: "Sarah Mitchell", phone: "555-1001", email: "sarah@email.com", address: "42 Maple St, Springfield, VA 22150", joinDate: "2025-11-01", waiverSigned: true,
    dogs: [{ id: 1, name: "Biscuit", breed: "Golden Retriever", age: 3, sex: "Male", neutered: true, photo: null, notes: "Leash reactive. Great recall off-leash.", birthday: "2022-06-15", docs: [] }] },
  { id: 2, name: "James Lee", phone: "555-1002", email: "jlee@email.com", address: "88 Oak Run Dr, Alexandria, VA 22304", joinDate: "2026-01-15", waiverSigned: true,
    dogs: [{ id: 2, name: "Mochi", breed: "Shiba Inu", age: 1, sex: "Female", neutered: false, photo: null, notes: "Puppy — high energy, short attention span.", birthday: "2025-02-10", docs: [] }] },
  { id: 3, name: "Donna Reyes", phone: "555-1003", email: "donna@email.com", address: "17 Cedar Lane, Burke, VA 22015", joinDate: "2025-08-20", waiverSigned: true,
    dogs: [{ id: 3, name: "Atlas", breed: "German Shepherd", age: 4, sex: "Male", neutered: true, photo: null, notes: "Advanced skills. Competition goals.", birthday: "2021-11-03", docs: [] }] },
  { id: 4, name: "Kevin Park", phone: "555-1004", email: "kevin@email.com", address: "305 Birchwood Ave, Fairfax, VA 22030", joinDate: "2026-02-01", waiverSigned: false,
    dogs: [{ id: 4, name: "Noodle", breed: "Labradoodle", age: 2, sex: "Male", neutered: true, photo: null, notes: "Jumps on guests. Needs impulse control.", birthday: "2023-09-22", docs: [] }] },
];

const SEED_SESSIONS = [
  { id: 1, clientId: 1, trainerId: 1, date: "2026-03-14", time: "10:00", sessionType: "initial-facility",  duration: 90, price: 150, paid: true,  notes: "", status: "confirmed" },
  { id: 2, clientId: 3, trainerId: 2, date: "2026-03-16", time: "14:00", sessionType: "initial-inhome",    duration: 90, price: 175, paid: false, notes: "", status: "confirmed" },
  { id: 3, clientId: 2, trainerId: 1, date: "2026-03-20", time: "11:00", sessionType: "followup-facility", duration: 90, price: 120, paid: true,  notes: "", status: "confirmed" },
  { id: 4, clientId: 4, trainerId: 2, date: "2026-02-28", time: "13:00", sessionType: "followup-inhome",   duration: 90, price: 145, paid: true,  notes: "", status: "completed" },
];

const SEED_HOMEWORK = [
  { id: 1, title: "Leave It", category: "Foundation", content: "Hold a treat in your closed fist. Wait for your dog to stop sniffing/pawing and pull away. The moment they disengage, say 'Yes!' and reward from your OTHER hand. Practice 5 reps, 2x daily.", videoUrl: "" },
  { id: 2, title: "Down", category: "Foundation", content: "Lure your dog's nose down to the floor with a treat. As they fold into a down, say 'Down' and reward on the floor. Keep sessions short — 5 reps max. Release with 'Free!' before the next rep.", videoUrl: "" },
  { id: 3, title: "Place", category: "Duration", content: "Lead your dog onto their place (bed/mat). Say 'Place' as all 4 paws land. Build duration by counting 5 seconds, then 10, then 15 before releasing. Never release from a broken stay.", videoUrl: "" },
  { id: 4, title: "Loose Leash Walking", category: "Leash Skills", content: "Start with your dog sitting at your left side. Walk forward — the moment the leash tightens, STOP. Wait for slack, then continue. Reward frequently when the leash is loose. Aim for 20 steps loose before taking a break.", videoUrl: "" },
  { id: 5, title: "Sit-Stay", category: "Duration", content: "Ask for a sit. Say 'Stay' with a flat palm signal. Take one step back, return, and reward. Gradually build: 2 steps, 5 steps, 10 steps. Always return to your dog to reward — don't call them out of a stay yet.", videoUrl: "" },
  { id: 6, title: "Recall (Come)", category: "Foundation", content: "Only call your dog when you're sure they'll succeed. Crouch down, open arms, excited voice: 'Come!' Huge reward — this should be the BEST thing that ever happens. Never call to scold or for something unpleasant.", videoUrl: "" },
  { id: 7, title: "Crate Training", category: "Management", content: "Feed all meals in the crate with door open. Toss treats in randomly throughout the day. Build to closing the door for 10 seconds, then 30, then 1 minute. Never let your dog out while crying — wait for 3 seconds of quiet.", videoUrl: "" },
];

const SEED_DISCOUNT_CODES = [
  { id: 1, code: "WELCOME20", type: "percent", value: 20, uses: 0, maxUses: 100, expiry: "2026-12-31", active: true },
  { id: 2, code: "SPRING10", type: "flat", value: 10, uses: 5, maxUses: 50, expiry: "2026-05-31", active: true },
];

const SEED_GIFT_CARDS = [
  { id: 1, code: "CORECANINE-X7K2P", amount: 100, balance: 100, purchasedBy: "Linda Chen", purchasedFor: "Sarah M.", purchaseDate: "2026-02-14", redeemed: false },
  { id: 2, code: "CORECANINE-A3NQ8", amount: 50, balance: 25, purchasedBy: "Tom Reyes", purchasedFor: "Donna R.", purchaseDate: "2026-01-05", redeemed: false },
];

const SEED_MESSAGES = [
  { id: 1, clientId: 1, trainerId: 1, messages: [
    { id: 1, from: "trainer", text: "Hi Sarah! Great session today with Biscuit. Keep practicing that parallel walking!", time: "2026-03-10 14:30" },
    { id: 2, from: "client", text: "Thank you! He did so well. Same time next week?", time: "2026-03-10 15:00" },
  ]},
  { id: 2, clientId: 3, trainerId: 2, messages: [
    { id: 1, from: "trainer", text: "Atlas is making incredible progress on his heel work!", time: "2026-03-11 11:00" },
    { id: 2, from: "client", text: "He's been practicing every day. So proud of him!", time: "2026-03-11 11:45" },
  ]},
];

const SEED_DOG_NOTES = {
  1: [{ id: 1, trainerId: 1, date: "2026-03-07", text: "Biscuit made great progress on parallel walking. Still reactive at 10ft but threshold improving. Owner is consistent with homework." }],
  3: [{ id: 1, trainerId: 2, date: "2026-03-11", text: "Atlas nailed his off-leash heel today. Ready to add distractions next session." }],
};

const SEED_SCHEDULE = {
  1: { facility: { Monday: ["9:00","10:00","11:00","14:00","15:00"], Wednesday: ["10:00","14:00","15:00"], Friday: ["9:00","10:00","11:00"], Saturday: ["9:00","10:00"] }, inHome: { Tuesday: ["10:00","11:00","13:00","14:00"], Thursday: ["10:00","11:00","13:00","14:00","15:00"] } },
  2: { facility: { Monday: ["13:00","14:00","15:00"], Thursday: ["10:00","11:00","14:00","15:00"], Saturday: ["10:00","11:00","13:00"] }, inHome: { Wednesday: ["10:00","11:00","13:00"], Friday: ["10:00","11:00","13:00","14:00"] } },
};

const SEED_REFUNDS = [
  { id: 1, clientId: 1, sessionId: 1, amount: 90, date: "2026-02-20", reason: "Trainer illness — full refund", processedBy: "Admin" },
];

const SEED_EMAIL_TEMPLATES = [
  { id: 1, name: "Session Confirmation", subject: "Your Core Canine session is confirmed!", body: "Hi {{clientName}},\n\nGreat news — your session is confirmed!\n\n📅 {{sessionDate}} at {{sessionTime}}\n📍 {{sessionLocation}}\n👤 Trainer: {{trainerName}}\n\nIf you need to reschedule, please do so at least 72 hours in advance through the client portal.\n\nWe can't wait to work with you and {{dogName}}!\n\n— The Core Canine Team", active: true },
  { id: 2, name: "Class Enrollment Confirmation", subject: "You're enrolled in {{className}}!", body: "Hi {{clientName}},\n\nWelcome to {{className}}!\n\n📅 Starts {{startDate}} · {{classTime}}\n👤 Instructor: {{trainerName}}\n{{sessionDates}}\n\nPlease remember to bring:\n• Your dog on a 4–6 ft leash (no retractables)\n• High-value treats\n• Proof of vaccination\n\nSee you soon!\n\n— The Core Canine Team", active: true },
  { id: 3, name: "Session Reminder", subject: "Reminder: Your session is tomorrow!", body: "Hi {{clientName}},\n\nJust a friendly reminder that you have a session tomorrow:\n\n📅 {{sessionDate}} at {{sessionTime}}\n📍 {{sessionLocation}}\n👤 Trainer: {{trainerName}}\n\nSee you soon!\n\n— Core Canine", active: true },
  { id: 4, name: "Homework Follow-Up", subject: "Your homework from today's session 🐾", body: "Hi {{clientName}},\n\nGreat work today! Here are the exercises we covered. Practice a little every day — short sessions work best.\n\n{{homeworkList}}\n\nQuestions? Reply to this email anytime.\n\n— {{trainerName}}", active: true },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt12 = t => { if (!t) return ""; const [h, m] = t.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`; };
const fmtDate = d => { if (!d) return ""; return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
const fmtDateShort = d => { if (!d) return ""; return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
const addWeeks = (ds, w) => { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + w * 7); return d.toISOString().slice(0, 10); };
const genCode = () => "CORECANINE-" + Math.random().toString(36).slice(2, 7).toUpperCase();
const today = new Date().toISOString().slice(0, 10);
const hoursUntil = ds => (new Date(ds + "T12:00:00") - new Date()) / 36e5;
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TIMES_24 = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

// ─── UI PRIMITIVES ─────────────────────────────────────────────────────────────
const Pill = ({ children, color = C.gold, bg, style = {} }) => (
  <span style={{ background: bg || color + "22", color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", whiteSpace: "nowrap", ...style }}>{children}</span>
);

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background: C.white, borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.05)", padding: "20px 22px", ...(onClick ? { cursor: "pointer" } : {}), ...style }}>{children}</div>
);

const Btn = ({ children, onClick, variant = "gold", small, disabled, full, style = {} }) => {
  const v = {
    gold: { background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, color: C.obsidian, border: "none" },
    sage: { background: `linear-gradient(135deg, ${C.sage}, ${C.sageLight})`, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: C.charcoal, border: `1.5px solid #D0CCC4` },
    danger: { background: C.rust, color: "#fff", border: "none" },
    dark: { background: C.charcoal, color: C.fog, border: "none" },
    sky: { background: C.sky, color: "#fff", border: "none" },
  };
  return <button disabled={disabled} onClick={onClick} style={{ ...v[variant], borderRadius: 9, fontFamily: "inherit", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "all 0.15s", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: small ? "5px 13px" : "9px 18px", fontSize: small ? 12 : 14, width: full ? "100%" : "auto", ...style }}>{children}</button>;
};

const Field = ({ label, hint, children, style = {} }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5, ...style }}>
    {label && <label style={{ fontSize: 11, fontWeight: 800, color: C.steel, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</label>}
    {hint && <span style={{ fontSize: 12, color: C.silver, marginTop: -3 }}>{hint}</span>}
    {children}
  </div>
);

const inputStyle = { border: `1.5px solid #DDD9D0`, borderRadius: 9, padding: "9px 13px", fontSize: 14, fontFamily: "inherit", background: C.cream, outline: "none", color: C.obsidian, width: "100%", boxSizing: "border-box" };

const Input = ({ label, hint, style: fs, ...props }) => <Field label={label} hint={hint} style={fs}><input style={inputStyle} {...props} /></Field>;
const TextArea = ({ label, hint, style: fs, ...props }) => <Field label={label} hint={hint} style={fs}><textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} {...props} /></Field>;
const Sel = ({ label, hint, children, style: fs, ...props }) => <Field label={label} hint={hint} style={fs}><select style={inputStyle} {...props}>{children}</select></Field>;

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: C.white, borderRadius: 18, padding: 30, width: "100%", maxWidth: wide ? 780 : 580, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ margin: 0, color: C.obsidian, fontSize: 20, fontFamily: "Georgia, serif" }}>{title}</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.silver, lineHeight: 1 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Section = ({ title, action, children }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h2 style={{ margin: 0, fontSize: 22, color: C.obsidian, fontFamily: "Georgia, serif" }}>{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

const Step = ({ number, label, active, done }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0, background: done ? C.sage : active ? C.gold : C.fog, color: done || active ? "#fff" : C.silver, transition: "all 0.2s" }}>{done ? "✓" : number}</div>
    <span style={{ fontSize: 13, fontWeight: active || done ? 700 : 400, color: active ? C.obsidian : done ? C.sage : C.silver }}>{label}</span>
  </div>
);

// ─── NAV CONFIG ────────────────────────────────────────────────────────────────
const NAV_ADMIN = [
  { id: "dashboard", icon: "◈", label: "Dashboard" },
  { id: "calendar", icon: "📅", label: "Calendar" },
  { id: "schedule", icon: "◷", label: "My Availability" },
  { id: "sessions", icon: "◎", label: "Sessions" },
  { id: "classes", icon: "◑", label: "Classes" },
  { id: "clients", icon: "◉", label: "Clients" },
  { id: "messages", icon: "◻", label: "Messages" },
  { id: "homework", icon: "◈", label: "Homework Cards" },
  { id: "staff", icon: "◐", label: "Staff" },
  { id: "discounts", icon: "◇", label: "Discounts & Gift Cards" },
  { id: "emails", icon: "✉", label: "Emails" },
  { id: "reports", icon: "◆", label: "Reports" },
  { id: "settings", icon: "◌", label: "Settings" },
];
const NAV_TRAINER = [
  { id: "dashboard", icon: "◈", label: "Dashboard" },
  { id: "calendar", icon: "📅", label: "Calendar" },
  { id: "schedule", icon: "◷", label: "My Availability" },
  { id: "sessions", icon: "◎", label: "My Sessions" },
  { id: "clients", icon: "◉", label: "My Clients" },
  { id: "messages", icon: "◻", label: "Messages" },
  { id: "homework", icon: "◈", label: "Homework Cards" },
];
const CLIENT_NAV = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "book-session", icon: "🎯", label: "Book" },
  { id: "book-class", icon: "🐕", label: "Classes" },
  { id: "bookings", icon: "📅", label: "Bookings" },
  { id: "messages", icon: "💬", label: "Messages" },
  { id: "account", icon: "👤", label: "Account" },
];

// ─── UNIFIED LOGIN ────────────────────────────────────────────────────────────
function UnifiedLogin({ onStaffLogin, onClientLogin, staff, clients, settings }) {
  const [mode, setMode] = useState("client"); // "client" | "staff"
  const [signupMode, setSignupMode] = useState("signup");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone");
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError] = useState("");

  const clean = p => p.replace(/\D/g, "").slice(-7);

  const switchMode = (m) => { setMode(m); setStep("phone"); setError(""); setCode(""); setPhone(""); };

  const sendCode = () => {
    const p = clean(phone);
    if (p.length < 7) { setError("Please enter a valid phone number."); return; }
    if (mode === "staff") {
      const found = staff.find(s => clean(s.phone) === p);
      if (!found) { setError("Phone number not found. Contact Core Canine admin."); return; }
      setFoundUser({ type: "staff", user: found });
    } else {
      if (signupMode === "login") {
        const found = clients.find(c => clean(c.phone) === p);
        if (!found) { setError("No account found. Try New Client to sign up."); return; }
        setFoundUser({ type: "client", user: found });
      } else {
        setFoundUser({ type: "newClient", phone });
      }
    }
    setStep("code");
    setError("");
  };

  const verify = () => {
    if (code !== "1234") { setError("Incorrect code. (Demo: 1234)"); return; }
    if (foundUser.type === "staff") onStaffLogin(foundUser.user);
    else if (foundUser.type === "client") onClientLogin(foundUser.user, false);
    else onClientLogin({ id: Date.now(), phone: foundUser.phone, name: "", email: "", waiverSigned: false, dogs: [] }, true);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.obsidian, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 24 }}>

      {/* Logo / branding */}
      <div style={{ textAlign: "center" }}>
        {settings?.logoUrl
          ? <img src={settings.logoUrl} alt="Core Canine" style={{ maxHeight: 100, maxWidth: 260, objectFit: "contain", marginBottom: 10 }} />
          : <div style={{ fontSize: 52, marginBottom: 10 }}>🐾</div>}
        <h1 style={{ fontFamily: "Georgia, serif", color: C.cream, margin: "0 0 6px", fontSize: 30 }}>Core Canine</h1>
        <p style={{ color: C.silver, margin: 0, fontSize: 15 }}>Professional Dog Training</p>
      </div>

      {/* Card */}
      <div style={{ background: C.white, borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 420, boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>

        {mode === "client" ? (
          <>
            {/* Client toggle: New Client | Returning Client */}
            <div style={{ display: "flex", gap: 0, marginBottom: 22, background: C.cream, borderRadius: 10, padding: 4 }}>
              {[["signup", "New Client"], ["login", "Returning Client"]].map(([m, l]) => (
                <button key={m} onClick={() => { setSignupMode(m); setStep("phone"); setError(""); setCode(""); }} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", background: signupMode === m ? C.gold : "transparent", color: signupMode === m ? C.obsidian : C.silver, transition: "all 0.15s" }}>{l}</button>
              ))}
            </div>

            {step === "phone" ? (
              <div style={{ display: "grid", gap: 14 }}>
                <Field label="Mobile Number">
                  <input style={inputStyle} placeholder="(555) 555-5555" value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === "Enter" && sendCode()} autoFocus />
                </Field>
                {error && <div style={{ color: C.rust, fontSize: 13 }}>{error}</div>}
                <Btn full onClick={sendCode}>{signupMode === "signup" ? "Get Started →" : "Send Verification Code →"}</Btn>
                <p style={{ color: C.silver, fontSize: 11, textAlign: "center", margin: 0 }}>
                  {signupMode === "login" ? "Demo: 555-1001 or 555-1002" : "Use any phone number to create an account"} · code: 1234
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                <p style={{ color: C.steel, fontSize: 14, margin: 0 }}>Enter the code sent to {phone}</p>
                <Field label="Verification Code">
                  <input style={{ ...inputStyle, textAlign: "center", fontSize: 22, letterSpacing: 8, fontWeight: 800 }} placeholder="••••" maxLength={4} value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === "Enter" && verify()} autoFocus />
                </Field>
                {error && <div style={{ color: C.rust, fontSize: 13 }}>{error}</div>}
                <Btn full onClick={verify}>Verify & Continue →</Btn>
                <button onClick={() => { setStep("phone"); setError(""); }} style={{ background: "none", border: "none", color: C.silver, cursor: "pointer", fontSize: 13 }}>← Back</button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Staff login */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <button onClick={() => switchMode("client")} style={{ background: "none", border: "none", color: C.silver, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>←</button>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.obsidian }}>Staff Login</div>
                <div style={{ fontSize: 12, color: C.silver }}>Core Canine team members only</div>
              </div>
            </div>

            {step === "phone" ? (
              <div style={{ display: "grid", gap: 14 }}>
                <Field label="Mobile Number">
                  <input style={inputStyle} placeholder="(555) 555-5555" value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === "Enter" && sendCode()} autoFocus />
                </Field>
                {error && <div style={{ color: C.rust, fontSize: 13 }}>{error}</div>}
                <Btn full onClick={sendCode}>Send Verification Code →</Btn>
                <p style={{ color: C.silver, fontSize: 11, textAlign: "center", margin: 0 }}>Demo: 555-0001 (admin) · 555-0002 (trainer) · code: 1234</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                <p style={{ color: C.steel, fontSize: 14, margin: 0 }}>Enter the code sent to {phone}</p>
                <Field label="Verification Code">
                  <input style={{ ...inputStyle, textAlign: "center", fontSize: 22, letterSpacing: 8, fontWeight: 800 }} placeholder="••••" maxLength={4} value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === "Enter" && verify()} autoFocus />
                </Field>
                {error && <div style={{ color: C.rust, fontSize: 13 }}>{error}</div>}
                <Btn full onClick={verify}>Verify & Continue →</Btn>
                <button onClick={() => { setStep("phone"); setError(""); }} style={{ background: "none", border: "none", color: C.silver, cursor: "pointer", fontSize: 13 }}>← Back</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Discreet staff link — only shown on client screen */}
      {mode === "client" && (
        <button onClick={() => switchMode("staff")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
          Staff login
        </button>
      )}
    </div>
  );
}

// ─── CLIENT ONBOARDING ────────────────────────────────────────────────────────
function Onboarding({ client, onComplete }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ name: "", email: "", phone: client.phone || "" });
  const [dogs, setDogs] = useState([]);
  const [dogForm, setDogForm] = useState({ name: "", breed: "", age: "", ageUnit: "years", sex: "Male", neutered: false, birthday: "", notes: "", photo: null, vaccineDoc: null });
  const [waiverChecked, setWaiverChecked] = useState(false);
  const [policyChecked, setPolicyChecked] = useState(false);
  const photoRef = useRef();
  const docRef = useRef();

  const WAIVER = "I understand that dog training involves inherent risks including potential injury to myself, my dog, other participants, or trainers. I agree that Core Canine and its trainers are not liable for any injury, property damage, or loss arising from training sessions or classes. I confirm that my dog is current on all required vaccinations including Rabies, Distemper, and Bordetella. I agree to disclose any known behavioral concerns prior to sessions.";
  const POLICY = "Cancellations made more than 72 hours before your session may be rescheduled at no charge. Cancellations within 72 hours of your session are non-refundable. You may reschedule your own sessions up to 72 hours in advance through this app. Classes cannot be rescheduled — if you miss a class session, it cannot be made up or refunded.";

  const calcAgeFromBirthday = (dob) => {
    if (!dob) return { age: "", ageUnit: "years" };
    const birth = new Date(dob + "T12:00:00");
    const now = new Date();
    const totalDays = Math.floor((now - birth) / 86400000);
    if (totalDays < 0) return { age: "", ageUnit: "years" };
    if (totalDays < 84) return { age: String(Math.max(1, Math.round(totalDays / 7))), ageUnit: "weeks" };
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 24) return { age: String(Math.max(1, months)), ageUnit: "months" };
    const years = now.getFullYear() - birth.getFullYear() - (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate()) ? 1 : 0);
    return { age: String(Math.max(1, years)), ageUnit: "years" };
  };

  const addDog = () => {
    if (!dogForm.name) return;
    setDogs(d => [...d, { ...dogForm, id: Date.now() }]);
    setDogForm({ name: "", breed: "", age: "", ageUnit: "years", sex: "Male", neutered: false, birthday: "", notes: "", photo: null, vaccineDoc: null });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "32px 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36 }}>🐾</div>
          <h1 style={{ fontFamily: "Georgia, serif", color: C.obsidian, margin: "8px 0 4px" }}>Welcome to Core Canine!</h1>
          <p style={{ color: C.silver, margin: 0 }}>Quick account setup — about 2 minutes.</p>
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
          {[["1", "Your Info"], ["2", "Your Dog(s)"], ["3", "Agreements"]].map(([n, l], i) => (
            <Step key={n} number={n} label={l} active={step === i + 1} done={step > i + 1} />
          ))}
        </div>
        <Card>
          {step === 1 && (
            <div style={{ display: "grid", gap: 14 }}>
              <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 4px", color: C.obsidian }}>Your Contact Info</h3>
              <Input label="Full Name" placeholder="Jane Smith" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              <Input label="Email" type="email" placeholder="you@email.com" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
              <Input label="Phone" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
              <Btn full onClick={() => { if (profile.name && profile.email) setStep(2); }}>Continue →</Btn>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: "grid", gap: 14 }}>
              <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 4px", color: C.obsidian }}>Tell Us About Your Dog(s)</h3>
              {dogs.map((dog, i) => (
                <div key={dog.id} style={{ background: C.cream, borderRadius: 12, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ fontSize: 22 }}>{dog.photo ? <img src={dog.photo} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} /> : "🐕"}</div>
                  <div style={{ flex: 1 }}><b>{dog.name}</b> · {dog.breed} · {dog.age} {dog.ageUnit}</div>
                  <button onClick={() => setDogs(d => d.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.rust, cursor: "pointer", fontWeight: 800 }}>✕</button>
                </div>
              ))}
              <div style={{ background: "#3A6B8C18", borderRadius: 14, padding: 16, border: "1.5px dashed #3A6B8C" }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: C.sky, marginBottom: 10 }}>ADD A DOG</div>
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Input label="Name" placeholder="Biscuit" value={dogForm.name} onChange={e => setDogForm(f => ({ ...f, name: e.target.value }))} />
                    <Input label="Breed" placeholder="Golden Retriever" value={dogForm.breed} onChange={e => setDogForm(f => ({ ...f, breed: e.target.value }))} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Sel label="Sex" value={dogForm.sex} onChange={e => setDogForm(f => ({ ...f, sex: e.target.value }))}><option>Male</option><option>Female</option></Sel>
                    <Field label="Fixed?"><label style={{ display: "flex", gap: 6, alignItems: "center", height: 42, cursor: "pointer", fontSize: 14 }}><input type="checkbox" checked={dogForm.neutered} onChange={e => setDogForm(f => ({ ...f, neutered: e.target.checked }))} />Yes</label></Field>
                  </div>
                  <Field label="Age">
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" min="0" style={{ ...inputStyle, flex: 1 }} placeholder="e.g. 8" value={dogForm.age} onChange={e => setDogForm(f => ({ ...f, age: e.target.value }))} />
                      <select style={{ ...inputStyle, width: 110 }} value={dogForm.ageUnit} onChange={e => setDogForm(f => ({ ...f, ageUnit: e.target.value }))}>
                        <option value="weeks">weeks</option>
                        <option value="months">months</option>
                        <option value="years">years</option>
                      </select>
                    </div>
                  </Field>
                  <Field label="Birthday (optional)" hint="Entering a birthday will auto-fill age">
                    <input type="date" style={inputStyle} value={dogForm.birthday} onChange={e => {
                      const dob = e.target.value;
                      const calc = calcAgeFromBirthday(dob);
                      setDogForm(f => ({ ...f, birthday: dob, ...calc }));
                    }} />
                  </Field>
                  <TextArea label="Behavioral Notes" placeholder="Leash reactive, shy, any health issues..." value={dogForm.notes} onChange={e => setDogForm(f => ({ ...f, notes: e.target.value }))} />
                  <Field label="Dog Photo (optional)">
                    <input type="file" accept="image/*" ref={photoRef} onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = x => setDogForm(d => ({ ...d, photo: x.target.result })); r.readAsDataURL(f); } }} style={{ display: "none" }} />
                    <button onClick={() => photoRef.current.click()} style={{ ...inputStyle, cursor: "pointer", textAlign: "left", background: C.white, color: dogForm.photo ? C.sage : C.silver, fontSize: 13 }}>{dogForm.photo ? "✓ Photo added" : "📷 Upload photo"}</button>
                  </Field>
                  <Btn variant="sky" onClick={addDog}>{dogs.length === 0 ? (dogForm.name ? `✓ Save ${dogForm.name}` : "✓ Save Dog") : (dogForm.name ? `+ Add ${dogForm.name}` : `+ Add ${dogs.length === 1 ? "Second" : dogs.length === 2 ? "Third" : "Another"} Dog`)}</Btn>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
                <Btn full onClick={() => { if (dogs.length > 0) setStep(3); else alert("Please add at least one dog."); }}>Continue →</Btn>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ display: "grid", gap: 14 }}>
              <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 4px", color: C.obsidian }}>Agreements</h3>
              <div style={{ background: C.cream, borderRadius: 12, padding: 16, maxHeight: 150, overflowY: "auto", fontSize: 13, color: C.steel, lineHeight: 1.7 }}>
                <b style={{ color: C.obsidian }}>Liability Waiver</b><br />{WAIVER}
              </div>
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={waiverChecked} onChange={e => setWaiverChecked(e.target.checked)} style={{ marginTop: 3 }} />
                I have read and agree to the Core Canine Liability Waiver
              </label>
              <div style={{ background: C.cream, borderRadius: 12, padding: 16, maxHeight: 130, overflowY: "auto", fontSize: 13, color: C.steel, lineHeight: 1.7 }}>
                <b style={{ color: C.obsidian }}>Cancellation Policy</b><br />{POLICY}
              </div>
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={policyChecked} onChange={e => setPolicyChecked(e.target.checked)} style={{ marginTop: 3 }} />
                I understand and agree to the Cancellation Policy
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="ghost" onClick={() => setStep(2)}>← Back</Btn>
                <Btn full disabled={!waiverChecked || !policyChecked} onClick={() => onComplete({ ...client, ...profile, dogs, waiverSigned: true, joinDate: today })}>Create My Account →</Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── CLIENT PORTAL SCREENS ────────────────────────────────────────────────────
function BookSession({ client, discountCodes, giftCards, staffList, schedule, sessions, onBack, onBooked }) {
  const isReturning = !!(client?.name && client?.email && client?.dogs?.length > 0);
  const [step, setStep] = useState(1);
  const [trainer, setTrainer] = useState(null);
  const [sessionType, setSessionType] = useState("facility");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  // Intake form state (new clients only)
  const [intake, setIntake] = useState({ name: client?.name || "", email: client?.email || "", address: "", issues: "", dogs: client?.dogs?.length > 0 ? client.dogs.map(d => ({ id: d.id, name: d.name, breed: d.breed || "", dob: d.birthday || "", weight: "" })) : [{ id: Date.now(), name: "", breed: "", dob: "", weight: "" }] });
  const [discount, setDiscount] = useState("");
  const [discountApplied, setDiscountApplied] = useState(null);
  const [giftCode, setGiftCode] = useState("");
  const [giftApplied, setGiftApplied] = useState(null);
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", name: "" });
  const [booked, setBooked] = useState(false);
  const BASE = sessionType === "in-home" ? 110 : 90;

  // Steps: 1=Trainer&Type, 2=Date&Time, [3=Intake — new only], 4=Checkout
  const intakeStep = isReturning ? null : 3;
  const checkoutStep = isReturning ? 3 : 4;
  const totalSteps = isReturning ? 3 : 4;

  const calcTotal = () => {
    let t = BASE;
    if (discountApplied) t = discountApplied.type === "percent" ? t * (1 - discountApplied.value / 100) : t - discountApplied.value;
    if (giftApplied) t = Math.max(0, t - giftApplied.balance);
    return Math.max(0, t);
  };

  const getAvailableTimes = (dateStr) => {
    if (!trainer || !dateStr) return [];
    const key = sessionType === "facility" ? "facility" : "inHome";
    const dayName = new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
    const allSlots = schedule[trainer.id]?.[key]?.[dayName] || [];
    const bookedTimes = (sessions || [])
      .filter(s => s.trainerId === trainer.id && s.date === dateStr && s.status !== "cancelled")
      .map(s => s.time);
    return allSlots.filter(t => !bookedTimes.includes(t));
  };

  const getDates = () => {
    if (!trainer) return [];
    const key = sessionType === "facility" ? "facility" : "inHome";
    const daySlots = schedule[trainer.id]?.[key] || {};
    const dates = [];
    for (let i = 1; i <= 35; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      if (daySlots[dayName]?.length > 0 && getAvailableTimes(dateStr).length > 0) dates.push(dateStr);
    }
    return dates.slice(0, 20);
  };

  const getTimes = () => getAvailableTimes(selectedDate);

  const addIntakeDog = () => setIntake(f => ({ ...f, dogs: [...f.dogs, { id: Date.now(), name: "", breed: "", dob: "", weight: "" }] }));
  const removeIntakeDog = id => setIntake(f => ({ ...f, dogs: f.dogs.filter(d => d.id !== id) }));
  const updateIntakeDog = (id, field, val) => setIntake(f => ({ ...f, dogs: f.dogs.map(d => d.id === id ? { ...d, [field]: val } : d) }));
  const intakeValid = () => intake.name && intake.email && intake.dogs.length > 0 && intake.dogs.every(d => d.name);

  const stepLabels = isReturning
    ? [["1", "Trainer & Type"], ["2", "Date & Time"], ["3", "Checkout"]]
    : [["1", "Trainer & Type"], ["2", "Date & Time"], ["3", "Your Info"], ["4", "Checkout"]];

  if (booked) return (
    <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontFamily: "Georgia, serif", color: C.obsidian }}>You're booked!</h2>
      <p style={{ color: C.steel, fontSize: 15, lineHeight: 1.8 }}>Session with <b>{trainer?.name}</b><br /><b>{fmtDate(selectedDate)} at {fmt12(selectedTime)}</b><br />{sessionType === "facility" ? "📍 At our training facility" : "🚗 At your home"}</p>
      <Btn full onClick={onBack}>← Back to Home</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontWeight: 700, fontSize: 14, marginBottom: 20 }}>← Back</button>
      <h2 style={{ fontFamily: "Georgia, serif", color: C.obsidian, marginBottom: 20 }}>Book a Private Session</h2>
      {isReturning && (
        <div style={{ background: C.sage + "18", border: `1px solid ${C.sage}40`, borderRadius: 10, padding: "8px 14px", marginBottom: 16, fontSize: 13, color: C.sage, fontWeight: 700 }}>
          ✓ Welcome back, {client.name}! We have your info on file.
        </div>
      )}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {stepLabels.map(([n, l], i) => (
          <Step key={n} number={n} label={l} active={step === i + 1} done={step > i + 1} />
        ))}
      </div>

      {/* Step 1: Trainer & Type */}
      {step === 1 && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["facility", "🏠", "At the Facility", "$90"], ["in-home", "🚗", "In-Home", "$110"]].map(([v, icon, label, price]) => (
              <div key={v} onClick={() => { setSessionType(v); setSelectedDate(""); setSelectedTime(""); }} style={{ padding: 16, borderRadius: 14, border: `2px solid ${sessionType === v ? C.gold : C.fog}`, background: sessionType === v ? C.gold + "14" : C.white, cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontWeight: 800, color: C.obsidian }}>{label}</div>
                <div style={{ fontSize: 13, color: C.silver }}>{price} · 90 min</div>
              </div>
            ))}
          </div>
          <div style={{ fontWeight: 700, color: C.obsidian, marginBottom: 4 }}>Choose Your Trainer</div>
          {staffList.filter(s => s.active && s.services.includes("private")).map(t => (
            <Card key={t.id} onClick={() => setTrainer(t)} style={{ border: `2px solid ${trainer?.id === t.id ? C.gold : C.fog}`, background: trainer?.id === t.id ? C.gold + "0D" : C.white, transition: "all 0.15s" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, fontWeight: 800, color: C.obsidian }}>{t.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: C.silver, marginTop: 2, lineHeight: 1.6 }}>{t.bio}</div>
                </div>
                {trainer?.id === t.id && <div style={{ color: C.gold, fontWeight: 800, fontSize: 18 }}>✓</div>}
              </div>
            </Card>
          ))}
          <Btn full disabled={!trainer} onClick={() => setStep(2)}>Continue →</Btn>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ fontWeight: 700, color: C.obsidian }}>Select a Date</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {getDates().map(d => (
              <button key={d} onClick={() => { setSelectedDate(d); setSelectedTime(""); }} style={{ padding: "8px 14px", borderRadius: 10, border: `2px solid ${selectedDate === d ? C.gold : C.fog}`, background: selectedDate === d ? C.gold + "18" : C.white, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.12s" }}>
                {fmtDateShort(d)}
              </button>
            ))}
          </div>
          {selectedDate && <>
            <div style={{ fontWeight: 700, color: C.obsidian }}>Select a Time</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {getTimes().map(t => (
                <button key={t} onClick={() => setSelectedTime(t)} style={{ padding: "8px 16px", borderRadius: 10, border: `2px solid ${selectedTime === t ? C.gold : C.fog}`, background: selectedTime === t ? C.gold + "18" : C.white, cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "all 0.12s" }}>
                  {fmt12(t)}
                </button>
              ))}
            </div>
          </>}
          <TextArea label="Notes for your trainer (optional)" placeholder="What would you like to work on?" value={notes} onChange={e => setNotes(e.target.value)} />
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
            <Btn full disabled={!selectedDate || !selectedTime} onClick={() => setStep(isReturning ? checkoutStep : intakeStep)}>Continue →</Btn>
          </div>
        </div>
      )}

      {/* Step 3 (new clients): Intake Form */}
      {step === intakeStep && !isReturning && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ background: C.cream, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.steel }}>
            This helps us prepare for your first session. You only need to fill this out once.
          </div>
          <Input label="Full Name *" value={intake.name} onChange={e => setIntake(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email *" type="email" value={intake.email} onChange={e => setIntake(f => ({ ...f, email: e.target.value }))} />
          <Input label="Home Address" placeholder="123 Main St, City, State" value={intake.address} onChange={e => setIntake(f => ({ ...f, address: e.target.value }))} />
          <TextArea label="What issues are you hoping to work on?" placeholder="Leash pulling, jumping, recall, reactivity…" value={intake.issues} onChange={e => setIntake(f => ({ ...f, issues: e.target.value }))} />

          <div style={{ borderTop: `1px solid ${C.fog}`, paddingTop: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.obsidian, marginBottom: 12 }}>Your Dog(s) *</div>
            {intake.dogs.map((dog, i) => (
              <div key={dog.id} style={{ background: C.cream, borderRadius: 12, padding: "14px", marginBottom: 12, position: "relative" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.steel, marginBottom: 10 }}>Dog #{i + 1}</div>
                {intake.dogs.length > 1 && (
                  <button onClick={() => removeIntakeDog(dog.id)} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: C.rust, cursor: "pointer", fontWeight: 800, fontSize: 16 }}>✕</button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Input label="Name *" value={dog.name} onChange={e => updateIntakeDog(dog.id, "name", e.target.value)} />
                  <Input label="Breed" value={dog.breed} onChange={e => updateIntakeDog(dog.id, "breed", e.target.value)} />
                  <Input label="Date of Birth" type="date" value={dog.dob} onChange={e => updateIntakeDog(dog.id, "dob", e.target.value)} />
                  <Input label="Weight (lbs)" type="number" placeholder="45" value={dog.weight} onChange={e => updateIntakeDog(dog.id, "weight", e.target.value)} />
                </div>
              </div>
            ))}
            <button onClick={addIntakeDog} style={{ background: "none", border: `1.5px dashed ${C.sky}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", color: C.sky, fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>+ Add Another Dog</button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setStep(2)}>← Back</Btn>
            <Btn full disabled={!intakeValid()} onClick={() => setStep(checkoutStep)}>Continue →</Btn>
          </div>
        </div>
      )}

      {/* Final step: Checkout */}
      {step === checkoutStep && (
        <div style={{ display: "grid", gap: 14 }}>
          <Card style={{ background: C.cream, padding: "16px 20px" }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Order Summary</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: C.steel, marginBottom: 4 }}>
              <span>Private session — {sessionType === "facility" ? "Facility" : "In-Home"}</span><span>${BASE}</span>
            </div>
            <div style={{ fontSize: 13, color: C.silver, marginBottom: 8 }}>{fmtDate(selectedDate)} · {fmt12(selectedTime)} · with {trainer?.name}</div>
            {discountApplied && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.sage }}><span>Discount ({discountApplied.code})</span><span>-{discountApplied.type === "percent" ? `${discountApplied.value}%` : `$${discountApplied.value}`}</span></div>}
            {giftApplied && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.sage }}><span>Gift Card</span><span>-${Math.min(giftApplied.balance, BASE)}</span></div>}
            <div style={{ borderTop: `1px solid ${C.fog}`, marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16 }}>
              <span>Total</span><span style={{ color: C.gold }}>${calcTotal().toFixed(2)}</span>
            </div>
          </Card>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Discount code" value={discount} onChange={e => setDiscount(e.target.value)} />
            <Btn variant="ghost" small onClick={() => { const f = discountCodes.find(d => d.code === discount.toUpperCase() && d.active); if (f) setDiscountApplied(f); else alert("Code not found."); }}>Apply</Btn>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Gift card (CORECANINE-XXXXX)" value={giftCode} onChange={e => setGiftCode(e.target.value)} />
            <Btn variant="ghost" small onClick={() => { const f = giftCards.find(g => g.code === giftCode.toUpperCase() && g.active && g.balance > 0); if (f) setGiftApplied(f); else alert("Gift card not found."); }}>Apply</Btn>
          </div>
          {calcTotal() > 0 && (
            <Card>
              <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 14 }}>Payment</div>
              <div style={{ display: "grid", gap: 10 }}>
                <Input label="Name on Card" value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))} />
                <Input label="Card Number" placeholder="4242 4242 4242 4242" value={card.number} onChange={e => setCard(c => ({ ...c, number: e.target.value }))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Input label="Expiry" placeholder="MM/YY" value={card.exp} onChange={e => setCard(c => ({ ...c, exp: e.target.value }))} />
                  <Input label="CVC" placeholder="123" value={card.cvc} onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))} />
                </div>
                <div style={{ fontSize: 12, color: C.silver }}>🔒 Secured by Stripe</div>
              </div>
            </Card>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setStep(isReturning ? 2 : intakeStep)}>← Back</Btn>
            <Btn full variant="sage" onClick={() => { setBooked(true); onBooked && onBooked({ type: "session", trainer, date: selectedDate, time: selectedTime, sessionType, price: calcTotal() }); }}>Confirm & Pay ${calcTotal().toFixed(2)}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function BookClass({ client, discountCodes, giftCards, classTemplates, classInstances, staffList, onBack, onBooked }) {
  const isReturning = !!(client?.name && client?.email && client?.dogs?.length > 0);
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(1);
  // Intake (new clients only) — same as session PLUS vet info + vaccine upload
  const [intake, setIntake] = useState({ name: client?.name || "", email: client?.email || "", address: "", issues: "", vetName: "", vetPhone: "", dogs: client?.dogs?.length > 0 ? client.dogs.map(d => ({ id: d.id, name: d.name, breed: d.breed || "", dob: d.birthday || "", weight: "", vaccineDoc: null })) : [{ id: Date.now(), name: "", breed: "", dob: "", weight: "", vaccineDoc: null }] });
  const [discount, setDiscount] = useState("");
  const [discountApplied, setDiscountApplied] = useState(null);
  const [giftCode, setGiftCode] = useState("");
  const [giftApplied, setGiftApplied] = useState(null);
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", name: "" });
  const [booked, setBooked] = useState(false);
  const vaccineRefs = useRef({});

  const intakeStep = isReturning ? null : 2;
  const checkoutStep = isReturning ? 2 : 3;

  const tmpl = selected ? classTemplates.find(t => t.id === selected.templateId) : null;
  const instructor = selected ? staffList.find(s => s.id === selected.instructorId) : null;

  const calcTotal = () => {
    if (!tmpl) return 0;
    let t = tmpl.price;
    if (discountApplied) t = discountApplied.type === "percent" ? t * (1 - discountApplied.value / 100) : t - discountApplied.value;
    if (giftApplied) t = Math.max(0, t - giftApplied.balance);
    return Math.max(0, t);
  };

  const addIntakeDog = () => setIntake(f => ({ ...f, dogs: [...f.dogs, { id: Date.now(), name: "", breed: "", dob: "", weight: "", vaccineDoc: null }] }));
  const removeIntakeDog = id => setIntake(f => ({ ...f, dogs: f.dogs.filter(d => d.id !== id) }));
  const updateIntakeDog = (id, field, val) => setIntake(f => ({ ...f, dogs: f.dogs.map(d => d.id === id ? { ...d, [field]: val } : d) }));
  const intakeValid = () => intake.name && intake.email && intake.vetName && intake.vetPhone && intake.dogs.length > 0 && intake.dogs.every(d => d.name && d.vaccineDoc);

  const stepLabels = isReturning
    ? [["1", "Select Class"], ["2", "Checkout"]]
    : [["1", "Select Class"], ["2", "Your Info"], ["3", "Checkout"]];

  if (booked && selected && tmpl && instructor) return (
    <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🐾</div>
      <h2 style={{ fontFamily: "Georgia, serif", color: C.obsidian }}>You're enrolled!</h2>
      <p style={{ color: C.steel, fontSize: 15, lineHeight: 1.8 }}><b>{tmpl.name}</b><br />with <b>{instructor.name}</b><br />{tmpl.weeks} sessions · {fmt12(selected.time)}</p>
      <div style={{ background: C.cream, borderRadius: 14, padding: 16, textAlign: "left", margin: "16px 0" }}>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 13 }}>Your Session Dates</div>
        {Array.from({ length: tmpl.weeks || 1 }, (_, i) => addWeeks(selected.startDate, i)).map(d => (
          <div key={d} style={{ fontSize: 14, color: C.steel, padding: "4px 0", borderBottom: `1px solid ${C.fog}` }}>{fmtDate(d)}</div>
        ))}
      </div>
      <Btn full onClick={onBack}>← Back to Home</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontWeight: 700, fontSize: 14, marginBottom: 20 }}>← Back</button>
      <h2 style={{ fontFamily: "Georgia, serif", color: C.obsidian, marginBottom: 20 }}>Group Classes</h2>
      {isReturning && (
        <div style={{ background: C.sage + "18", border: `1px solid ${C.sage}40`, borderRadius: 10, padding: "8px 14px", marginBottom: 16, fontSize: 13, color: C.sage, fontWeight: 700 }}>
          ✓ Welcome back, {client.name}! We have your info on file.
        </div>
      )}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {stepLabels.map(([n, l], i) => (
          <Step key={n} number={n} label={l} active={step === i + 1} done={step > i + 1} />
        ))}
      </div>

      {/* Step 1: Select Class */}
      {step === 1 && (
        <div style={{ display: "grid", gap: 14 }}>
          {classInstances.filter(i => i.startDate >= today).map(inst => {
            const t = classTemplates.find(x => x.id === inst.templateId);
            const ins = staffList.find(s => s.id === inst.instructorId);
            const spotsLeft = (t?.maxDogs || 6) - (inst.enrolledIds?.length || inst.enrolledCount || 0);
            const full = spotsLeft <= 0;
            const dates = Array.from({ length: t?.weeks || 1 }, (_, i) => addWeeks(inst.startDate, i));
            return (
              <Card key={inst.id} onClick={() => { if (!full || t?.waitlistEnabled) setSelected(inst); }} style={{ border: `2px solid ${selected?.id === inst.id ? C.gold : C.fog}`, background: selected?.id === inst.id ? C.gold + "0D" : C.white, opacity: full && !t?.waitlistEnabled ? 0.6 : 1, transition: "all 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 16 }}>{t?.name}</span>
                      <Pill color={full ? C.rust : spotsLeft <= 2 ? C.gold : C.sage}>{full ? "FULL" : `${spotsLeft} spots left`}</Pill>
                      {full && t?.waitlistEnabled && <Pill color={C.sky}>Waitlist</Pill>}
                    </div>
                    <div style={{ fontSize: 13, color: C.silver, marginBottom: 6, lineHeight: 1.6 }}>{t?.description}</div>
                    <div style={{ fontSize: 13, color: C.steel }}>📅 {t?.weeks} wks · Starts {fmtDate(inst.startDate)} · {fmt12(inst.time)}</div>
                    <div style={{ fontSize: 13, color: C.gold, marginTop: 2 }}>👤 {ins?.name} · <b>${t?.price}</b> total</div>
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {dates.slice(0, 3).map(d => <span key={d} style={{ background: C.cream, borderRadius: 6, padding: "2px 8px", fontSize: 11, color: C.steel }}>{fmtDateShort(d)}</span>)}
                      {dates.length > 3 && <span style={{ background: C.cream, borderRadius: 6, padding: "2px 8px", fontSize: 11, color: C.silver }}>+{dates.length - 3} more</span>}
                    </div>
                  </div>
                  {selected?.id === inst.id && <div style={{ color: C.gold, fontWeight: 800, fontSize: 22 }}>✓</div>}
                </div>
              </Card>
            );
          })}
          <Btn full disabled={!selected} onClick={() => setStep(isReturning ? checkoutStep : intakeStep)}>Continue →</Btn>
        </div>
      )}

      {/* Step 2 (new clients only): Group Class Intake */}
      {step === intakeStep && !isReturning && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ background: C.sky + "18", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.sky, fontWeight: 700 }}>
            📋 Group class intake — vaccine records are required for all enrolled dogs.
          </div>
          <Input label="Full Name *" value={intake.name} onChange={e => setIntake(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email *" type="email" value={intake.email} onChange={e => setIntake(f => ({ ...f, email: e.target.value }))} />
          <Input label="Home Address" value={intake.address} onChange={e => setIntake(f => ({ ...f, address: e.target.value }))} />
          <TextArea label="What are you hoping your dog will get out of this class?" value={intake.issues} onChange={e => setIntake(f => ({ ...f, issues: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Veterinarian Name *" value={intake.vetName} onChange={e => setIntake(f => ({ ...f, vetName: e.target.value }))} />
            <Input label="Vet Phone *" value={intake.vetPhone} onChange={e => setIntake(f => ({ ...f, vetPhone: e.target.value }))} />
          </div>

          <div style={{ borderTop: `1px solid ${C.fog}`, paddingTop: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.obsidian, marginBottom: 4 }}>Your Dog(s) *</div>
            <div style={{ fontSize: 12, color: C.silver, marginBottom: 12 }}>Vaccine records required — upload PDF, JPG, or PNG for each dog.</div>
            {intake.dogs.map((dog, i) => (
              <div key={dog.id} style={{ background: C.cream, borderRadius: 12, padding: "14px", marginBottom: 12, position: "relative" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.steel, marginBottom: 10 }}>Dog #{i + 1}</div>
                {intake.dogs.length > 1 && (
                  <button onClick={() => removeIntakeDog(dog.id)} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: C.rust, cursor: "pointer", fontWeight: 800, fontSize: 16 }}>✕</button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <Input label="Name *" value={dog.name} onChange={e => updateIntakeDog(dog.id, "name", e.target.value)} />
                  <Input label="Breed" value={dog.breed} onChange={e => updateIntakeDog(dog.id, "breed", e.target.value)} />
                  <Input label="Date of Birth" type="date" value={dog.dob} onChange={e => updateIntakeDog(dog.id, "dob", e.target.value)} />
                  <Input label="Weight (lbs)" type="number" value={dog.weight} onChange={e => updateIntakeDog(dog.id, "weight", e.target.value)} />
                </div>
                <Field label="Vaccine Records *" hint={dog.vaccineDoc ? "" : "Required for group classes"}>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" ref={el => vaccineRefs.current[dog.id] = el} onChange={e => { const f = e.target.files[0]; if (f) updateIntakeDog(dog.id, "vaccineDoc", { name: f.name }); }} style={{ display: "none" }} />
                  <button onClick={() => vaccineRefs.current[dog.id]?.click()} style={{ ...inputStyle, cursor: "pointer", textAlign: "left", background: dog.vaccineDoc ? C.sage + "18" : C.white, color: dog.vaccineDoc ? C.sage : C.silver, fontSize: 13, fontFamily: "inherit" }}>
                    {dog.vaccineDoc ? `✓ ${dog.vaccineDoc.name}` : "📎 Upload vaccine records"}
                  </button>
                </Field>
              </div>
            ))}
            <button onClick={addIntakeDog} style={{ background: "none", border: `1.5px dashed ${C.sky}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", color: C.sky, fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>+ Add Another Dog</button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
            <Btn full disabled={!intakeValid()} onClick={() => setStep(checkoutStep)}>Continue →</Btn>
          </div>
        </div>
      )}

      {/* Final step: Checkout */}
      {step === checkoutStep && selected && (() => {
        const full = (tmpl?.maxDogs || 6) - (selected.enrolledIds?.length || selected.enrolledCount || 0) <= 0;
        const dates = Array.from({ length: tmpl?.weeks || 1 }, (_, i) => addWeeks(selected.startDate, i));
        return (
          <div style={{ display: "grid", gap: 14 }}>
            <Card style={{ background: C.cream, padding: "16px 20px" }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Enrollment Summary</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{tmpl?.name}</div>
              <div style={{ fontSize: 13, color: C.silver }}>with {instructor?.name} · {tmpl?.weeks} sessions starting {fmtDate(selected.startDate)}</div>
              <div style={{ marginTop: 10 }}>{dates.map(d => <div key={d} style={{ fontSize: 13, color: C.steel, padding: "3px 0" }}>• {fmtDate(d)} at {fmt12(selected.time)}</div>)}</div>
              {full && <div style={{ marginTop: 10, background: C.sky + "22", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.sky }}>This class is full — you'll join the waitlist.</div>}
              {discountApplied && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.sage, marginTop: 6 }}><span>Discount ({discountApplied.code})</span><span>-{discountApplied.type === "percent" ? `${discountApplied.value}%` : `$${discountApplied.value}`}</span></div>}
              {giftApplied && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.sage }}><span>Gift Card</span><span>-${Math.min(giftApplied.balance, tmpl?.price || 0)}</span></div>}
              <div style={{ borderTop: `1px solid ${C.fog}`, marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16 }}>
                <span>Total</span><span style={{ color: C.gold }}>${calcTotal().toFixed(2)}</span>
              </div>
            </Card>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Discount code" value={discount} onChange={e => setDiscount(e.target.value)} />
              <Btn variant="ghost" small onClick={() => { const f = discountCodes.find(d => d.code === discount.toUpperCase() && d.active); if (f) setDiscountApplied(f); else alert("Code not found."); }}>Apply</Btn>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Gift card code" value={giftCode} onChange={e => setGiftCode(e.target.value)} />
              <Btn variant="ghost" small onClick={() => { const f = giftCards.find(g => g.code === giftCode.toUpperCase() && g.active && g.balance > 0); if (f) setGiftApplied(f); else alert("Not found."); }}>Apply</Btn>
            </div>
            {!full && calcTotal() > 0 && (
              <Card>
                <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 14 }}>Payment</div>
                <div style={{ display: "grid", gap: 10 }}>
                  <Input label="Name on Card" value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))} />
                  <Input label="Card Number" placeholder="4242 4242 4242 4242" value={card.number} onChange={e => setCard(c => ({ ...c, number: e.target.value }))} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Input label="Expiry" placeholder="MM/YY" value={card.exp} onChange={e => setCard(c => ({ ...c, exp: e.target.value }))} />
                    <Input label="CVC" placeholder="123" value={card.cvc} onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))} />
                  </div>
                  <div style={{ fontSize: 12, color: C.silver }}>🔒 Secured by Stripe</div>
                </div>
              </Card>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setStep(isReturning ? 1 : intakeStep)}>← Back</Btn>
              <Btn full variant="sage" onClick={() => { setBooked(true); onBooked && onBooked({ type: "class", instance: selected }); }}>{full ? "Join Waitlist" : "Enroll & Pay $" + calcTotal().toFixed(2)}</Btn>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function MyBookings({ bookings, setBookings, staffList, schedule }) {
  const [rescheduleItem, setRescheduleItem] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [showReview, setShowReview] = useState(null);
  const canResched = ds => hoursUntil(ds) > 72;
  const canRefund = ds => hoursUntil(ds) > 72;
  const sessions = bookings.filter(b => b.bookingType === "session");
  const classes = bookings.filter(b => b.bookingType === "class");

  const cancelIt = (id, ds) => {
    const refund = canRefund(ds);
    if (window.confirm(refund ? "Cancel session? You'll receive a full refund." : "Cancel session? Within 72 hours — no refund per cancellation policy.")) {
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: "cancelled", refunded: refund } : b));
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", color: C.obsidian, marginBottom: 20 }}>My Bookings</h2>
      {sessions.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.silver, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Private Sessions</div>
          <div style={{ display: "grid", gap: 12 }}>
            {sessions.map(b => {
              const past = b.date < today || b.status === "cancelled";
              return (
                <Card key={b.id} style={{ borderLeft: `4px solid ${b.status === "cancelled" ? C.silver : b.date < today ? C.fog : C.gold}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontWeight: 800 }}>{fmtDate(b.date)} · {fmt12(b.time)}</span>
                        <Pill color={b.sessionType === "facility" ? C.sage : C.gold}>{b.sessionType === "facility" ? "🏠 Facility" : "🚗 In-Home"}</Pill>
                        {b.status === "cancelled" && <Pill color={C.silver}>Cancelled{b.refunded ? " · Refunded" : ""}</Pill>}
                      </div>
                      <div style={{ fontSize: 13, color: C.silver }}>with {b.trainerName} · ${b.price}</div>
                      {!past && !canResched(b.date) && <div style={{ fontSize: 12, color: C.rust, marginTop: 4 }}>⚠ Within 72hr — rescheduling unavailable</div>}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {!past && b.status !== "cancelled" && <>
                        {canResched(b.date) && <Btn small variant="sky" onClick={() => { setRescheduleItem(b); setNewDate(b.date); setNewTime(b.time); }}>Reschedule</Btn>}
                        <Btn small variant={canRefund(b.date) ? "ghost" : "danger"} onClick={() => cancelIt(b.id, b.date)}>{canRefund(b.date) ? "Cancel" : "Cancel (No Refund)"}</Btn>
                      </>}
                      {b.date < today && b.status !== "cancelled" && !b.reviewRequested && (
                        <Btn small variant="dark" onClick={() => setShowReview(b)}>⭐ Review</Btn>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {classes.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.silver, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Group Classes</div>
          <div style={{ display: "grid", gap: 12 }}>
            {classes.map(b => (
              <Card key={b.id} style={{ borderLeft: "4px solid " + C.sage }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>{b.className}</div>
                <div style={{ fontSize: 13, color: C.silver }}>{b.weeks} sessions · Starts {fmtDate(b.startDate)} · {fmt12(b.time)}</div>
                <div style={{ fontSize: 13, color: C.gold }}>with {b.trainerName} · ${b.price}</div>
                {b.waitlisted && <div style={{ marginTop: 8, background: C.sky + "22", borderRadius: 8, padding: "6px 10px", fontSize: 13, color: C.sky }}>On waitlist — we'll text you if a spot opens!</div>}
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {b.dates?.map(d => <span key={d} style={{ background: d < today ? C.fog : C.cream, borderRadius: 6, padding: "3px 9px", fontSize: 12, color: d < today ? C.silver : C.steel }}>{fmtDateShort(d)}{d < today ? " ✓" : ""}</span>)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      {sessions.length === 0 && classes.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: C.silver }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 16 }}>No bookings yet!</div>
        </div>
      )}

      {rescheduleItem && (
        <Modal title="Reschedule Session" onClose={() => setRescheduleItem(null)}>
          <div style={{ display: "grid", gap: 14 }}>
            <p style={{ color: C.steel, fontSize: 14, margin: 0 }}>Choose a new date & time with {rescheduleItem.trainerName}.</p>
            <Input label="New Date" type="date" min={today} value={newDate} onChange={e => setNewDate(e.target.value)} />
            {newDate && (
              <Sel label="New Time" value={newTime} onChange={e => setNewTime(e.target.value)}>
                <option value="">Select time…</option>
                {(() => {
                  const day = new Date(newDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
                  const key = rescheduleItem.sessionType === "facility" ? "facility" : "inHome";
                  return (schedule[rescheduleItem.trainerId]?.[key]?.[day] || []).map(t => <option key={t} value={t}>{fmt12(t)}</option>);
                })()}
              </Sel>
            )}
            <div style={{ background: C.cream, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.steel }}>✓ Free reschedule — more than 72 hours away.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setRescheduleItem(null)}>Cancel</Btn>
              <Btn disabled={!newDate || !newTime} onClick={() => { setBookings(bs => bs.map(b => b.id === rescheduleItem.id ? { ...b, date: newDate, time: newTime } : b)); setRescheduleItem(null); }}>Confirm</Btn>
            </div>
          </div>
        </Modal>
      )}

      {showReview && (
        <Modal title="Leave a Review" onClose={() => setShowReview(null)}>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
            <p style={{ color: C.steel, fontSize: 15, lineHeight: 1.7, margin: "0 0 20px" }}>We'd love your feedback! Reviews help other dog owners find Core Canine.</p>
            <Btn full variant="dark" onClick={() => { window.open(GOOGLE_REVIEW_URL, "_blank"); setBookings(bs => bs.map(b => b.id === showReview.id ? { ...b, reviewRequested: true } : b)); setShowReview(null); }}>⭐ Write a Google Review →</Btn>
            <button onClick={() => setShowReview(null)} style={{ display: "block", margin: "12px auto 0", background: "none", border: "none", color: C.silver, cursor: "pointer", fontSize: 13 }}>No thanks</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function MyAccount({ client, setClient }) {
  const [showAddDog, setShowAddDog] = useState(false);
  const [editDog, setEditDog] = useState(null);
  const [dogForm, setDogForm] = useState({ name: "", breed: "", age: "", sex: "Male", neutered: false, birthday: "", notes: "", photo: null, vaccineDoc: null });
  const photoRef = useRef();
  const docRef = useRef();

  const saveDog = () => {
    if (!dogForm.name) return;
    if (editDog) setClient(c => ({ ...c, dogs: c.dogs.map(d => d.id === editDog.id ? { ...dogForm, id: editDog.id } : d) }));
    else setClient(c => ({ ...c, dogs: [...c.dogs, { ...dogForm, id: Date.now(), age: parseInt(dogForm.age) || 0 }] }));
    setShowAddDog(false); setEditDog(null);
    setDogForm({ name: "", breed: "", age: "", sex: "Male", neutered: false, birthday: "", notes: "", photo: null, vaccineDoc: null });
  };

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", color: C.obsidian, marginBottom: 20 }}>My Account</h2>
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: "Georgia, serif", marginTop: 0, fontSize: 16 }}>Contact Info</h3>
        {[["Name", client.name], ["Email", client.email], ["Phone", client.phone], ["Waiver", client.waiverSigned ? "✓ Signed" : "Pending"]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.fog}`, fontSize: 14 }}>
            <span style={{ color: C.silver }}>{l}</span>
            <span style={{ fontWeight: 700, color: l === "Waiver" ? (client.waiverSigned ? C.sage : C.rust) : C.obsidian }}>{v}</span>
          </div>
        ))}
      </Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontFamily: "Georgia, serif", margin: 0 }}>My Dogs</h3>
        <Btn small onClick={() => { setShowAddDog(true); setEditDog(null); setDogForm({ name: "", breed: "", age: "", sex: "Male", neutered: false, birthday: "", notes: "", photo: null, vaccineDoc: null }); }}>+ Add Dog</Btn>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {client.dogs?.map(dog => (
          <Card key={dog.id}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: C.fog, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                {dog.photo ? <img src={dog.photo} alt={dog.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🐕"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{dog.name}</div>
                <div style={{ fontSize: 13, color: C.silver }}>{dog.breed} · {dog.age} yr · {dog.sex} · {dog.neutered ? "Fixed" : "Intact"}</div>
                {dog.birthday && <div style={{ fontSize: 12, color: C.gold, marginTop: 2 }}>🎂 {fmtDate(dog.birthday)}</div>}
                {dog.notes && <div style={{ fontSize: 13, color: C.steel, marginTop: 6, fontStyle: "italic", background: C.cream, borderRadius: 8, padding: "6px 10px" }}>{dog.notes}</div>}
                {dog.vaccineDoc && <div style={{ fontSize: 12, color: C.sage, marginTop: 4 }}>📎 {dog.vaccineDoc.name}</div>}
              </div>
              <Btn small variant="ghost" onClick={() => { setEditDog(dog); setDogForm({ ...dog }); setShowAddDog(true); }}>Edit</Btn>
            </div>
          </Card>
        ))}
      </div>
      {showAddDog && (
        <Modal title={editDog ? "Edit Dog" : "Add a Dog"} onClose={() => { setShowAddDog(false); setEditDog(null); }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="Name" value={dogForm.name} onChange={e => setDogForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Breed" value={dogForm.breed} onChange={e => setDogForm(f => ({ ...f, breed: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Input label="Age" type="number" value={dogForm.age} onChange={e => setDogForm(f => ({ ...f, age: e.target.value }))} />
              <Sel label="Sex" value={dogForm.sex} onChange={e => setDogForm(f => ({ ...f, sex: e.target.value }))}><option>Male</option><option>Female</option></Sel>
              <Field label="Fixed?"><label style={{ display: "flex", gap: 6, alignItems: "center", height: 42, cursor: "pointer", fontSize: 14 }}><input type="checkbox" checked={dogForm.neutered} onChange={e => setDogForm(f => ({ ...f, neutered: e.target.checked }))} />Yes</label></Field>
            </div>
            <Input label="Birthday" type="date" value={dogForm.birthday} onChange={e => setDogForm(f => ({ ...f, birthday: e.target.value }))} />
            <TextArea label="Behavioral Notes" value={dogForm.notes} onChange={e => setDogForm(f => ({ ...f, notes: e.target.value }))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Dog Photo">
                <input type="file" accept="image/*" ref={photoRef} onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = x => setDogForm(d => ({ ...d, photo: x.target.result })); r.readAsDataURL(f); } }} style={{ display: "none" }} />
                <button onClick={() => photoRef.current.click()} style={{ ...inputStyle, cursor: "pointer", textAlign: "left", background: C.white, color: dogForm.photo ? C.sage : C.silver, fontSize: 13 }}>{dogForm.photo ? "✓ Added" : "📷 Upload"}</button>
              </Field>
              <Field label="Vaccine Records">
                <input type="file" accept=".pdf,.jpg,.png" ref={docRef} onChange={e => { const f = e.target.files[0]; if (f) setDogForm(d => ({ ...d, vaccineDoc: { name: f.name } })); }} style={{ display: "none" }} />
                <button onClick={() => docRef.current.click()} style={{ ...inputStyle, cursor: "pointer", textAlign: "left", background: C.white, color: dogForm.vaccineDoc ? C.sage : C.silver, fontSize: 13 }}>{dogForm.vaccineDoc ? `✓ ${dogForm.vaccineDoc.name}` : "📎 Upload"}</button>
              </Field>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowAddDog(false)}>Cancel</Btn>
              <Btn onClick={saveDog}>Save Dog</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ClientMessages({ client, messages, setMessages, staffList }) {
  const myMessages = messages.find(m => m.clientId === client.id) || { messages: [{ id: 1, from: "trainer", text: "Hi! Welcome to Core Canine. We're excited to work with you and your dog! 🐾", time: "Today, 9:00 AM" }] };
  const [msgs, setMsgs] = useState(myMessages.messages || []);
  const [newMsg, setNewMsg] = useState("");
  const endRef = useRef();
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!newMsg.trim()) return;
    const m = { id: Date.now(), from: "client", text: newMsg.trim(), time: "Just now" };
    setMsgs(ms => [...ms, m]);
    setNewMsg("");
    setTimeout(() => {
      setMsgs(ms => [...ms, { id: Date.now() + 1, from: "trainer", text: "Thanks for your message! We'll get back to you shortly. 🐾", time: "Just now" }]);
    }, 1500);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", color: C.obsidian, marginBottom: 16 }}>Messages</h2>
      <Card style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: 460 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.fog}`, background: C.cream }}>
          <div style={{ fontWeight: 800 }}>Core Canine Training</div>
          <div style={{ fontSize: 12, color: C.silver }}>Your trainer will respond shortly</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          {msgs.map(msg => (
            <div key={msg.id} style={{ display: "flex", justifyContent: msg.from === "client" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "72%", background: msg.from === "client" ? C.obsidian : C.white, color: msg.from === "client" ? C.cream : C.obsidian, borderRadius: msg.from === "client" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.text}</div>
                <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4 }}>{msg.time}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.fog}`, display: "flex", gap: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Type a message…" value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
          <Btn onClick={send}>Send</Btn>
        </div>
      </Card>
    </div>
  );
}

function ClientHome({ client, classInstances, classTemplates, staffList, setPage }) {
  const firstName = client.name?.split(" ")[0] || "there";
  const upcoming = classInstances.filter(i => i.startDate >= today).slice(0, 2);
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, margin: 0 }}>Hi, {firstName}! 🐾</h1>
        <p style={{ color: C.silver, margin: "6px 0 0" }}>Welcome to Core Canine.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Book a Session", sub: "1-on-1 with a trainer", icon: "🎯", page: "book-session", color: C.gold },
          { label: "Enroll in a Class", sub: "Group programs", icon: "🐕", page: "book-class", color: C.sage },
          { label: "My Bookings", sub: "View & manage", icon: "📅", page: "bookings", color: C.sky },
          { label: "Messages", sub: "Chat with your trainer", icon: "💬", page: "messages", color: C.steel },
        ].map(item => (
          <Card key={item.page} onClick={() => setPage(item.page)} style={{ textAlign: "center", padding: "18px 14px" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.obsidian, lineHeight: 1.3 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: C.silver, marginTop: 3 }}>{item.sub}</div>
          </Card>
        ))}
      </div>
      {upcoming.length > 0 && <>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: C.obsidian }}>Upcoming Classes</div>
        <div style={{ display: "grid", gap: 10 }}>
          {upcoming.map(inst => {
            const tmpl = classTemplates.find(t => t.id === inst.templateId);
            const instructor = staffList.find(s => s.id === inst.instructorId);
            const enrolledCount = inst.enrolledIds?.length || inst.enrolledCount || 0;
            const spots = (tmpl?.maxDogs || 6) - enrolledCount;
            return (
              <Card key={inst.id} onClick={() => setPage("book-class")} style={{ display: "flex", gap: 14, alignItems: "center", cursor: "pointer" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🐕</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: C.obsidian }}>{tmpl?.name}</div>
                  <div style={{ fontSize: 13, color: C.silver }}>{fmtDate(inst.startDate)} · {fmt12(inst.time)} · with {instructor?.name}</div>
                  <Pill color={spots <= 2 ? C.rust : C.sage}>{spots} spots left</Pill>
                </div>
                <span style={{ color: C.silver }}>›</span>
              </Card>
            );
          })}
        </div>
      </>}
    </div>
  );
}

// ─── CLIENT PORTAL WRAPPER ────────────────────────────────────────────────────
function ClientPortal({ client, setClient, onSignOut, staff, sessions, classTemplates, classInstances, discountCodes, giftCards, messages, setMessages, schedule }) {
  const [page, setPage] = useState("home");
  const [bookings, setBookings] = useState([
    { id: 1, bookingType: "session", trainerId: 1, trainerName: "Core Canine Owner", date: "2026-04-02", time: "10:00", sessionType: "facility", price: 90, status: "confirmed" },
    { id: 2, bookingType: "class", className: "Puppy Kindergarten", trainerName: "Jessica R.", startDate: "2026-03-26", time: "18:00", weeks: 5, price: 175, status: "confirmed", waitlisted: false, dates: Array.from({ length: 5 }, (_, i) => addWeeks("2026-03-26", i)) },
  ]);

  const handleBooked = booking => {
    if (booking.type === "session") {
      setBookings(bs => [...bs, { id: Date.now(), bookingType: "session", trainerId: booking.trainer.id, trainerName: booking.trainer.name, date: booking.date, time: booking.time, sessionType: booking.sessionType, price: booking.price, status: "confirmed" }]);
    } else {
      const tmpl = classTemplates.find(t => t.id === booking.instance.templateId);
      const instructor = staff.find(s => s.id === booking.instance.instructorId);
      const enrolledCount = booking.instance.enrolledIds?.length || booking.instance.enrolledCount || 0;
      const full = (tmpl?.maxDogs || 6) - enrolledCount <= 0;
      setBookings(bs => [...bs, { id: Date.now(), bookingType: "class", className: tmpl?.name, trainerName: instructor?.name, startDate: booking.instance.startDate, time: booking.instance.time, weeks: tmpl?.weeks, price: tmpl?.price, status: "confirmed", waitlisted: full, dates: Array.from({ length: tmpl?.weeks || 1 }, (_, i) => addWeeks(booking.instance.startDate, i)) }]);
    }
    setPage("bookings");
  };

  const sharedProps = { client, discountCodes, giftCards, staffList: staff, schedule, sessions, classTemplates, classInstances };

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "Georgia, serif", paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{ background: C.obsidian, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🐾</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.cream }}>Core Canine</div>
            <div style={{ fontSize: 11, color: C.silver }}>Client Portal</div>
          </div>
        </div>
        <button onClick={onSignOut} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: C.silver, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Sign Out</button>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px" }}>
        {page === "home" && <ClientHome client={client} classInstances={classInstances} classTemplates={classTemplates} staffList={staff} setPage={setPage} />}
        {page === "book-session" && <BookSession {...sharedProps} onBack={() => setPage("home")} onBooked={handleBooked} />}
        {page === "book-class" && <BookClass {...sharedProps} onBack={() => setPage("home")} onBooked={handleBooked} />}
        {page === "bookings" && <MyBookings bookings={bookings} setBookings={setBookings} staffList={staff} schedule={schedule} />}
        {page === "messages" && <ClientMessages client={client} messages={messages} setMessages={setMessages} staffList={staff} />}
        {page === "account" && <MyAccount client={client} setClient={setClient} />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.obsidian, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-around", padding: "8px 0 10px", zIndex: 100 }}>
        {CLIENT_NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 8px", color: page === n.id ? C.gold : "rgba(255,255,255,0.4)", fontFamily: "inherit", transition: "color 0.15s" }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: page === n.id ? 800 : 400 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── STAFF PORTAL SCREENS ─────────────────────────────────────────────────────
function Dashboard({ currentUser, staff, clients, sessions, classInstances, classTemplates, messages }) {
  const mySessionsUpcoming = sessions.filter(s => (currentUser.role === "admin" || s.trainerId === currentUser.id) && s.date >= today && s.status === "confirmed").sort((a, b) => a.date > b.date ? 1 : -1);
  const myUnpaid = sessions.filter(s => (currentUser.role === "admin" || s.trainerId === currentUser.id) && !s.paid && s.status !== "cancelled");
  const unreadMessages = messages.filter(m => m.messages.some(msg => msg.from === "client" && !msg.read) && (currentUser.role === "admin" || m.trainerId === currentUser.id));
  const revenue = sessions.filter(s => s.paid && (currentUser.role === "admin" || s.trainerId === currentUser.id)).reduce((a, s) => a + s.price, 0);

  const stats = currentUser.role === "admin" ? [
    { label: "Total Clients", value: clients.length, icon: "◉", color: C.sage },
    { label: "Upcoming Sessions", value: mySessionsUpcoming.length, icon: "◎", color: C.sky },
    { label: "Unpaid Sessions", value: myUnpaid.length, icon: "◇", color: myUnpaid.length ? C.rust : C.sage },
    { label: "Unread Messages", value: unreadMessages.length, icon: "◻", color: unreadMessages.length ? C.gold : C.sage },
    { label: "Revenue Collected", value: `$${revenue.toLocaleString()}`, icon: "◆", color: C.gold },
    { label: "Active Classes", value: classInstances.filter(i => i.startDate >= today).length, icon: "◑", color: C.sky },
  ] : [
    { label: "Upcoming Sessions", value: mySessionsUpcoming.length, icon: "◎", color: C.sky },
    { label: "Unpaid Sessions", value: myUnpaid.length, icon: "◇", color: myUnpaid.length ? C.rust : C.sage },
    { label: "Unread Messages", value: unreadMessages.length, icon: "◻", color: unreadMessages.length ? C.gold : C.sage },
    { label: "My Revenue", value: `$${revenue.toLocaleString()}`, icon: "◆", color: C.gold },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: C.obsidian, margin: 0 }}>Welcome back{currentUser.role === "admin" ? "" : `, ${currentUser.firstName}`} 🐾</h1>
        <p style={{ color: C.silver, margin: "4px 0 0" }}>Core Canine · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ textAlign: "center", padding: "18px 14px" }}>
            <div style={{ fontSize: 26, color: s.color, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.obsidian, fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.silver, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <h3 style={{ fontFamily: "Georgia, serif", color: C.obsidian, marginTop: 0, fontSize: 16 }}>Upcoming Sessions</h3>
          {mySessionsUpcoming.slice(0, 5).map(s => {
            const client = clients.find(c => c.id === s.clientId);
            const trainer = staff.find(t => t.id === s.trainerId);
            return (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.fog}` }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.obsidian }}>{client?.name}</div>
                  <div style={{ fontSize: 12, color: C.silver }}>{fmtDate(s.date)} · {fmt12(s.time)}</div>
                  {currentUser.role === "admin" && <div style={{ fontSize: 11, color: C.gold }}>with {trainer?.name}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <Pill color={s.type === "facility" ? C.sage : C.gold}>{s.type === "facility" ? "Facility" : "In-Home"}</Pill>
                  {!s.paid && <Pill color={C.rust}>Unpaid</Pill>}
                </div>
              </div>
            );
          })}
          {mySessionsUpcoming.length === 0 && <p style={{ color: C.silver, fontSize: 14 }}>No upcoming sessions.</p>}
        </Card>
        <Card>
          <h3 style={{ fontFamily: "Georgia, serif", color: C.obsidian, marginTop: 0, fontSize: 16 }}>Upcoming Classes</h3>
          {classInstances.filter(i => i.startDate >= today && (currentUser.role === "admin" || i.instructorId === currentUser.id)).slice(0, 4).map(inst => {
            const tmpl = classTemplates.find(t => t.id === inst.templateId);
            const instructor = staff.find(s => s.id === inst.instructorId);
            return (
              <div key={inst.id} style={{ padding: "10px 0", borderBottom: `1px solid ${C.fog}` }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.obsidian }}>{tmpl?.name}</div>
                <div style={{ fontSize: 12, color: C.silver }}>Starts {fmtDate(inst.startDate)} · {fmt12(inst.time)} · {tmpl?.weeks} wks</div>
                <div style={{ fontSize: 12, color: C.gold, marginTop: 2 }}>
                  {inst.enrolledIds.length}/{tmpl?.maxDogs} enrolled
                  {currentUser.role === "admin" && ` · ${instructor?.name}`}
                  {tmpl?.waitlistEnabled && inst.waitlist?.length > 0 && ` · ${inst.waitlist.length} on waitlist`}
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ─── CALENDAR VIEW ────────────────────────────────────────────────────────────
// ─── CLIENT DETAIL MODAL (shared by Sessions + CalendarView) ─────────────────
function ClientDetailModal({ client, sessions, dogNotes, setDogNotes, currentUser, onClose }) {
  const [activeTab, setActiveTab] = useState("info");

  const addNote = (dogId, text) => {
    if (!text.trim()) return;
    setDogNotes(prev => ({ ...prev, [dogId]: [...(prev[dogId] || []), { id: Date.now(), trainerId: currentUser.id, date: today, text }] }));
  };

  if (!client) return null;
  return (
    <Modal title={client.name} onClose={onClose} wide>
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: C.silver, fontSize: 13 }}>📧 {client.email} · 📞 {client.phone}</div>
        <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
          {client.waiverSigned ? <Pill color={C.sage}>✓ Waiver Signed</Pill> : <Pill color={C.rust}>Waiver Pending</Pill>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: `1px solid ${C.fog}`, paddingBottom: 12 }}>
        {["info", "dogs", "notes", "history"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, textTransform: "capitalize", background: activeTab === t ? C.obsidian : C.fog, color: activeTab === t ? C.cream : C.charcoal }}>{t}</button>
        ))}
      </div>
      {activeTab === "info" && (
        <div style={{ display: "grid", gap: 10 }}>
          {[["Name", client.name], ["Phone", client.phone], ["Email", client.email], ["Joined", fmtDate(client.joinDate)], ["Waiver", client.waiverSigned ? "Signed" : "Not signed"]].map(([l, v]) => (
            <div key={l}><b style={{ color: C.obsidian }}>{l}:</b> <span style={{ color: C.steel }}>{v}</span></div>
          ))}
        </div>
      )}
      {activeTab === "dogs" && (
        <div style={{ display: "grid", gap: 16 }}>
          {client.dogs?.map(dog => (
            <div key={dog.id} style={{ background: C.cream, borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>🐕 {dog.name}</div>
              <div style={{ fontSize: 13, color: C.silver }}>{dog.breed} · {dog.age} {dog.ageUnit || "yr"} · {dog.sex} · {dog.neutered ? "Fixed" : "Intact"}</div>
              {dog.birthday && <div style={{ fontSize: 12, color: C.gold, marginTop: 2 }}>🎂 {fmtDate(dog.birthday)}</div>}
              {dog.notes && <div style={{ fontSize: 13, color: C.steel, marginTop: 6, fontStyle: "italic", background: C.white, borderRadius: 8, padding: "8px 12px" }}>{dog.notes}</div>}
            </div>
          ))}
        </div>
      )}
      {activeTab === "notes" && (
        <div>
          <p style={{ fontSize: 13, color: C.silver, marginTop: 0 }}>Trainer-only notes. Clients never see these.</p>
          {client.dogs?.map(dog => {
            const notes = dogNotes[dog.id] || [];
            const [newNote, setNewNote] = useState("");
            return (
              <div key={dog.id} style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: C.obsidian, marginBottom: 8 }}>🐕 {dog.name}</div>
                <div style={{ background: C.cream, borderRadius: 10, padding: 14, minHeight: 60, marginBottom: 10 }}>
                  {notes.length === 0 && <span style={{ color: C.silver, fontSize: 13 }}>No notes yet.</span>}
                  {notes.map(n => (
                    <div key={n.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.fog}` }}>
                      <div style={{ fontSize: 11, color: C.silver, marginBottom: 2 }}>{fmtDate(n.date)}</div>
                      <div style={{ fontSize: 14, color: C.obsidian }}>{n.text}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="Add a note…" value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { addNote(dog.id, newNote); setNewNote(""); } }} />
                  <Btn small onClick={() => { addNote(dog.id, newNote); setNewNote(""); }}>Add</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {activeTab === "history" && (
        <div>
          {sessions.filter(s => s.clientId === client.id).sort((a, b) => b.date > a.date ? 1 : -1).map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.fog}` }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.obsidian }}>{fmtDate(s.date)} · {fmt12(s.time)}</div>
                <div style={{ fontSize: 12, color: C.silver }}>{getSessionType(s.sessionType)?.label || s.sessionType} · {s.duration} min · ${s.price}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Pill color={s.paid ? C.sage : C.rust}>{s.paid ? "Paid" : "Unpaid"}</Pill>
                {s.status === "completed" && <Pill color={C.sky}>Done</Pill>}
              </div>
            </div>
          ))}
          {sessions.filter(s => s.clientId === client.id).length === 0 && <p style={{ color: C.silver, fontSize: 13 }}>No session history.</p>}
        </div>
      )}
    </Modal>
  );
}

function CalendarView({ currentUser, staff, clients, sessions, classInstances, classTemplates, blockedDates, setBlockedDates, dogNotes, setDogNotes }) {
  const [view, setView] = useState("week");
  const [anchor, setAnchor] = useState(today); // "YYYY-MM-DD" reference date
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [showIcalModal, setShowIcalModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const isAdmin = currentUser.role === "admin";

  // ── date math helpers ──────────────────────────────────────────────────────
  const addDays = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const startOfWeek = ds => { const d = new Date(ds + "T12:00:00"); const dow = d.getDay(); const diff = dow === 0 ? -6 : 1 - dow; d.setDate(d.getDate() + diff); return d.toISOString().slice(0, 10); };
  const startOfMonth = ds => ds.slice(0, 8) + "01";
  const daysInMonth = ds => new Date(parseInt(ds.slice(0, 4)), parseInt(ds.slice(5, 7)), 0).getDate();
  const weekDays = () => { const s = startOfWeek(anchor); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); };
  const monthDays = () => {
    const s = startOfMonth(anchor);
    const first = new Date(s + "T12:00:00").getDay(); // 0=Sun
    const blanks = first === 0 ? 6 : first - 1; // shift so Mon=0
    const total = daysInMonth(anchor);
    return { blanks, total, start: s };
  };
  const dayLabel = ds => new Date(ds + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const monthLabel = ds => new Date(ds + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const shortDay = ds => new Date(ds + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
  const dateNum = ds => new Date(ds + "T12:00:00").getDate();
  const isToday = ds => ds === today;

  // ── navigation ─────────────────────────────────────────────────────────────
  const prev = () => {
    if (view === "day")   setAnchor(a => addDays(a, -1));
    if (view === "week")  setAnchor(a => addDays(startOfWeek(a), -7));
    if (view === "month") setAnchor(a => { const d = new Date(a + "T12:00:00"); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); });
  };
  const next = () => {
    if (view === "day")   setAnchor(a => addDays(a, 1));
    if (view === "week")  setAnchor(a => addDays(startOfWeek(a), 7));
    if (view === "month") setAnchor(a => { const d = new Date(a + "T12:00:00"); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 10); });
  };

  // ── title ──────────────────────────────────────────────────────────────────
  const title = () => {
    if (view === "day") return dayLabel(anchor);
    if (view === "week") { const days = weekDays(); return `${fmtDateShort(days[0])} – ${fmtDateShort(days[6])}`; }
    return monthLabel(anchor);
  };

  // ── events builder ─────────────────────────────────────────────────────────
  const getEventsForDate = ds => {
    const events = [];
    const mySessions = isAdmin ? sessions : sessions.filter(s => s.trainerId === currentUser.id);
    mySessions.filter(s => s.date === ds && s.status !== "cancelled").forEach(s => {
      const client = clients.find(c => c.id === s.clientId);
      const trainer = staff.find(t => t.id === s.trainerId);
      const st = getSessionType(s.sessionType);
      events.push({
        key: `s-${s.id}`, time: s.time, label: client?.name || "Session",
        sub: isAdmin ? `${trainer?.firstName || trainer?.name} · ${st.label}` : st.label,
        color: st.location === "facility" ? C.sage : C.gold, kind: "session",
        clientId: s.clientId,
        isInHome: st.location === "in-home",
        address: client?.address || "",
        phone: client?.phone || ""
      });
    });
    classInstances.filter(ci => {
      const weeks = classTemplates.find(t => t.id === ci.templateId)?.weeks || 1;
      for (let w = 0; w < weeks; w++) { if (addDays(ci.startDate, w * 7) === ds) return true; }
      return false;
    }).forEach(ci => {
      const tmpl = classTemplates.find(t => t.id === ci.templateId);
      const trainer = staff.find(t => t.id === ci.instructorId);
      if (isAdmin || ci.instructorId === currentUser.id) {
        events.push({
          key: `c-${ci.id}-${ds}`, time: ci.time, label: tmpl?.name || "Class",
          sub: isAdmin ? `${trainer?.firstName || trainer?.name} · ${ci.enrolledIds.length} enrolled` : `${ci.enrolledIds.length} enrolled`,
          color: C.sky, kind: "class"
        });
      }
    });
    // blocked dates
    (isAdmin ? blockedDates : blockedDates.filter(b => b.trainerId === currentUser.id))
      .filter(b => ds >= b.startDate && ds <= b.endDate)
      .forEach(b => {
        const trainer = staff.find(t => t.id === b.trainerId);
        events.push({
          key: `b-${b.id}-${ds}`, time: "00:00", label: isAdmin ? `${trainer?.firstName || trainer?.name}: Time Off` : "Time Off",
          sub: b.reason || "", color: C.steel, kind: "block"
        });
      });
    return events.sort((a, b) => a.time.localeCompare(b.time));
  };

  // ── event pill ─────────────────────────────────────────────────────────────
  const EventPill = ({ ev, compact }) => {
    const clickable = ev.kind === "session" && ev.clientId;
    const handleClick = (e) => {
      if (!clickable) return;
      e.stopPropagation();
      const c = clients.find(cl => cl.id === ev.clientId);
      if (c) setSelectedClient(c);
    };
    return (
      <div onClick={handleClick} style={{ background: ev.color + (ev.kind === "block" ? "30" : "22"), borderLeft: `3px solid ${ev.color}`, borderRadius: 6, padding: compact ? "2px 6px" : "4px 8px", marginBottom: 3, overflow: "hidden", cursor: clickable ? "pointer" : "default" }}>
        <div style={{ fontSize: compact ? 10 : 12, fontWeight: 800, color: ev.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {ev.kind !== "block" && <span style={{ opacity: 0.8 }}>{fmt12(ev.time)} </span>}{ev.label}{clickable && !compact ? <span style={{ opacity: 0.5, fontSize: 9 }}> ›</span> : ""}
        </div>
        {!compact && ev.sub && <div style={{ fontSize: 10, color: C.steel, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.sub}</div>}
      {!compact && ev.isInHome && ev.address && <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📍 {ev.address}</div>}
      {!compact && ev.isInHome && ev.phone && <div style={{ fontSize: 10, color: C.steel, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📞 {ev.phone}</div>}
      </div>
    );
  };

  // ── iCal export ────────────────────────────────────────────────────────────
  const exportICal = () => {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Core Canine//App//EN", "CALSCALE:GREGORIAN"];
    const fmtIcal = (ds, ts) => {
      const [y, mo, d] = ds.split("-"); const [h, m] = (ts || "00:00").split(":");
      return `${y}${mo}${d}T${h}${m}00`;
    };
    const mySessions = isAdmin ? sessions : sessions.filter(s => s.trainerId === currentUser.id);
    mySessions.filter(s => s.status !== "cancelled").forEach(s => {
      const client = clients.find(c => c.id === s.clientId);
      const st = getSessionType(s.sessionType);
      lines.push("BEGIN:VEVENT",
        `UID:session-${s.id}@corecanine`,
        `DTSTART:${fmtIcal(s.date, s.time)}`,
        `DURATION:PT${s.duration || 90}M`,
        `SUMMARY:${client?.name || "Client"} – ${st.label}`,
        `DESCRIPTION:${client?.name || "Client"} · 📞 ${client?.phone || ""}\n$${s.price} · ${s.paid ? "Paid" : "Unpaid"}${st.location === "in-home" && client?.address ? "\n📍 " + client.address : ""}`,
        ...(st.location === "in-home" && client?.address ? [`LOCATION:${client.address}`] : []),
        "END:VEVENT");
    });
    classInstances.forEach(ci => {
      if (!isAdmin && ci.instructorId !== currentUser.id) return;
      const tmpl = classTemplates.find(t => t.id === ci.templateId);
      const weeks = tmpl?.weeks || 1;
      lines.push("BEGIN:VEVENT",
        `UID:class-${ci.id}@corecanine`,
        `DTSTART:${fmtIcal(ci.startDate, ci.time)}`,
        `DURATION:PT${ci.duration || 60}M`,
        `RRULE:FREQ=WEEKLY;COUNT=${weeks}`,
        `SUMMARY:${tmpl?.name || "Class"} (${ci.enrolledIds.length} enrolled)`,
        "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "core-canine-schedule.ics"; a.click();
    URL.revokeObjectURL(url);
    setShowIcalModal(false);
  };

  // ── block form save ────────────────────────────────────────────────────────
  const saveBlock = () => {
    if (!blockForm.startDate) return;
    const end = blockForm.endDate || blockForm.startDate;
    setBlockedDates(bs => [...bs, { id: Date.now(), trainerId: currentUser.id, startDate: blockForm.startDate, endDate: end, reason: blockForm.reason }]);
    setBlockForm({ startDate: "", endDate: "", reason: "" });
    setShowBlockModal(false);
  };

  const myBlocks = isAdmin ? blockedDates : blockedDates.filter(b => b.trainerId === currentUser.id);

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, margin: 0 }}>Calendar</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn variant="ghost" small onClick={() => setShowBlockModal(true)}>🚫 Block Time</Btn>
          <Btn variant="ghost" small onClick={() => setShowIcalModal(true)}>📆 Export to Apple Calendar</Btn>
        </div>
      </div>

      {/* View switcher + navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["day", "week", "month"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, textTransform: "capitalize", background: view === v ? C.obsidian : C.fog, color: view === v ? C.cream : C.charcoal }}>{v}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={prev} style={{ background: C.fog, border: "none", borderRadius: 8, padding: "7px 13px", cursor: "pointer", fontWeight: 800, fontSize: 14 }}>‹</button>
          <span style={{ fontWeight: 700, fontSize: 14, color: C.obsidian, minWidth: 180, textAlign: "center" }}>{title()}</span>
          <button onClick={next} style={{ background: C.fog, border: "none", borderRadius: 8, padding: "7px 13px", cursor: "pointer", fontWeight: 800, fontSize: 14 }}>›</button>
          <button onClick={() => setAnchor(today)} style={{ background: C.gold + "22", border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12, color: C.gold }}>Today</button>
        </div>
      </div>

      {/* DAY VIEW */}
      {view === "day" && (() => {
        const events = getEventsForDate(anchor);
        return (
          <Card>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.obsidian, marginBottom: 14, borderBottom: `1px solid ${C.fog}`, paddingBottom: 10 }}>{dayLabel(anchor)}</div>
            {events.length === 0
              ? <p style={{ color: C.silver, fontStyle: "italic" }}>No sessions or classes scheduled.</p>
              : events.map(ev => <EventPill key={ev.key} ev={ev} />)}
          </Card>
        );
      })()}

      {/* WEEK VIEW */}
      {view === "week" && (() => {
        const days = weekDays();
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {days.map(ds => {
              const events = getEventsForDate(ds);
              return (
                <div key={ds} onClick={() => { setAnchor(ds); setView("day"); }} style={{ background: isToday(ds) ? C.gold + "12" : C.white, borderRadius: 12, padding: "10px 8px", cursor: "pointer", border: `1.5px solid ${isToday(ds) ? C.gold : C.fog}`, minHeight: 100 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: isToday(ds) ? C.gold : C.silver, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{shortDay(ds)}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: isToday(ds) ? C.gold : C.obsidian, marginBottom: 6 }}>{dateNum(ds)}</div>
                  {events.slice(0, 3).map(ev => <EventPill key={ev.key} ev={ev} compact />)}
                  {events.length > 3 && <div style={{ fontSize: 10, color: C.silver, fontWeight: 700, marginTop: 2 }}>+{events.length - 3} more</div>}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* MONTH VIEW */}
      {view === "month" && (() => {
        const { blanks, total, start } = monthDays();
        const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
              {DAY_HEADERS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: C.silver, textTransform: "uppercase", padding: "6px 0" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {Array.from({ length: blanks }).map((_, i) => <div key={`b${i}`} />)}
              {Array.from({ length: total }, (_, i) => {
                const ds = addDays(start, i);
                const events = getEventsForDate(ds);
                return (
                  <div key={ds} onClick={() => { setAnchor(ds); setView("day"); }} style={{ background: isToday(ds) ? C.gold + "12" : C.white, border: `1.5px solid ${isToday(ds) ? C.gold : C.fog}`, borderRadius: 8, padding: "6px 5px", minHeight: 72, cursor: "pointer" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: isToday(ds) ? C.gold : C.obsidian, marginBottom: 3 }}>{dateNum(ds)}</div>
                    {events.slice(0, 2).map(ev => <EventPill key={ev.key} ev={ev} compact />)}
                    {events.length > 2 && <div style={{ fontSize: 9, color: C.silver, fontWeight: 700 }}>+{events.length - 2}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Client detail modal */}
      {selectedClient && <ClientDetailModal client={selectedClient} sessions={sessions} dogNotes={dogNotes} setDogNotes={setDogNotes} currentUser={currentUser} onClose={() => setSelectedClient(null)} />}

      {/* Blocked dates list */}
      {myBlocks.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: C.silver, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Time-Off Blocks</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {myBlocks.map(b => {
              const trainer = staff.find(t => t.id === b.trainerId);
              return (
                <div key={b.id} style={{ background: C.fog, borderRadius: 10, padding: "8px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.obsidian }}>
                      {isAdmin && <span style={{ color: C.gold }}>{trainer?.firstName || trainer?.name}: </span>}
                      {b.startDate === b.endDate ? fmtDate(b.startDate) : `${fmtDate(b.startDate)} – ${fmtDate(b.endDate)}`}
                    </div>
                    {b.reason && <div style={{ fontSize: 12, color: C.steel, fontStyle: "italic" }}>{b.reason}</div>}
                  </div>
                  {(isAdmin || b.trainerId === currentUser.id) && (
                    <button onClick={() => setBlockedDates(bs => bs.filter(x => x.id !== b.id))} style={{ background: "none", border: "none", color: C.rust, cursor: "pointer", fontWeight: 800, fontSize: 14 }}>✕</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Block Time modal */}
      {showBlockModal && (
        <Modal title="Block Time Off" onClose={() => setShowBlockModal(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <p style={{ color: C.steel, fontSize: 13, margin: 0 }}>Clients won't see available slots during blocked dates — no "out of office" message is shown to them.</p>
            {isAdmin && (
              <Sel label="Block for" value={blockForm.trainerId || ""} onChange={e => setBlockForm(f => ({ ...f, trainerId: e.target.value || currentUser.id }))}>
                <option value="">Myself ({currentUser.name})</option>
                {staff.filter(s => s.active && s.id !== currentUser.id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Sel>
            )}
            <Input label="Start Date" type="date" value={blockForm.startDate} onChange={e => setBlockForm(f => ({ ...f, startDate: e.target.value }))} />
            <Input label="End Date" hint="Same as start date for a single day" type="date" value={blockForm.endDate} onChange={e => setBlockForm(f => ({ ...f, endDate: e.target.value }))} />
            <Input label="Internal note (optional — not shown to clients)" value={blockForm.reason} placeholder="Vacation, conference, sick day…" onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowBlockModal(false)}>Cancel</Btn>
              <Btn onClick={saveBlock}>Save Block</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* iCal export modal */}
      {showIcalModal && (
        <Modal title="Export to Apple Calendar" onClose={() => setShowIcalModal(false)}>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ background: C.cream, borderRadius: 10, padding: "14px 16px", fontSize: 13, color: C.steel, lineHeight: 1.7 }}>
              <b style={{ color: C.obsidian }}>What's included:</b><br />
              {isAdmin ? "All sessions and classes across all trainers." : "Your sessions and classes only."}<br /><br />
              <b style={{ color: C.obsidian }}>How to import:</b><br />
              1. Tap Export to download the .ics file<br />
              2. Open it on your iPhone — Calendar will offer to import<br />
              3. Or on Mac: double-click the file to add to Calendar
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowIcalModal(false)}>Cancel</Btn>
              <Btn onClick={exportICal}>📆 Export .ics File</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ScheduleManager({ currentUser, schedule, setSchedule, oneOffSlots, setOneOffSlots }) {
  const [activeType, setActiveType] = useState("facility");
  const [showOneOff, setShowOneOff] = useState(false);
  const [oneOffForm, setOneOffForm] = useState({ date: "", time: "", type: "facility" });

  const key = activeType === "facility" ? "facility" : "inHome";
  const mySchedule = schedule[currentUser.id] || { facility: {}, inHome: {} };
  const myOneOffs = oneOffSlots.filter(s => s.trainerId === currentUser.id);

  const toggle = (day, time) => {
    setSchedule(prev => {
      const curr = (prev[currentUser.id]?.[key]?.[day]) || [];
      const next = curr.includes(time) ? curr.filter(t => t !== time) : [...curr, time].sort();
      return { ...prev, [currentUser.id]: { ...prev[currentUser.id], [key]: { ...(prev[currentUser.id]?.[key] || {}), [day]: next } } };
    });
  };

  const addOneOff = () => {
    if (!oneOffForm.date || !oneOffForm.time) return;
    setOneOffSlots(prev => [...prev, { id: Date.now(), trainerId: currentUser.id, ...oneOffForm }]);
    setOneOffForm({ date: "", time: "", type: "facility" });
    setShowOneOff(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, margin: 0 }}>My Availability</h1>
          <p style={{ color: C.silver, margin: "4px 0 0", fontSize: 14 }}>Set recurring weekly slots clients can book.</p>
        </div>
        <Btn onClick={() => setShowOneOff(true)} variant="ghost">+ Add One-Off Slot</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["facility", "🏠 Facility"], ["in-home", "🚗 In-Home"]].map(([t, l]) => (
          <button key={t} onClick={() => setActiveType(t)} style={{ padding: "8px 20px", borderRadius: 30, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: activeType === t ? (t === "facility" ? C.sage : C.gold) : C.fog, color: activeType === t ? "#fff" : C.charcoal, transition: "all 0.15s" }}>{l}</button>
        ))}
      </div>
      <Card style={{ overflowX: "auto", padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.cream }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: C.silver, textTransform: "uppercase", letterSpacing: 0.8 }}>Time</th>
              {DAYS.map(d => <th key={d} style={{ padding: "12px 8px", textAlign: "center", fontSize: 12, fontWeight: 800, color: C.obsidian }}>{d.slice(0, 3).toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {TIMES_24.map((time, ri) => (
              <tr key={time} style={{ background: ri % 2 === 0 ? C.white : C.cream }}>
                <td style={{ padding: "6px 16px", fontSize: 13, color: C.silver, whiteSpace: "nowrap" }}>{fmt12(time)}</td>
                {DAYS.map(day => {
                  const on = (mySchedule[key]?.[day] || []).includes(time);
                  return (
                    <td key={day} style={{ padding: "5px 8px", textAlign: "center" }}>
                      <button onClick={() => toggle(day, time)} style={{ width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, transition: "all 0.12s", background: on ? (activeType === "facility" ? C.sage : C.gold) : "#ECEAE4", color: on ? "#fff" : C.silver }}>{on ? "✓" : ""}</button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {myOneOffs.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontFamily: "Georgia, serif", color: C.obsidian, marginBottom: 12 }}>One-Off Available Slots</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {myOneOffs.map(s => (
              <div key={s.id} style={{ background: C.cream, borderRadius: 10, padding: "8px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.obsidian }}>{fmtDate(s.date)} · {fmt12(s.time)}</span>
                <Pill color={s.type === "facility" ? C.sage : C.gold}>{s.type}</Pill>
                <button onClick={() => setOneOffSlots(p => p.filter(x => x.id !== s.id))} style={{ background: "none", border: "none", color: C.rust, cursor: "pointer", fontWeight: 800 }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {showOneOff && (
        <Modal title="Add One-Off Available Slot" onClose={() => setShowOneOff(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <Input label="Date" type="date" value={oneOffForm.date} onChange={e => setOneOffForm(f => ({ ...f, date: e.target.value }))} />
            <Input label="Time" type="time" value={oneOffForm.time} onChange={e => setOneOffForm(f => ({ ...f, time: e.target.value }))} />
            <Sel label="Session Type" value={oneOffForm.type} onChange={e => setOneOffForm(f => ({ ...f, type: e.target.value }))}>
              <option value="facility">🏠 Facility</option>
              <option value="in-home">🚗 In-Home</option>
            </Sel>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowOneOff(false)}>Cancel</Btn>
              <Btn onClick={addOneOff}>Add Slot</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Sessions({ currentUser, staff, clients, sessions, setSessions, schedule, oneOffSlots, dogNotes, setDogNotes }) {
  const [filter, setFilter] = useState("upcoming");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ clientId: "", trainerId: "", date: "", time: "", type: "facility", duration: 60, price: 90, notes: "", paid: false });
  const [reminderSent, setReminderSent] = useState([]);
  const [reviewSent, setReviewSent] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const mine = sessions.filter(s => currentUser.role === "admin" || s.trainerId === currentUser.id);
  const filtered = mine.filter(s => {
    if (filter === "upcoming") return s.date >= today && s.status !== "cancelled";
    if (filter === "past") return s.date < today || s.status === "completed";
    if (filter === "unpaid") return !s.paid && s.status !== "cancelled";
    if (filter === "cancelled") return s.status === "cancelled";
    return true;
  }).sort((a, b) => filter === "past" ? b.date > a.date ? 1 : -1 : a.date > b.date ? 1 : -1);

  const getAvailTimes = () => {
    if (!form.date || !form.trainerId) return TIMES_24;
    const d = new Date(form.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
    const st = getSessionType(form.sessionType);
    const key = st.location === "facility" ? "facility" : "inHome";
    const recurring = schedule[form.trainerId]?.[key]?.[d] || [];
    const oneOffs = oneOffSlots.filter(s => s.trainerId === parseInt(form.trainerId) && s.date === form.date).map(s => s.time);
    return [...new Set([...recurring, ...oneOffs])].sort();
  };

  const save = () => {
    if (!form.clientId || !form.date || !form.time) return;
    const st = getSessionType(form.sessionType);
    const entry = { ...form, clientId: parseInt(form.clientId), trainerId: parseInt(form.trainerId), price: parseFloat(form.price), duration: parseInt(form.duration) || st.duration, status: "confirmed" };
    if (editItem) setSessions(ss => ss.map(s => s.id === editItem.id ? { ...entry, id: editItem.id } : s));
    else setSessions(ss => [...ss, { ...entry, id: Date.now() }]);
    setShowModal(false);
  };

  const availTrainers = currentUser.role === "admin" ? staff.filter(s => s.active && s.services.includes("private")) : [currentUser];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, margin: 0 }}>Private Sessions</h1>
        <Btn onClick={() => { setEditItem(null); setForm({ clientId: "", trainerId: String(currentUser.id), date: "", time: "", sessionType: "initial-facility", duration: 90, price: "", notes: "", paid: false }); setShowModal(true); }}>+ Book Session</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["upcoming", "past", "unpaid", "cancelled", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, textTransform: "capitalize", background: filter === f ? C.obsidian : C.fog, color: filter === f ? C.cream : C.charcoal }}>{f}</button>
        ))}
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(s => {
          const client = clients.find(c => c.id === s.clientId);
          const trainer = staff.find(t => t.id === s.trainerId);
          const st = getSessionType(s.sessionType);
          return (
            <Card key={s.id} style={{ borderLeft: `4px solid ${s.status === "cancelled" ? C.silver : st.location === "facility" ? C.sage : C.gold}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                    <span onClick={() => client && setSelectedClient(client)} style={{ fontWeight: 800, fontSize: 15, color: C.obsidian, cursor: client ? "pointer" : "default", textDecoration: client ? "underline" : "none", textDecorationColor: C.gold, textUnderlineOffset: 3 }}>{client?.name}</span>
                    <Pill color={st.location === "facility" ? C.sage : C.gold}>{st.label}</Pill>
                    <Pill color={s.paid ? C.sage : C.rust}>{s.paid ? "Paid" : "Unpaid"}</Pill>
                    {s.status === "cancelled" && <Pill color={C.silver}>Cancelled</Pill>}
                    {s.status === "completed" && <Pill color={C.sky}>Completed</Pill>}
                  </div>
                  <div style={{ fontSize: 13, color: C.silver }}>{fmtDate(s.date)} · {fmt12(s.time)} · {s.duration} min · <b style={{ color: C.obsidian }}>${s.price}</b></div>
                  {currentUser.role === "admin" && <div style={{ fontSize: 12, color: C.gold, marginTop: 2 }}>Trainer: {trainer?.name}</div>}
                  {s.notes && <div style={{ fontSize: 12, color: C.steel, marginTop: 4, fontStyle: "italic" }}>📝 {s.notes}</div>}
                  <div style={{ fontSize: 12, color: C.silver, marginTop: 2 }}>🐕 {client?.dogs?.map(d => d.name).join(", ")}</div>
                  {st.location === "in-home" && client?.address && <div style={{ fontSize: 12, color: C.gold, marginTop: 3, fontWeight: 700 }}>📍 {client.address}</div>}
                  {st.location === "in-home" && client?.phone && <div style={{ fontSize: 12, color: C.steel, marginTop: 1 }}>📞 {client.phone}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                  {s.status !== "cancelled" && <>
                    <Btn small variant={s.paid ? "ghost" : "sage"} onClick={() => setSessions(ss => ss.map(x => x.id === s.id ? { ...x, paid: !x.paid } : x))}>{s.paid ? "Mark Unpaid" : "✓ Mark Paid"}</Btn>
                    {s.status !== "completed" && <Btn small variant="ghost" onClick={() => setSessions(ss => ss.map(x => x.id === s.id ? { ...x, status: "completed" } : x))}>Complete</Btn>}
                    <Btn small variant="ghost" onClick={() => { setEditItem(s); setForm({ ...s, clientId: String(s.clientId), trainerId: String(s.trainerId) }); setShowModal(true); }}>Edit</Btn>
                    <Btn small variant={reminderSent.includes(s.id) ? "ghost" : "sky"} onClick={() => setReminderSent(p => [...p, s.id])} disabled={reminderSent.includes(s.id)}>{reminderSent.includes(s.id) ? "✓ Reminded" : "📱 Remind"}</Btn>
                    {s.status === "completed" && <Btn small variant={reviewSent.includes(s.id) ? "ghost" : "dark"} onClick={() => setReviewSent(p => [...p, s.id])} disabled={reviewSent.includes(s.id)}>{reviewSent.includes(s.id) ? "✓ Review Sent" : "⭐ Request Review"}</Btn>}
                    <Btn small variant="danger" onClick={() => { if (window.confirm("Cancel this session?")) setSessions(ss => ss.map(x => x.id === s.id ? { ...x, status: "cancelled" } : x)); }}>Cancel</Btn>
                  </>}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p style={{ color: C.silver }}>No sessions found.</p>}
      </div>

      {selectedClient && <ClientDetailModal client={selectedClient} sessions={sessions} dogNotes={dogNotes} setDogNotes={setDogNotes} currentUser={currentUser} onClose={() => setSelectedClient(null)} />}

      {showModal && (
        <Modal title={editItem ? "Edit Session" : "Book Private Session"} onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <Sel label="Client" value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} — 🐕 {c.dogs.map(d => d.name).join(", ")}</option>)}
            </Sel>
            {currentUser.role === "admin" && (
              <Sel label="Trainer" value={form.trainerId} onChange={e => setForm(f => ({ ...f, trainerId: e.target.value, time: "" }))}>
                <option value="">Select trainer…</option>
                {availTrainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Sel>
            )}
            <Sel label="Session Type" value={form.sessionType} onChange={e => setForm(f => ({ ...f, sessionType: e.target.value, time: "", duration: getSessionType(e.target.value).duration, price: "" }))}>
              {SESSION_TYPES.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
            </Sel>
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value, time: "" }))} />
            <Sel label="Available Time (from trainer schedule)" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}>
              <option value="">Select time…</option>
              {getAvailTimes().map(t => <option key={t} value={t}>{fmt12(t)}</option>)}
            </Sel>
            <Input label="Custom time override" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} hint="You can type any time — not limited to schedule slots" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Duration (min)" type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              <Input label="Price ($)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} hint="Leave blank or 0 for complimentary" />
            </div>
            <TextArea label="Session Notes (trainer-only)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: 14, color: C.obsidian }}>
              <input type="checkbox" checked={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.checked }))} />
              Mark as Paid
            </label>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn onClick={save}>Save Session</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Classes({ currentUser, staff, clients, classTemplates, setClassTemplates, classInstances, setClassInstances }) {
  const [view, setView] = useState("instances");
  const [showTmplModal, setShowTmplModal] = useState(false);
  const [showInstModal, setShowInstModal] = useState(false);
  const [editTmpl, setEditTmpl] = useState(null);
  const [rosterInst, setRosterInst] = useState(null);
  const [tmplForm, setTmplForm] = useState({ name: "", weeks: 4, maxDogs: 6, price: 150, description: "", waitlistEnabled: false });
  const [instForm, setInstForm] = useState({ templateId: "", instructorId: String(currentUser.id), startDate: "", time: "" });

  const saveTmpl = () => {
    if (!tmplForm.name) return;
    if (editTmpl) setClassTemplates(ts => ts.map(t => t.id === editTmpl.id ? { ...tmplForm, id: editTmpl.id } : t));
    else setClassTemplates(ts => [...ts, { ...tmplForm, id: Date.now(), weeks: parseInt(tmplForm.weeks), maxDogs: parseInt(tmplForm.maxDogs), price: parseFloat(tmplForm.price) }]);
    setShowTmplModal(false);
  };

  const scheduleInstance = () => {
    if (!instForm.templateId || !instForm.startDate || !instForm.time) return;
    setClassInstances(is => [...is, { ...instForm, id: Date.now(), templateId: parseInt(instForm.templateId), instructorId: parseInt(instForm.instructorId), enrolledIds: [], waitlist: [] }]);
    setShowInstModal(false);
  };

  const toggleEnroll = (instId, clientId) => {
    setClassInstances(is => is.map(inst => {
      if (inst.id !== instId) return inst;
      const tmpl = classTemplates.find(t => t.id === inst.templateId);
      const enrolled = inst.enrolledIds.includes(clientId);
      if (!enrolled && inst.enrolledIds.length >= (tmpl?.maxDogs || 6)) {
        if (tmpl?.waitlistEnabled) return { ...inst, waitlist: [...(inst.waitlist || []), clientId] };
        alert("Class is full and no waitlist is enabled."); return inst;
      }
      return { ...inst, enrolledIds: enrolled ? inst.enrolledIds.filter(i => i !== clientId) : [...inst.enrolledIds, clientId], waitlist: (inst.waitlist || []).filter(i => i !== clientId) };
    }));
  };

  const printRoster = inst => {
    const tmpl = classTemplates.find(t => t.id === inst.templateId);
    const instructor = staff.find(s => s.id === inst.instructorId);
    const enrolled = clients.filter(c => inst.enrolledIds.includes(c.id));
    const sessionDates = Array.from({ length: tmpl?.weeks || 1 }, (_, i) => addWeeks(inst.startDate, i));
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>${tmpl?.name} Roster</title><style>body{font-family:Georgia,serif;padding:40px;max-width:720px;margin:auto}h1{border-bottom:3px solid #C9933A;padding-bottom:12px}.client{margin-bottom:20px;padding:14px;border:1px solid #E8E4DC;border-radius:8px}@media print{button{display:none}}</style></head><body>
    <h1>🐾 ${tmpl?.name}</h1>
    <p>Starts ${fmtDate(inst.startDate)} · ${fmt12(inst.time)} · Instructor: ${instructor?.name}</p>
    <p><b>All Dates:</b> ${sessionDates.map(d => fmtDate(d)).join(" · ")}</p>
    <b>Enrolled (${enrolled.length}/${tmpl?.maxDogs}):</b>
    ${enrolled.map((c, i) => `<div class="client"><b>${i + 1}. ${c.name}</b><br><small>${c.email} · ${c.phone}</small>${c.dogs.map(d => `<br>🐕 ${d.name} — ${d.breed}${d.notes ? `: "${d.notes}"` : ""}`).join("")}</div>`).join("")}
    <br><button onclick="window.print()">🖨️ Print</button></body></html>`);
    win.document.close();
  };

  const myInstances = classInstances.filter(i => currentUser.role === "admin" || i.instructorId === currentUser.id);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, margin: 0 }}>Group Classes</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {currentUser.role === "admin" && <Btn variant="ghost" onClick={() => { setEditTmpl(null); setTmplForm({ name: "", weeks: 4, maxDogs: 6, price: 150, description: "", waitlistEnabled: false }); setShowTmplModal(true); }}>+ Class Template</Btn>}
          {currentUser.role === "admin" && <Btn onClick={() => { setInstForm({ templateId: "", instructorId: String(currentUser.id), startDate: "", time: "" }); setShowInstModal(true); }}>+ Schedule Class</Btn>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["instances", "templates"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, textTransform: "capitalize", background: view === v ? C.obsidian : C.fog, color: view === v ? C.cream : C.charcoal }}>{v === "instances" ? "Scheduled Classes" : "Class Templates"}</button>
        ))}
      </div>

      {view === "templates" && (
        <div style={{ display: "grid", gap: 12 }}>
          {classTemplates.map(t => (
            <Card key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.obsidian }}>{t.name}</div>
                <div style={{ fontSize: 13, color: C.silver, marginTop: 2 }}>{t.weeks} weeks · {t.maxDogs} dogs max · ${t.price}</div>
                <div style={{ fontSize: 13, color: C.steel, marginTop: 4, fontStyle: "italic" }}>{t.description}</div>
                {t.waitlistEnabled && <Pill color={C.sky} style={{ marginTop: 6 }}>Waitlist On</Pill>}
              </div>
              {currentUser.role === "admin" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn small variant="ghost" onClick={() => { setEditTmpl(t); setTmplForm({ ...t }); setShowTmplModal(true); }}>Edit</Btn>
                  <Btn small onClick={() => { setInstForm({ templateId: String(t.id), instructorId: String(currentUser.id), startDate: "", time: "" }); setShowInstModal(true); }}>Schedule →</Btn>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {view === "instances" && (
        <div style={{ display: "grid", gap: 16 }}>
          {myInstances.map(inst => {
            const tmpl = classTemplates.find(t => t.id === inst.templateId);
            const instructor = staff.find(s => s.id === inst.instructorId);
            const enrolled = clients.filter(c => inst.enrolledIds.includes(c.id));
            const full = enrolled.length >= (tmpl?.maxDogs || 6);
            return (
              <Card key={inst.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: C.obsidian }}>{tmpl?.name}</span>
                      <Pill color={full ? C.rust : C.sage}>{full ? "FULL" : `${(tmpl?.maxDogs || 6) - enrolled.length} spots left`}</Pill>
                      {tmpl?.waitlistEnabled && inst.waitlist?.length > 0 && <Pill color={C.sky}>{inst.waitlist.length} waitlisted</Pill>}
                    </div>
                    <div style={{ fontSize: 13, color: C.silver }}>{fmtDate(inst.startDate)} → {fmtDate(addWeeks(inst.startDate, (tmpl?.weeks || 1) - 1))} · {fmt12(inst.time)} · {tmpl?.weeks} weeks</div>
                    <div style={{ fontSize: 13, color: C.gold, marginTop: 2 }}>Instructor: {instructor?.name} · ${tmpl?.price}/enrollment</div>
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {enrolled.map(c => <span key={c.id} style={{ background: C.cream, borderRadius: 16, padding: "3px 10px", fontSize: 12, fontWeight: 600, color: C.charcoal }}>{c.name} · 🐕 {c.dogs.map(d => d.name).join(", ")}</span>)}
                      {enrolled.length === 0 && <span style={{ fontSize: 13, color: C.silver }}>No enrollments yet</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn small variant="ghost" onClick={() => setRosterInst(inst)}>👥 Roster</Btn>
                    <Btn small variant="dark" onClick={() => printRoster(inst)}>🖨️ Print</Btn>
                  </div>
                </div>
              </Card>
            );
          })}
          {myInstances.length === 0 && <p style={{ color: C.silver }}>No classes scheduled yet.</p>}
        </div>
      )}

      {rosterInst && (() => {
        const tmpl = classTemplates.find(t => t.id === rosterInst.templateId);
        return (
          <Modal wide title={`${tmpl?.name} — Roster`} onClose={() => setRosterInst(null)}>
            <div style={{ fontSize: 13, color: C.silver, marginBottom: 16 }}>{rosterInst.enrolledIds.length}/{tmpl?.maxDogs} enrolled · {fmtDate(rosterInst.startDate)} · {fmt12(rosterInst.time)}</div>
            <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
              {clients.map(client => {
                const isEnrolled = rosterInst.enrolledIds.includes(client.id);
                const isWaitlisted = rosterInst.waitlist?.includes(client.id);
                return (
                  <div key={client.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: isEnrolled ? "#EEF5EE" : isWaitlisted ? "#FFF8EE" : C.cream, borderRadius: 9 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: C.obsidian, fontSize: 14 }}>{client.name}</div>
                      <div style={{ fontSize: 12, color: C.silver }}>🐕 {client.dogs.map(d => d.name).join(", ")}</div>
                      {isWaitlisted && <Pill color={C.gold} style={{ marginTop: 4 }}>Waitlisted</Pill>}
                    </div>
                    <Btn small variant={isEnrolled ? "danger" : isWaitlisted ? "ghost" : "sage"} onClick={() => { toggleEnroll(rosterInst.id, client.id); setRosterInst(ri => ({ ...ri, enrolledIds: isEnrolled ? ri.enrolledIds.filter(i => i !== client.id) : [...ri.enrolledIds, client.id], waitlist: (ri.waitlist || []).filter(i => i !== client.id) })); }}>
                      {isEnrolled ? "Remove" : isWaitlisted ? "Move to Enrolled" : "Enroll"}
                    </Btn>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="dark" onClick={() => printRoster(rosterInst)}>🖨️ Print Roster</Btn>
              <Btn variant="ghost" onClick={() => setRosterInst(null)}>Close</Btn>
            </div>
          </Modal>
        );
      })()}

      {showTmplModal && (
        <Modal title={editTmpl ? "Edit Class Template" : "New Class Template"} onClose={() => setShowTmplModal(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <Input label="Class Name" value={tmplForm.name} onChange={e => setTmplForm(f => ({ ...f, name: e.target.value }))} />
            <TextArea label="Description" value={tmplForm.description} onChange={e => setTmplForm(f => ({ ...f, description: e.target.value }))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Input label="# Weeks" type="number" value={tmplForm.weeks} onChange={e => setTmplForm(f => ({ ...f, weeks: e.target.value }))} />
              <Input label="Max Dogs" type="number" value={tmplForm.maxDogs} onChange={e => setTmplForm(f => ({ ...f, maxDogs: e.target.value }))} />
              <Input label="Price ($)" type="number" value={tmplForm.price} onChange={e => setTmplForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: 14, color: C.obsidian }}>
              <input type="checkbox" checked={tmplForm.waitlistEnabled} onChange={e => setTmplForm(f => ({ ...f, waitlistEnabled: e.target.checked }))} />
              Enable Waitlist for this class
            </label>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowTmplModal(false)}>Cancel</Btn>
              <Btn onClick={saveTmpl}>Save Template</Btn>
            </div>
          </div>
        </Modal>
      )}

      {showInstModal && (
        <Modal title="Schedule a Class" onClose={() => setShowInstModal(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <Sel label="Class Template" value={instForm.templateId} onChange={e => setInstForm(f => ({ ...f, templateId: e.target.value }))}>
              <option value="">Select template…</option>
              {classTemplates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.weeks} wks, ${t.price})</option>)}
            </Sel>
            {currentUser.role === "admin" && (
              <Sel label="Instructor" value={instForm.instructorId} onChange={e => setInstForm(f => ({ ...f, instructorId: e.target.value }))}>
                {staff.filter(s => s.active && s.services.includes("group")).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Sel>
            )}
            <Input label="Start Date" type="date" value={instForm.startDate} onChange={e => setInstForm(f => ({ ...f, startDate: e.target.value }))} />
            <Input label="Time" type="time" value={instForm.time} onChange={e => setInstForm(f => ({ ...f, time: e.target.value }))} />
            {instForm.templateId && instForm.startDate && (
              <div style={{ background: C.cream, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: C.steel }}>
                <b style={{ color: C.obsidian }}>Auto-generated sessions:</b><br />
                {Array.from({ length: parseInt(classTemplates.find(t => t.id === parseInt(instForm.templateId))?.weeks || 0) }, (_, i) => fmtDate(addWeeks(instForm.startDate, i))).join("  ·  ")}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowInstModal(false)}>Cancel</Btn>
              <Btn onClick={scheduleInstance}>Schedule Class</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Clients({ currentUser, clients, setClients, sessions, dogNotes, setDogNotes }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  const myClients = currentUser.role === "admin" ? clients : clients.filter(c => sessions.some(s => s.clientId === c.id && s.trainerId === currentUser.id));
  const filtered = myClients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.dogs?.some(d => d.name.toLowerCase().includes(search.toLowerCase())));

  const addNote = (dogId, text) => {
    if (!text.trim()) return;
    setDogNotes(prev => ({ ...prev, [dogId]: [...(prev[dogId] || []), { id: Date.now(), trainerId: currentUser.id, date: today, text }] }));
  };

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, margin: "0 0 20px" }}>Clients</h1>
      <input style={{ ...inputStyle, maxWidth: 360, marginBottom: 16 }} placeholder="Search by client or dog name…" value={search} onChange={e => setSearch(e.target.value)} />

      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>← Back to Clients</button>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: "Georgia, serif", margin: 0, color: C.obsidian }}>{selected.name}</h2>
                <div style={{ color: C.silver, fontSize: 14, marginTop: 2 }}>📧 {selected.email} · 📞 {selected.phone}</div>
                <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                  {selected.waiverSigned ? <Pill color={C.sage}>✓ Waiver Signed</Pill> : <Pill color={C.rust}>Waiver Pending</Pill>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: `1px solid ${C.fog}`, paddingBottom: 12 }}>
              {["info", "dogs", "notes", "history"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, textTransform: "capitalize", background: activeTab === t ? C.obsidian : C.fog, color: activeTab === t ? C.cream : C.charcoal }}>{t}</button>
              ))}
            </div>
            {activeTab === "info" && (
              <div style={{ display: "grid", gap: 10 }}>
                {[["Name", selected.name], ["Phone", selected.phone], ["Email", selected.email], ["Joined", fmtDate(selected.joinDate)], ["Waiver", selected.waiverSigned ? "Signed" : "Not signed"]].map(([l, v]) => (
                  <div key={l}><b style={{ color: C.obsidian }}>{l}:</b> <span style={{ color: C.steel }}>{v}</span></div>
                ))}
              </div>
            )}
            {activeTab === "dogs" && (
              <div style={{ display: "grid", gap: 16 }}>
                {selected.dogs?.map(dog => (
                  <div key={dog.id} style={{ background: C.cream, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>🐕 {dog.name}</div>
                    <div style={{ fontSize: 13, color: C.silver }}>{dog.breed} · {dog.age} yr · {dog.sex} · {dog.neutered ? "Fixed" : "Intact"}</div>
                    {dog.birthday && <div style={{ fontSize: 12, color: C.gold, marginTop: 2 }}>🎂 {fmtDate(dog.birthday)}</div>}
                    {dog.notes && <div style={{ fontSize: 13, color: C.steel, marginTop: 6, fontStyle: "italic", background: C.white, borderRadius: 8, padding: "8px 12px" }}>{dog.notes}</div>}
                  </div>
                ))}
              </div>
            )}
            {activeTab === "notes" && (
              <div>
                <p style={{ fontSize: 13, color: C.silver, marginTop: 0 }}>Trainer-only notes. Clients never see these.</p>
                {selected.dogs?.map(dog => {
                  const notes = dogNotes[dog.id] || [];
                  const [newNote, setNewNote] = useState("");
                  return (
                    <div key={dog.id} style={{ marginBottom: 20 }}>
                      <div style={{ fontWeight: 700, color: C.obsidian, marginBottom: 8 }}>🐕 {dog.name}</div>
                      <div style={{ background: C.cream, borderRadius: 10, padding: 14, minHeight: 80, marginBottom: 10 }}>
                        {notes.length === 0 && <span style={{ color: C.silver, fontSize: 13 }}>No notes yet.</span>}
                        {notes.map(n => (
                          <div key={n.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.fog}` }}>
                            <div style={{ fontSize: 11, color: C.silver, marginBottom: 2 }}>{fmtDate(n.date)}</div>
                            <div style={{ fontSize: 14, color: C.obsidian }}>{n.text}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input style={{ ...inputStyle, flex: 1 }} placeholder="Add a note…" value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { addNote(dog.id, newNote); setNewNote(""); } }} />
                        <Btn small onClick={() => { addNote(dog.id, newNote); setNewNote(""); }}>Add</Btn>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {activeTab === "history" && (
              <div>
                {sessions.filter(s => s.clientId === selected.id).sort((a, b) => b.date > a.date ? 1 : -1).map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.fog}` }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.obsidian }}>{fmtDate(s.date)} · {fmt12(s.time)}</div>
                      <div style={{ fontSize: 12, color: C.silver }}>{s.type === "facility" ? "Facility" : "In-Home"} · {s.duration} min · ${s.price}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Pill color={s.paid ? C.sage : C.rust}>{s.paid ? "Paid" : "Unpaid"}</Pill>
                      {s.status === "completed" && <Pill color={C.sky}>Done</Pill>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map(client => (
            <Card key={client.id} onClick={() => setSelected(client)} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.obsidian }}>{client.name}</div>
                  <div style={{ fontSize: 13, color: C.silver }}>{client.email} · {client.phone}</div>
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {client.dogs?.map(dog => <span key={dog.id} style={{ background: C.cream, borderRadius: 10, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: C.charcoal }}>🐕 {dog.name} · {dog.breed}</span>)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {!client.waiverSigned && <Pill color={C.rust}>Waiver Pending</Pill>}
                  <span style={{ color: C.silver, fontSize: 18 }}>›</span>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <p style={{ color: C.silver }}>No clients found.</p>}
        </div>
      )}
    </div>
  );
}

function StaffMessages({ currentUser, clients, messages, setMessages, staff }) {
  const [activeThread, setActiveThread] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const msgEndRef = useRef(null);
  const myThreads = currentUser.role === "admin" ? messages : messages.filter(m => m.trainerId === currentUser.id);
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeThread, messages]);

  const send = () => {
    if (!newMsg.trim() || !activeThread) return;
    setMessages(ms => ms.map(m => m.id === activeThread.id ? { ...m, messages: [...m.messages, { id: Date.now(), from: "trainer", text: newMsg.trim(), time: new Date().toLocaleString() }] } : m));
    setActiveThread(prev => ({ ...prev, messages: [...prev.messages, { id: Date.now(), from: "trainer", text: newMsg.trim(), time: new Date().toLocaleString() }] }));
    setNewMsg("");
  };

  const startThread = clientId => {
    const existing = messages.find(m => m.clientId === clientId && m.trainerId === currentUser.id);
    if (existing) { setActiveThread(existing); return; }
    const newThread = { id: Date.now(), clientId, trainerId: currentUser.id, messages: [] };
    setMessages(ms => [...ms, newThread]);
    setActiveThread(newThread);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 0, height: "calc(100vh - 120px)", minHeight: 500 }}>
      <div style={{ background: C.white, borderRadius: "14px 0 0 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.fog}` }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.obsidian, marginBottom: 8 }}>Conversations</div>
          {currentUser.role === "admin" && <div style={{ fontSize: 11, color: C.silver }}>All trainer–client threads visible</div>}
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {myThreads.map(thread => {
            const client = clients.find(c => c.id === thread.clientId);
            const trainer = staff.find(s => s.id === thread.trainerId);
            const last = thread.messages[thread.messages.length - 1];
            const unread = thread.messages.some(m => m.from === "client" && !m.read);
            return (
              <div key={thread.id} onClick={() => setActiveThread(thread)} style={{ padding: "12px 16px", cursor: "pointer", borderBottom: `1px solid ${C.fog}`, background: activeThread?.id === thread.id ? C.cream : "transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: unread ? 800 : 600, fontSize: 14, color: C.obsidian }}>{client?.name}</div>
                  {unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold }} />}
                </div>
                {currentUser.role === "admin" && <div style={{ fontSize: 11, color: C.gold, marginBottom: 2 }}>with {trainer?.name}</div>}
                <div style={{ fontSize: 12, color: C.silver, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{last?.text || "No messages yet"}</div>
              </div>
            );
          })}
          {myThreads.length === 0 && <p style={{ padding: 16, color: C.silver, fontSize: 13 }}>No conversations yet.</p>}
        </div>
        <div style={{ padding: 12, borderTop: `1px solid ${C.fog}` }}>
          <Sel onChange={e => { if (e.target.value) { startThread(parseInt(e.target.value)); e.target.value = ""; } }} style={{ fontSize: 13 }}>
            <option value="">+ New conversation…</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Sel>
        </div>
      </div>
      <div style={{ background: "#F7F4EE", borderRadius: "0 14px 14px 0", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeThread ? (() => {
          const client = clients.find(c => c.id === activeThread.clientId);
          const trainer = staff.find(s => s.id === activeThread.trainerId);
          const liveThread = messages.find(m => m.id === activeThread.id) || activeThread;
          return (
            <>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.fog}`, background: C.white }}>
                <div style={{ fontWeight: 800, color: C.obsidian }}>{client?.name}</div>
                {currentUser.role === "admin" && <div style={{ fontSize: 12, color: C.gold }}>Trainer: {trainer?.name}</div>}
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {liveThread.messages.map(msg => (
                  <div key={msg.id} style={{ display: "flex", justifyContent: msg.from === "trainer" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "70%", background: msg.from === "trainer" ? C.obsidian : C.white, color: msg.from === "trainer" ? C.cream : C.obsidian, borderRadius: msg.from === "trainer" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 15px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                      <div style={{ fontSize: 14 }}>{msg.text}</div>
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={msgEndRef} />
              </div>
              <div style={{ padding: "12px 16px", background: C.white, borderTop: `1px solid ${C.fog}`, display: "flex", gap: 10 }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="Type a message…" value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
                <Btn onClick={send}>Send →</Btn>
              </div>
            </>
          );
        })() : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.silver, fontStyle: "italic" }}>Select a conversation</div>
        )}
      </div>
    </div>
  );
}

function HomeworkCards({ currentUser, homeworkCards, setHomeworkCards, clients, sessions }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", category: "", content: "", videoUrl: "" });
  const [sendMode, setSendMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [sendTo, setSendTo] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const categories = [...new Set(homeworkCards.map(h => h.category))];
  const myClients = currentUser.role === "admin" ? clients : clients.filter(c => sessions.some(s => s.clientId === c.id && s.trainerId === currentUser.id));
  const filteredClients = myClients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.dogs?.some(d => d.name.toLowerCase().includes(clientSearch.toLowerCase())));

  // Parse YouTube/Vimeo URLs into embeddable format
  const getEmbedUrl = url => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
  };

  const save = () => {
    if (!form.title || !form.content) return;
    if (editItem) setHomeworkCards(hs => hs.map(h => h.id === editItem.id ? { ...form, id: editItem.id } : h));
    else setHomeworkCards(hs => [...hs, { ...form, id: Date.now() }]);
    setShowModal(false);
  };

  const sendHomework = () => {
    if (!sendTo || selected.length === 0) return;
    const client = myClients.find(c => String(c.id) === sendTo);
    setSendMode(false); setSelected([]); setSendTo(""); setClientSearch("");
    alert(`✓ Homework sent to ${client?.name}!\nCards: ${selected.map(id => homeworkCards.find(h => h.id === id)?.title).join(", ")}`);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, margin: 0 }}>Homework Cards</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="sage" onClick={() => setSendMode(true)}>📱 Send to Client</Btn>
          <Btn onClick={() => { setEditItem(null); setForm({ title: "", category: "", content: "", videoUrl: "" }); setShowModal(true); }}>+ New Card</Btn>
        </div>
      </div>
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.silver, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{cat}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {homeworkCards.filter(h => h.category === cat).map(card => {
              const embedUrl = getEmbedUrl(card.videoUrl);
              return (
                <Card key={card.id} style={{ borderTop: `3px solid ${C.gold}` }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.obsidian, marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: C.steel, lineHeight: 1.6 }}>{card.content}</div>
                  {embedUrl && (
                    <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", background: "#000" }}>
                      <iframe src={embedUrl} style={{ width: "100%", height: 150, border: "none", display: "block" }} allowFullScreen title={card.title} />
                    </div>
                  )}
                  {card.videoUrl && !embedUrl && (
                    <a href={card.videoUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: C.sky, textDecoration: "none" }}>▶ Watch Video</a>
                  )}
                  <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                    <Btn small variant="ghost" onClick={() => { setEditItem(card); setForm({ title: card.title, category: card.category, content: card.content, videoUrl: card.videoUrl || "" }); setShowModal(true); }}>Edit</Btn>
                    <Btn small variant="danger" onClick={() => setHomeworkCards(hs => hs.filter(h => h.id !== card.id))}>✕</Btn>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {sendMode && (
        <Modal title="Send Homework to Client" onClose={() => { setSendMode(false); setSelected([]); setClientSearch(""); setSendTo(""); }} wide>
          <div style={{ display: "grid", gap: 16 }}>
            <Field label="Search for Client">
              <input
                style={inputStyle}
                placeholder="Type client or dog name…"
                value={clientSearch}
                onChange={e => { setClientSearch(e.target.value); setSendTo(""); }}
              />
              {clientSearch.length > 0 && (
                <div style={{ background: C.white, border: `1.5px solid ${C.fog}`, borderRadius: 9, marginTop: 4, maxHeight: 180, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                  {filteredClients.length === 0
                    ? <div style={{ padding: "10px 14px", color: C.silver, fontSize: 13 }}>No clients found</div>
                    : filteredClients.map(c => (
                      <div key={c.id} onClick={() => { setSendTo(String(c.id)); setClientSearch(c.name); }} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14, fontWeight: sendTo === String(c.id) ? 800 : 400, color: C.obsidian, background: sendTo === String(c.id) ? C.cream : "transparent", borderBottom: `1px solid ${C.fog}` }}>
                        {c.name} — 🐕 {c.dogs.map(d => d.name).join(", ")}
                      </div>
                    ))}
                </div>
              )}
              {sendTo && <div style={{ fontSize: 12, color: C.sage, marginTop: 4 }}>✓ {myClients.find(c => String(c.id) === sendTo)?.name} selected</div>}
            </Field>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.steel, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Select Cards to Send</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                {homeworkCards.map(card => {
                  const checked = selected.includes(card.id);
                  return (
                    <div key={card.id} onClick={() => setSelected(p => checked ? p.filter(i => i !== card.id) : [...p, card.id])} style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer", border: `2px solid ${checked ? C.gold : C.fog}`, background: checked ? C.gold + "18" : C.cream, transition: "all 0.12s" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.obsidian }}>{checked ? "✓ " : ""}{card.title}</div>
                      <div style={{ fontSize: 11, color: C.silver }}>{card.category}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => { setSendMode(false); setSelected([]); setClientSearch(""); setSendTo(""); }}>Cancel</Btn>
              <Btn variant="sage" disabled={!sendTo || selected.length === 0} onClick={sendHomework}>📱 Send {selected.length > 0 ? `(${selected.length} cards)` : ""}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title={editItem ? "Edit Homework Card" : "New Homework Card"} onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <Input label="Card Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Input label="Category" placeholder="Foundation, Duration, Leash Skills…" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            <TextArea label="Instructions / Homework Content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ minHeight: 120 }} />
            <Input
              label="Video URL (optional)"
              hint="Paste a YouTube or Vimeo link — it will embed automatically"
              placeholder="https://youtube.com/watch?v=..."
              value={form.videoUrl}
              onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
            />
            {getEmbedUrl(form.videoUrl) && (
              <div style={{ borderRadius: 8, overflow: "hidden", background: "#000" }}>
                <iframe src={getEmbedUrl(form.videoUrl)} style={{ width: "100%", height: 160, border: "none", display: "block" }} allowFullScreen title="Preview" />
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn onClick={save}>Save Card</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Staff({ staff, setStaff }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", firstName: "", phone: "", role: "trainer", bio: "", services: ["private"], active: true });
  const save = () => {
    if (!form.name) return;
    if (editItem) setStaff(ss => ss.map(s => s.id === editItem.id ? { ...form, id: editItem.id } : s));
    else setStaff(ss => [...ss, { ...form, id: Date.now() }]);
    setShowModal(false);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, margin: 0 }}>Staff</h1>
        <Btn onClick={() => { setEditItem(null); setForm({ name: "", firstName: "", phone: "", role: "trainer", bio: "", services: ["private"], active: true }); setShowModal(true); }}>+ Add Staff</Btn>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {staff.map(member => (
          <Card key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: C.obsidian }}>{member.name}</span>
                <Pill color={member.role === "admin" ? C.gold : C.sage}>{member.role === "admin" ? "Owner/Admin" : "Trainer"}</Pill>
                {!member.active && <Pill color={C.silver}>Inactive</Pill>}
              </div>
              <div style={{ fontSize: 13, color: C.silver }}>📞 {member.phone}</div>
              {member.bio && <div style={{ fontSize: 13, color: C.steel, marginTop: 4, fontStyle: "italic" }}>{member.bio}</div>}
              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>{member.services.map(svc => <Pill key={svc} color={C.sky}>{svc}</Pill>)}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small variant="ghost" onClick={() => { setEditItem(member); setForm({ ...member }); setShowModal(true); }}>Edit</Btn>
              <Btn small variant={member.active ? "danger" : "sage"} onClick={() => setStaff(ss => ss.map(s => s.id === member.id ? { ...s, active: !s.active } : s))}>{member.active ? "Deactivate" : "Reactivate"}</Btn>
            </div>
          </Card>
        ))}
      </div>
      {showModal && (
        <Modal title={editItem ? "Edit Staff Member" : "Add Staff Member"} onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="First Name (for messages)" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            <Input label="Phone (for SMS login)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Sel label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="trainer">Trainer</option>
              <option value="admin">Owner/Admin</option>
            </Sel>
            <TextArea label="Bio (visible to clients)" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            <Field label="Services">
              <div style={{ display: "flex", gap: 10 }}>
                {["private", "group"].map(svc => (
                  <label key={svc} style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer", fontSize: 14, textTransform: "capitalize" }}>
                    <input type="checkbox" checked={form.services.includes(svc)} onChange={() => setForm(f => ({ ...f, services: f.services.includes(svc) ? f.services.filter(s => s !== svc) : [...f.services, svc] }))} />
                    {svc === "private" ? "Private Sessions" : "Group Classes"}
                  </label>
                ))}
              </div>
            </Field>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn onClick={save}>Save</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DiscountsAndGiftCards({ discountCodes, setDiscountCodes, giftCards, setGiftCards }) {
  const [tab, setTab] = useState("discounts");
  const [showDModal, setShowDModal] = useState(false);
  const [showGModal, setShowGModal] = useState(false);
  const [dForm, setDForm] = useState({ code: "", type: "percent", value: 10, maxUses: 100, expiry: "", active: true });
  const [gForm, setGForm] = useState({ amount: 50, purchasedBy: "", purchasedFor: "" });

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, marginBottom: 20 }}>Discounts & Gift Cards</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["discounts", "giftcards"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: tab === t ? C.obsidian : C.fog, color: tab === t ? C.cream : C.charcoal }}>{t === "discounts" ? "Discount Codes" : "Gift Cards"}</button>
        ))}
      </div>
      {tab === "discounts" && (
        <Section title="Discount Codes" action={<Btn onClick={() => setShowDModal(true)}>+ New Code</Btn>}>
          <div style={{ display: "grid", gap: 12 }}>
            {discountCodes.map(d => (
              <Card key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: 15, fontFamily: "monospace", color: C.obsidian, letterSpacing: 1 }}>{d.code}</span>
                    <Pill color={d.active ? C.sage : C.silver}>{d.active ? "Active" : "Inactive"}</Pill>
                  </div>
                  <div style={{ fontSize: 13, color: C.silver, marginTop: 2 }}>{d.type === "percent" ? `${d.value}% off` : `$${d.value} off`} · {d.uses}/{d.maxUses} uses · Expires {d.expiry || "never"}</div>
                </div>
                <Btn small variant={d.active ? "danger" : "sage"} onClick={() => setDiscountCodes(ds => ds.map(x => x.id === d.id ? { ...x, active: !x.active } : x))}>{d.active ? "Deactivate" : "Activate"}</Btn>
              </Card>
            ))}
          </div>
        </Section>
      )}
      {tab === "giftcards" && (
        <Section title="Gift Cards" action={<Btn onClick={() => setShowGModal(true)}>+ Create Gift Card</Btn>}>
          <div style={{ display: "grid", gap: 12 }}>
            {giftCards.map(g => (
              <Card key={g.id} style={{ borderLeft: `4px solid ${g.balance === 0 ? C.silver : C.gold}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, fontFamily: "monospace", letterSpacing: 1, color: C.obsidian }}>{g.code}</span>
                      <Pill color={g.balance === 0 ? C.silver : C.gold}>{g.balance === 0 ? "Fully Redeemed" : `$${g.balance} remaining`}</Pill>
                    </div>
                    <div style={{ fontSize: 13, color: C.silver }}>Original: ${g.amount} · Purchased {fmtDate(g.purchaseDate)}</div>
                    {g.purchasedBy && <div style={{ fontSize: 12, color: C.steel, marginTop: 2 }}>From: {g.purchasedBy} → To: {g.purchasedFor}</div>}
                  </div>
                  <Btn small variant="ghost" onClick={() => { const r = prompt(`Redeem amount from ${g.code} (balance: $${g.balance}):`); const amt = parseFloat(r); if (amt > 0 && amt <= g.balance) setGiftCards(gs => gs.map(x => x.id === g.id ? { ...x, balance: x.balance - amt } : x)); }}>Redeem</Btn>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}
      {showDModal && (
        <Modal title="New Discount Code" onClose={() => setShowDModal(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <Input label="Code (e.g. WELCOME20)" value={dForm.code} onChange={e => setDForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
            <Sel label="Type" value={dForm.type} onChange={e => setDForm(f => ({ ...f, type: e.target.value }))}><option value="percent">% Off</option><option value="flat">$ Off</option></Sel>
            <Input label={dForm.type === "percent" ? "Discount %" : "Discount $"} type="number" value={dForm.value} onChange={e => setDForm(f => ({ ...f, value: e.target.value }))} />
            <Input label="Max Uses" type="number" value={dForm.maxUses} onChange={e => setDForm(f => ({ ...f, maxUses: e.target.value }))} />
            <Input label="Expiry Date (optional)" type="date" value={dForm.expiry} onChange={e => setDForm(f => ({ ...f, expiry: e.target.value }))} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowDModal(false)}>Cancel</Btn>
              <Btn onClick={() => { if (!dForm.code) return; setDiscountCodes(ds => [...ds, { ...dForm, id: Date.now(), uses: 0, value: parseFloat(dForm.value), maxUses: parseInt(dForm.maxUses) }]); setShowDModal(false); }}>Create Code</Btn>
            </div>
          </div>
        </Modal>
      )}
      {showGModal && (
        <Modal title="Create Gift Card" onClose={() => setShowGModal(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <Sel label="Amount" value={gForm.amount} onChange={e => setGForm(f => ({ ...f, amount: e.target.value }))}>{[25, 50, 75, 100, 150, 200].map(a => <option key={a} value={a}>${a}</option>)}</Sel>
            <Input label="Purchased By" value={gForm.purchasedBy} onChange={e => setGForm(f => ({ ...f, purchasedBy: e.target.value }))} />
            <Input label="Purchased For" value={gForm.purchasedFor} onChange={e => setGForm(f => ({ ...f, purchasedFor: e.target.value }))} />
            <div style={{ background: C.cream, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: C.steel }}>A unique CORECANINE-XXXXX code will be generated.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setShowGModal(false)}>Cancel</Btn>
              <Btn onClick={() => { setGiftCards(gs => [...gs, { ...gForm, id: Date.now(), code: genCode(), amount: parseFloat(gForm.amount), balance: parseFloat(gForm.amount), purchaseDate: today, redeemed: false }]); setShowGModal(false); }}>Generate Gift Card</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── EMAIL CENTER ─────────────────────────────────────────────────────────────
function EmailCenter({ currentUser, clients, sessions, classInstances, classTemplates, staff, emailTemplates, setEmailTemplates, settings }) {
  const [tab, setTab] = useState("send");
  const [editTmpl, setEditTmpl] = useState(null);
  const [tmplForm, setTmplForm] = useState({ name: "", subject: "", body: "", active: true });
  const [showTmplModal, setShowTmplModal] = useState(false);

  // ── Send Email tab state ───────────────────────────────────────────────────
  const [sendMode, setSendMode] = useState("individual"); // "individual" | "class"
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [sent, setSent] = useState(false);
  const [sentLog, setSentLog] = useState([]);

  const fromEmail = settings?.businessEmail || "april@corecanine.com";

  // Fill editor when template is picked
  const pickTemplate = (id) => {
    setSelectedTemplateId(id);
    const t = emailTemplates.find(t => String(t.id) === String(id));
    if (t) { setCustomSubject(t.subject); setCustomBody(t.body); }
    else { setCustomSubject(""); setCustomBody(""); }
  };

  // Merge basic vars for preview
  const mergeVars = (text, client) => {
    if (!text || !client) return text || "";
    const dog = client.dogs?.[0];
    return text
      .replace(/{{clientName}}/g, client.name || "")
      .replace(/{{dogName}}/g, dog?.name || "your dog")
      .replace(/{{trainerName}}/g, currentUser.name || "")
      .replace(/{{sessionDate}}/g, fmtDate(today))
      .replace(/{{sessionTime}}/g, "10:00 AM")
      .replace(/{{sessionLocation}}/g, "At our training facility")
      .replace(/{{className}}/g, "[Class Name]")
      .replace(/{{startDate}}/g, fmtDate(today))
      .replace(/{{classTime}}/g, "6:00 PM")
      .replace(/{{sessionDates}}/g, "[Session dates listed here]")
      .replace(/{{homeworkList}}/g, "[Homework exercises listed here]");
  };

  const previewClient = clients.find(c => String(c.id) === String(selectedClientId));
  const previewSubject = previewClient ? mergeVars(customSubject, previewClient) : customSubject;
  const previewBody = previewClient ? mergeVars(customBody, previewClient) : customBody;

  // BCC class recipients
  const selectedClass = classInstances.find(ci => String(ci.id) === String(selectedClassId));
  const classEnrolled = selectedClass ? clients.filter(c => selectedClass.enrolledIds.includes(c.id)) : [];
  const classTmpl = selectedClass ? classTemplates.find(t => t.id === selectedClass.templateId) : null;

  const doSend = () => {
    const recipients = sendMode === "class"
      ? classEnrolled.map(c => c.email).filter(Boolean)
      : previewClient ? [previewClient.email] : [];
    if (recipients.length === 0) return;
    const logEntry = {
      id: Date.now(),
      date: today,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      mode: sendMode,
      recipients,
      subject: sendMode === "class" ? customSubject : previewSubject,
      preview: sendMode === "class"
        ? `BCC to ${recipients.length} class participants`
        : `To: ${previewClient?.name} <${previewClient?.email}>`,
    };
    setSentLog(l => [logEntry, ...l]);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  // ── Template CRUD ──────────────────────────────────────────────────────────
  const saveTmpl = () => {
    if (!tmplForm.name || !tmplForm.subject) return;
    if (editTmpl) setEmailTemplates(ts => ts.map(t => t.id === editTmpl.id ? { ...tmplForm, id: editTmpl.id } : t));
    else setEmailTemplates(ts => [...ts, { ...tmplForm, id: Date.now() }]);
    setShowTmplModal(false);
  };

  const VARS_HELP = ["{{clientName}}", "{{dogName}}", "{{trainerName}}", "{{sessionDate}}", "{{sessionTime}}", "{{sessionLocation}}", "{{className}}", "{{startDate}}", "{{classTime}}", "{{sessionDates}}", "{{homeworkList}}"];

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, marginBottom: 20 }}>Emails</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["send", "✉ Send Email"], ["templates", "📝 Templates"], ["log", "📋 Sent Log"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: tab === t ? C.obsidian : C.fog, color: tab === t ? C.cream : C.charcoal }}>{l}</button>
        ))}
      </div>

      {/* ── SEND TAB ──────────────────────────────────────────────────────────── */}
      {tab === "send" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

          {/* Left: compose */}
          <div style={{ display: "grid", gap: 14 }}>
            <Card>
              <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 14px" }}>Compose</h3>

              {/* Individual vs Class toggle */}
              <div style={{ display: "flex", gap: 0, marginBottom: 16, background: C.cream, borderRadius: 10, padding: 4 }}>
                {[["individual", "Individual Client"], ["class", "Entire Class (BCC)"]].map(([m, l]) => (
                  <button key={m} onClick={() => { setSendMode(m); setSent(false); }} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", background: sendMode === m ? C.gold : "transparent", color: sendMode === m ? C.obsidian : C.silver, transition: "all 0.15s" }}>{l}</button>
                ))}
              </div>

              {sendMode === "individual" && (
                <Field label="Recipient" style={{ marginBottom: 12 }}>
                  <select style={inputStyle} value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                    <option value="">Choose a client…</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
                  </select>
                </Field>
              )}

              {sendMode === "class" && (
                <Field label="Class" style={{ marginBottom: 12 }}>
                  <select style={inputStyle} value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                    <option value="">Choose a class…</option>
                    {classInstances.map(ci => {
                      const t = classTemplates.find(t => t.id === ci.templateId);
                      return <option key={ci.id} value={ci.id}>{t?.name} — starts {fmtDate(ci.startDate)} ({(ci.enrolledIds?.length || 0)} enrolled)</option>;
                    })}
                  </select>
                  {selectedClass && (
                    <div style={{ marginTop: 6, fontSize: 12, color: C.steel }}>
                      BCC: {classEnrolled.map(c => c.email).filter(Boolean).join(", ") || "No emails on file"}
                    </div>
                  )}
                </Field>
              )}

              <Field label="Start from template (optional)" style={{ marginBottom: 12 }}>
                <select style={inputStyle} value={selectedTemplateId} onChange={e => pickTemplate(e.target.value)}>
                  <option value="">Blank email…</option>
                  {emailTemplates.filter(t => t.active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>

              <div style={{ fontSize: 11, color: C.silver, marginBottom: 8 }}>
                From: <b style={{ color: C.steel }}>{fromEmail}</b>
              </div>

              <Field label="Subject" style={{ marginBottom: 10 }}>
                <input style={inputStyle} value={customSubject} onChange={e => setCustomSubject(e.target.value)} placeholder="Email subject…" />
              </Field>
              <Field label="Body">
                <textarea style={{ ...inputStyle, minHeight: 200, resize: "vertical" }} value={customBody} onChange={e => setCustomBody(e.target.value)} placeholder="Write your email…" />
              </Field>

              <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                {sent && <span style={{ color: C.sage, fontWeight: 700, fontSize: 13, alignSelf: "center" }}>✓ Sent!</span>}
                <Btn variant="sage" disabled={(!selectedClientId && sendMode === "individual") || (!selectedClassId && sendMode === "class") || !customSubject || !customBody} onClick={doSend}>
                  {sendMode === "class" ? `📧 Send BCC to ${classEnrolled.length} clients` : "📧 Send Email"}
                </Btn>
              </div>
            </Card>

            {/* Variable reference */}
            <Card style={{ padding: "14px 18px" }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: C.silver, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Merge Variables</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {VARS_HELP.map(v => (
                  <span key={v} onClick={() => setCustomBody(b => b + v)} style={{ background: C.cream, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontFamily: "monospace", color: C.sky, cursor: "pointer", border: `1px solid ${C.fog}` }} title="Click to insert">{v}</span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.silver, marginTop: 8 }}>Click any variable to insert it at the end of your message.</div>
            </Card>
          </div>

          {/* Right: live preview */}
          <div style={{ display: "grid", gap: 14 }}>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 13, color: C.silver, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Preview</div>
              <div style={{ fontSize: 12, color: C.steel, marginBottom: 4 }}>
                <b>From:</b> {fromEmail}<br />
                <b>To:</b> {sendMode === "class" ? `[BCC: ${classEnrolled.length} recipients]` : (previewClient ? `${previewClient.name} <${previewClient.email}>` : "—")}
              </div>
              <div style={{ borderTop: `1px solid ${C.fog}`, paddingTop: 12, marginTop: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.obsidian, marginBottom: 10 }}>{previewSubject || <span style={{ color: C.silver, fontStyle: "italic" }}>Subject line will appear here</span>}</div>
                <div style={{ fontSize: 13, color: C.steel, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{previewBody || <span style={{ color: C.silver, fontStyle: "italic" }}>Email body will appear here. Select a client above to preview merged variables.</span>}</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TEMPLATES TAB ─────────────────────────────────────────────────────── */}
      {tab === "templates" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Btn onClick={() => { setEditTmpl(null); setTmplForm({ name: "", subject: "", body: "", active: true }); setShowTmplModal(true); }}>+ New Template</Btn>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {emailTemplates.map(t => (
              <Card key={t.id} style={{ borderLeft: `4px solid ${t.active ? C.gold : C.silver}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: C.obsidian }}>{t.name}</span>
                      <Pill color={t.active ? C.sage : C.silver}>{t.active ? "Active" : "Inactive"}</Pill>
                    </div>
                    <div style={{ fontSize: 13, color: C.steel, marginBottom: 6 }}>Subject: <b>{t.subject}</b></div>
                    <div style={{ fontSize: 12, color: C.silver, lineHeight: 1.5, maxHeight: 52, overflow: "hidden" }}>{t.body.slice(0, 140)}{t.body.length > 140 ? "…" : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <Btn small variant="ghost" onClick={() => { setEditTmpl(t); setTmplForm({ ...t }); setShowTmplModal(true); }}>Edit</Btn>
                    <Btn small variant={t.active ? "danger" : "sage"} onClick={() => setEmailTemplates(ts => ts.map(x => x.id === t.id ? { ...x, active: !x.active } : x))}>{t.active ? "Disable" : "Enable"}</Btn>
                    <Btn small variant="ghost" onClick={() => { pickTemplate(String(t.id)); setTab("send"); }}>Use →</Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {showTmplModal && (
            <Modal title={editTmpl ? "Edit Template" : "New Template"} onClose={() => setShowTmplModal(false)} wide>
              <div style={{ display: "grid", gap: 14 }}>
                <Input label="Template Name" value={tmplForm.name} onChange={e => setTmplForm(f => ({ ...f, name: e.target.value }))} placeholder="Session Confirmation, Homework Follow-Up…" />
                <Input label="Subject" value={tmplForm.subject} onChange={e => setTmplForm(f => ({ ...f, subject: e.target.value }))} />
                <Field label="Body" hint="Use merge variables like {{clientName}}, {{sessionDate}}, etc.">
                  <textarea style={{ ...inputStyle, minHeight: 220, resize: "vertical" }} value={tmplForm.body} onChange={e => setTmplForm(f => ({ ...f, body: e.target.value }))} />
                </Field>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {VARS_HELP.map(v => (
                    <span key={v} onClick={() => setTmplForm(f => ({ ...f, body: f.body + v }))} style={{ background: C.cream, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontFamily: "monospace", color: C.sky, cursor: "pointer", border: `1px solid ${C.fog}` }}>{v}</span>
                  ))}
                </div>
                <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: 14 }}>
                  <input type="checkbox" checked={tmplForm.active} onChange={e => setTmplForm(f => ({ ...f, active: e.target.checked }))} />
                  Active (available to use in Send tab)
                </label>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <Btn variant="ghost" onClick={() => setShowTmplModal(false)}>Cancel</Btn>
                  <Btn onClick={saveTmpl}>Save Template</Btn>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* ── SENT LOG TAB ──────────────────────────────────────────────────────── */}
      {tab === "log" && (
        <div>
          {sentLog.length === 0
            ? <div style={{ textAlign: "center", padding: "48px 20px", color: C.silver }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div>No emails sent yet this session.</div>
              </div>
            : <div style={{ display: "grid", gap: 10 }}>
                {sentLog.map(log => (
                  <Card key={log.id} style={{ borderLeft: `4px solid ${C.sage}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: C.obsidian, marginBottom: 2 }}>{log.subject}</div>
                        <div style={{ fontSize: 13, color: C.steel }}>{log.preview}</div>
                      </div>
                      <div style={{ fontSize: 12, color: C.silver, whiteSpace: "nowrap" }}>{fmtDate(log.date)} · {log.time}</div>
                    </div>
                  </Card>
                ))}
              </div>}
          <div style={{ marginTop: 20, background: C.cream, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: C.steel }}>
            <b>Note:</b> The sent log resets when you refresh the page. Email delivery is handled by SendGrid once your API key is added in Settings.
          </div>
        </div>
      )}
    </div>
  );
}

function Reports({ sessions, clients, staff, refunds }) {
  const [period, setPeriod] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const CC_RATE = 0.029; const CC_FIXED = 0.30;

  const filterByPeriod = (items, f = "date") => {
    const now = new Date();
    return items.filter(item => {
      const d = new Date(item[f] + "T12:00:00");
      if (period === "thisMonth") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === "lastMonth") { const lm = new Date(now.getFullYear(), now.getMonth() - 1); return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear(); }
      if (period === "thisYear") return d.getFullYear() === now.getFullYear();
      if (period === "lastYear") return d.getFullYear() === now.getFullYear() - 1;
      if (period === "custom") {
        if (customStart && d < new Date(customStart + "T00:00:00")) return false;
        if (customEnd && d > new Date(customEnd + "T23:59:59")) return false;
        return true;
      }
      return true;
    });
  };

  const paidSessions = filterByPeriod(sessions.filter(s => s.paid));
  const totalRevenue = paidSessions.reduce((a, s) => a + s.price, 0);
  const totalFees = paidSessions.reduce((a, s) => a + (s.price * CC_RATE + CC_FIXED), 0);
  const totalRefunds = filterByPeriod(refunds, "date").reduce((a, r) => a + r.amount, 0);
  const netRevenue = totalRevenue - totalFees - totalRefunds;
  const byTrainer = staff.map(trainer => {
    const ts = paidSessions.filter(s => s.trainerId === trainer.id);
    const rev = ts.reduce((a, s) => a + s.price, 0);
    const fees = ts.reduce((a, s) => a + (s.price * CC_RATE + CC_FIXED), 0);
    return { trainer, sessions: ts.length, revenue: rev, fees };
  });
  const byMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const mSessions = sessions.filter(s => { const sd = new Date(s.date + "T12:00:00"); return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear() && s.paid; });
    return { month, revenue: mSessions.reduce((a, s) => a + s.price, 0) };
  });
  const maxRev = Math.max(...byMonth.map(m => m.revenue), 1);

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, marginBottom: 20 }}>Reports</h1>
      <div style={{ display: "flex", gap: 6, marginBottom: period === "custom" ? 12 : 20, flexWrap: "wrap" }}>
        {[["all", "All Time"], ["thisMonth", "This Month"], ["lastMonth", "Last Month"], ["thisYear", "This Year"], ["lastYear", "Last Year"], ["custom", "Custom Range"]].map(([v, l]) => (
          <button key={v} onClick={() => setPeriod(v)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: period === v ? C.obsidian : C.fog, color: period === v ? C.cream : C.charcoal }}>{l}</button>
        ))}
      </div>
      {period === "custom" && (
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <Field label="From">
            <input type="date" style={inputStyle} value={customStart} onChange={e => setCustomStart(e.target.value)} />
          </Field>
          <Field label="To">
            <input type="date" style={inputStyle} value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
          </Field>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[["Gross Revenue", `$${totalRevenue.toFixed(2)}`, C.sage], ["Processing Fees", `$${totalFees.toFixed(2)}`, C.rust], ["Refunds Issued", `$${totalRefunds.toFixed(2)}`, C.rust], ["Net Revenue", `$${netRevenue.toFixed(2)}`, C.gold], ["Sessions (paid)", paidSessions.length, C.sky]].map(([l, v, c]) => (
          <Card key={l} style={{ textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: c, fontFamily: "Georgia, serif" }}>{v}</div>
            <div style={{ fontSize: 11, color: C.silver, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>{l}</div>
          </Card>
        ))}
      </div>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: C.obsidian, marginBottom: 16 }}>Revenue — Last 6 Months</div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
          {byMonth.map(m => (
            <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.obsidian }}>${m.revenue}</div>
              <div style={{ width: "100%", background: `linear-gradient(to top, ${C.gold}, ${C.goldLight})`, height: `${(m.revenue / maxRev) * 80}px`, minHeight: m.revenue > 0 ? 4 : 0, borderRadius: "4px 4px 0 0" }} />
              <div style={{ fontSize: 11, color: C.silver, fontWeight: 600 }}>{m.month}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{ fontWeight: 800, fontSize: 14, color: C.obsidian, marginBottom: 14 }}>Revenue by Trainer</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead><tr style={{ background: C.cream }}>{["Trainer", "Sessions", "Gross", "CC Fees", "Net"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: h === "Trainer" ? "left" : "right", fontSize: 11, fontWeight: 800, color: C.silver, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
          <tbody>{byTrainer.map(r => <tr key={r.trainer.id} style={{ borderBottom: `1px solid ${C.fog}` }}><td style={{ padding: "10px 12px", fontWeight: 700, color: C.obsidian }}>{r.trainer.name}</td><td style={{ padding: "10px 12px", textAlign: "right", color: C.steel }}>{r.sessions}</td><td style={{ padding: "10px 12px", textAlign: "right", color: C.sage, fontWeight: 700 }}>${r.revenue.toFixed(2)}</td><td style={{ padding: "10px 12px", textAlign: "right", color: C.rust }}>-${r.fees.toFixed(2)}</td><td style={{ padding: "10px 12px", textAlign: "right", color: C.obsidian, fontWeight: 800 }}>${(r.revenue - r.fees).toFixed(2)}</td></tr>)}</tbody>
        </table>
      </Card>
    </div>
  );
}

function SettingsPage({ settings, setSettings }) {
  const logoRef = useRef();
  const handleLogoUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setSettings(s => ({ ...s, logoUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.obsidian, marginBottom: 20 }}>Settings</h1>
      <div style={{ display: "grid", gap: 20, maxWidth: 600 }}>

        <Card>
          <h3 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Business Logo</h3>
          <p style={{ color: C.silver, fontSize: 13, margin: "0 0 14px" }}>Shown on the client login screen. PNG or JPG recommended.</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            {settings.logoUrl
              ? <img src={settings.logoUrl} alt="Logo" style={{ maxHeight: 70, maxWidth: 180, objectFit: "contain", borderRadius: 8, border: `1px solid ${C.fog}`, padding: 6, background: C.obsidian }} />
              : <div style={{ width: 100, height: 70, background: C.fog, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🐾</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <input type="file" accept="image/*" ref={logoRef} onChange={handleLogoUpload} style={{ display: "none" }} />
              <Btn variant="ghost" small onClick={() => logoRef.current.click()}>Upload Logo</Btn>
              {settings.logoUrl && <Btn variant="danger" small onClick={() => setSettings(s => ({ ...s, logoUrl: "" }))}>Remove</Btn>}
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Business Info</h3>
          <div style={{ display: "grid", gap: 14 }}>
            <Input label="Business Name" value={settings.businessName} onChange={e => setSettings(s => ({ ...s, businessName: e.target.value }))} />
            <Input label="Phone" value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} />
            <Input label="Email" value={settings.email} onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} />
            <Input label="Address" value={settings.address} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} />
          </div>
        </Card>

        <Card>
          <h3 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Session Pricing</h3>
          <p style={{ color: C.silver, fontSize: 13, margin: "0 0 14px" }}>All private sessions are 90 minutes with a 30-minute buffer.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Initial — Facility ($)" type="number" value={settings.priceInitialFacility || ""} placeholder="150" onChange={e => setSettings(s => ({ ...s, priceInitialFacility: e.target.value }))} />
            <Input label="Follow-Up — Facility ($)" type="number" value={settings.priceFollowupFacility || ""} placeholder="120" onChange={e => setSettings(s => ({ ...s, priceFollowupFacility: e.target.value }))} />
            <Input label="Initial — In-Home ($)" type="number" value={settings.priceInitialInHome || ""} placeholder="175" onChange={e => setSettings(s => ({ ...s, priceInitialInHome: e.target.value }))} />
            <Input label="Follow-Up — In-Home ($)" type="number" value={settings.priceFollowupInHome || ""} placeholder="145" onChange={e => setSettings(s => ({ ...s, priceFollowupInHome: e.target.value }))} />
          </div>
        </Card>

        <Card>
          <h3 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Reminders</h3>
          <div style={{ display: "grid", gap: 14 }}>
            <Sel label="Session reminder timing" value={settings.reminderHours} onChange={e => setSettings(s => ({ ...s, reminderHours: e.target.value }))}><option value="2">2 hours before</option><option value="24">24 hours before</option><option value="48">48 hours before</option></Sel>
            <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: 14 }}>
              <input type="checkbox" checked={settings.autoReviewRequest} onChange={e => setSettings(s => ({ ...s, autoReviewRequest: e.target.checked }))} />
              Auto-send Google review request after completed sessions
            </label>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Cancellation Policy</h3>
          <TextArea label="Policy text (shown to clients at booking)" value={settings.cancellationPolicy} onChange={e => setSettings(s => ({ ...s, cancellationPolicy: e.target.value }))} />
        </Card>

        <Card>
          <h3 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Liability Waiver</h3>
          <TextArea label="Waiver text" value={settings.waiver} onChange={e => setSettings(s => ({ ...s, waiver: e.target.value }))} style={{ minHeight: 160 }} />
        </Card>

        <Card>
          <h3 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Integrations</h3>
          <div style={{ display: "grid", gap: 14 }}>
            <Input label="Business Email (from address for all emails)" value={settings.businessEmail || ""} placeholder="april@corecanine.com" onChange={e => setSettings(s => ({ ...s, businessEmail: e.target.value }))} />
            <Input label="SendGrid API Key" value={settings.sendgridKey || ""} onChange={e => setSettings(s => ({ ...s, sendgridKey: e.target.value }))} type="password" placeholder="SG.xxxxxxxx (set up later)" hint="Get this from SendGrid once your account is ready" />
            <Input label="Twilio Account SID" value={settings.twilioSid} onChange={e => setSettings(s => ({ ...s, twilioSid: e.target.value }))} placeholder="ACxxxxxxxxxxxxxxxx" />
            <Input label="Twilio Auth Token" value={settings.twilioToken} onChange={e => setSettings(s => ({ ...s, twilioToken: e.target.value }))} type="password" placeholder="••••••••" />
            <Input label="Twilio Phone Number" value={settings.twilioPhone} onChange={e => setSettings(s => ({ ...s, twilioPhone: e.target.value }))} placeholder="+15551234567" />
            <Input label="Stripe Publishable Key" value={settings.stripeKey} onChange={e => setSettings(s => ({ ...s, stripeKey: e.target.value }))} placeholder="pk_live_..." />
            <Input label="Google Review URL" value={settings.googleReviewUrl} onChange={e => setSettings(s => ({ ...s, googleReviewUrl: e.target.value }))} />
          </div>
        </Card>

      </div>
    </div>
  );
}

// ─── STAFF PORTAL WRAPPER ─────────────────────────────────────────────────────
function StaffPortal({ currentUser, onSignOut, staff, setStaff, clients, setClients, sessions, setSessions, classTemplates, setClassTemplates, classInstances, setClassInstances, schedule, setSchedule, oneOffSlots, setOneOffSlots, blockedDates, setBlockedDates, homeworkCards, setHomeworkCards, discountCodes, setDiscountCodes, giftCards, setGiftCards, messages, setMessages, dogNotes, setDogNotes, refunds, emailTemplates, setEmailTemplates, settings, setSettings }) {
  const [page, setPage] = useState("dashboard");
  const [navOpen, setNavOpen] = useState(true);
  const nav = currentUser.role === "admin" ? NAV_ADMIN : NAV_TRAINER;
  const pageProps = { currentUser, staff, setStaff, clients, setClients, sessions, setSessions, classTemplates, setClassTemplates, classInstances, setClassInstances, schedule, setSchedule, oneOffSlots, setOneOffSlots, blockedDates, setBlockedDates, homeworkCards, setHomeworkCards, discountCodes, setDiscountCodes, giftCards, setGiftCards, messages, setMessages, dogNotes, setDogNotes, refunds, emailTemplates, setEmailTemplates, settings, setSettings };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.cream, fontFamily: "Georgia, serif" }}>
      {/* Sidebar */}
      <nav style={{ width: navOpen ? 230 : 62, transition: "width 0.2s", background: C.obsidian, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowX: "hidden" }}>
        <div style={{ padding: navOpen ? "22px 18px 16px" : "22px 14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10, minHeight: 70 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🐾</span>
          {navOpen && <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.cream, letterSpacing: 0.5 }}>Core Canine</div>
            <div style={{ fontSize: 11, color: C.silver }}>{currentUser.role === "admin" ? "Admin Portal" : "Trainer Portal"}</div>
          </div>}
          <button onClick={() => setNavOpen(o => !o)} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>☰</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 0" }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: navOpen ? "11px 18px" : "11px 0", justifyContent: navOpen ? "flex-start" : "center", width: "100%", background: page === n.id ? "rgba(201,147,58,0.15)" : "transparent", border: "none", color: page === n.id ? C.gold : "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: page === n.id ? 700 : 400, textAlign: "left", borderLeft: page === n.id ? `3px solid ${C.gold}` : "3px solid transparent", transition: "all 0.13s", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              {navOpen && n.label}
            </button>
          ))}
        </div>
        <div style={{ padding: navOpen ? "12px 18px" : "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {navOpen && <div style={{ fontSize: 12, color: C.silver, marginBottom: 8 }}>Signed in as <b style={{ color: C.gold }}>{currentUser.name}</b></div>}
          <button onClick={onSignOut} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: 8, padding: navOpen ? "7px 12px" : "7px", cursor: "pointer", fontSize: 12, width: navOpen ? "auto" : 34, fontFamily: "inherit" }}>{navOpen ? "Sign Out" : "↩"}</button>
        </div>
      </nav>
      {/* Main */}
      <main style={{ flex: 1, padding: "32px 30px", overflowX: "hidden", maxWidth: "calc(100vw - 62px)" }}>
        {page === "dashboard" && <Dashboard {...pageProps} />}
        {page === "calendar" && <CalendarView {...pageProps} />}
        {page === "schedule" && <ScheduleManager {...pageProps} />}
        {page === "sessions" && <Sessions {...pageProps} />}
        {page === "classes" && <Classes {...pageProps} />}
        {page === "clients" && <Clients {...pageProps} />}
        {page === "messages" && <StaffMessages {...pageProps} />}
        {page === "homework" && <HomeworkCards {...pageProps} />}
        {page === "staff" && currentUser.role === "admin" && <Staff {...pageProps} />}
        {page === "discounts" && currentUser.role === "admin" && <DiscountsAndGiftCards {...pageProps} />}
        {page === "emails" && currentUser.role === "admin" && <EmailCenter {...pageProps} />}
        {page === "reports" && currentUser.role === "admin" && <Reports {...pageProps} />}
        {page === "settings" && currentUser.role === "admin" && <SettingsPage {...pageProps} />}
      </main>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null); // null = logged out
  const [userType, setUserType] = useState(null); // "staff" | "client"
  const [isNewClient, setIsNewClient] = useState(false);
  const [clientProfile, setClientProfile] = useState(null);

  // Shared data state (owned here so both portals work from same data)
  const [staff, setStaff] = useState(SEED_STAFF);
  const [clients, setClients] = useState(SEED_CLIENTS);
  const [sessions, setSessions] = useState(SEED_SESSIONS);
  const [classTemplates, setClassTemplates] = useState(SEED_CLASS_TEMPLATES);
  const [classInstances, setClassInstances] = useState(SEED_CLASS_INSTANCES);
  const [schedule, setSchedule] = useState(SEED_SCHEDULE);
  const [oneOffSlots, setOneOffSlots] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [homeworkCards, setHomeworkCards] = useState(SEED_HOMEWORK);
  const [discountCodes, setDiscountCodes] = useState(SEED_DISCOUNT_CODES);
  const [giftCards, setGiftCards] = useState(SEED_GIFT_CARDS);
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [dogNotes, setDogNotes] = useState(SEED_DOG_NOTES);
  const [refunds] = useState(SEED_REFUNDS);
  const [emailTemplates, setEmailTemplates] = useState(SEED_EMAIL_TEMPLATES);
  const [settings, setSettings] = useState({
    businessName: "Core Canine", phone: "555-CORE", email: "hello@corecanine.com", address: "123 Training Ln",
    logoUrl: "",
    priceInitialFacility: 150, priceFollowupFacility: 120,
    priceInitialInHome: 175, priceFollowupInHome: 145,
    businessEmail: "april@corecanine.com", sendgridKey: "",
    reminderHours: "24", autoReviewRequest: true,
    cancellationPolicy: "Cancellations made more than 72 hours before your session may be rescheduled. Cancellations within 72 hours are non-refundable.",
    waiver: "I understand that dog training involves inherent risks. I agree that Core Canine and its trainers are not liable for any injury or damage arising from training sessions. I confirm that my dog is up-to-date on all required vaccinations.",
    twilioSid: "", twilioToken: "", twilioPhone: "", stripeKey: "", googleReviewUrl: GOOGLE_REVIEW_URL,
  });

  const handleSignOut = () => { setCurrentUser(null); setUserType(null); setIsNewClient(false); setClientProfile(null); };

  const handleStaffLogin = (user) => { setCurrentUser(user); setUserType("staff"); };

  const handleClientLogin = (user, isNew) => {
    setCurrentUser(user);
    setUserType("client");
    setIsNewClient(isNew);
    if (!isNew) setClientProfile(user);
  };

  const handleOnboarded = (profile) => {
    setClientProfile(profile);
    setClients(cs => [...cs, { ...profile, id: Date.now() }]);
    setIsNewClient(false);
  };

  // Not logged in
  if (!currentUser) {
    return <UnifiedLogin onStaffLogin={handleStaffLogin} onClientLogin={handleClientLogin} staff={staff} clients={clients} settings={settings} />;
  }

  // New client needs onboarding
  if (userType === "client" && isNewClient) {
    return <Onboarding client={currentUser} onComplete={handleOnboarded} />;
  }

  // Client portal
  if (userType === "client") {
    return (
      <ClientPortal
        client={clientProfile || currentUser}
        setClient={setClientProfile}
        onSignOut={handleSignOut}
        staff={staff}
        sessions={sessions}
        classTemplates={classTemplates}
        classInstances={classInstances}
        discountCodes={discountCodes}
        giftCards={giftCards}
        messages={messages}
        setMessages={setMessages}
        schedule={schedule}
      />
    );
  }

  // Staff portal
  return (
    <StaffPortal
      currentUser={currentUser}
      onSignOut={handleSignOut}
      staff={staff} setStaff={setStaff}
      clients={clients} setClients={setClients}
      sessions={sessions} setSessions={setSessions}
      classTemplates={classTemplates} setClassTemplates={setClassTemplates}
      classInstances={classInstances} setClassInstances={setClassInstances}
      schedule={schedule} setSchedule={setSchedule}
      oneOffSlots={oneOffSlots} setOneOffSlots={setOneOffSlots}
      blockedDates={blockedDates} setBlockedDates={setBlockedDates}
      homeworkCards={homeworkCards} setHomeworkCards={setHomeworkCards}
      discountCodes={discountCodes} setDiscountCodes={setDiscountCodes}
      giftCards={giftCards} setGiftCards={setGiftCards}
      messages={messages} setMessages={setMessages}
      dogNotes={dogNotes} setDogNotes={setDogNotes}
      refunds={refunds}
      emailTemplates={emailTemplates} setEmailTemplates={setEmailTemplates}
      settings={settings} setSettings={setSettings}
    />
  );
}
