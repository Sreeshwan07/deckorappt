import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Briefcase,
  Presentation,
  Clock,
  Wand2,
  ChevronRight,
  Star,
  Download,
  Play,
  Zap,
  Brain,
  Coffee,
} from "lucide-react";

const useCases = [
  { icon: GraduationCap, title: "Seminar Topics", desc: "B.Tech, MBA, MCA — generate full decks for any seminar in 60 seconds." },
  { icon: FlaskConical, title: "Lab & Project Reports", desc: "Definitions, formulas, diagrams, applications — all auto-structured." },
  { icon: BookOpen, title: "Assignments", desc: "From DBMS to Thermodynamics — turn syllabus topics into ready decks." },
  { icon: Briefcase, title: "Internship Reviews", desc: "Look professional in your final review with cinematic templates." },
];

const features = [
  { icon: Brain, title: "AI that knows your syllabus", desc: "Tuned for engineering, science, commerce, and arts curricula — not generic fluff.", span: "md:col-span-2" },
  { icon: Clock, title: "60-second decks", desc: "Topic in. Deck out. No more 2 AM panic before submission." },
  { icon: Download, title: "PPT, PDF & DOCX", desc: "Export to anything. Edit in PowerPoint, share as PDF, submit as DOCX." },
  { icon: Play, title: "Present Mode", desc: "Fullscreen, keyboard controlled, projector-ready text sizes." },
  { icon: Zap, title: "Only ₹20 per export", desc: "Generate and edit unlimited. Pay only when you download. Cheaper than a samosa.", span: "md:col-span-2" },
];

const testimonials = [
  { name: "Aarav, B.Tech CSE", quote: "Made my OS seminar deck in literally 2 minutes. Got 9/10.", emoji: "🚀" },
  { name: "Riya, MBA", quote: "Saved my marketing case study night. Looks better than Canva.", emoji: "✨" },
  { name: "Karthik, ECE", quote: "The formulas come out clean. No more LaTeX pain.", emoji: "🔥" },
];

const subjects = [
  "Machine Learning", "Thermodynamics", "DBMS", "Operating Systems", "Microeconomics",
  "Organic Chemistry", "Data Structures", "Signal Processing", "Marketing Strategy",
  "Quantum Physics", "Compiler Design", "Financial Accounting",
];

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [topic, setTopic] = useState("");

  const handleGenerate = () => {
    if (user) {
      navigate(`/create${topic ? `?topic=${encodeURIComponent(topic)}` : ""}`);
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen cinematic-bg text-foreground relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none"
           style={{ background: "hsl(var(--primary) / 0.18)" }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
           style={{ background: "hsl(var(--accent) / 0.15)" }} />

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-background/40 border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <BrandLogo className="text-2xl" />
          <div className="hidden md:flex items-center gap-7 text-sm">
            <a href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">For Students</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>Dashboard</Button>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3">
                Login
              </button>
            )}
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground rounded-full px-5 hover:brightness-110 transition-all glow-primary-sm"
              onClick={handleGenerate}
            >
              Try Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="font-mono-cy uppercase tracking-widest text-foreground/70">Built for students · Loved by 10,000+</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display leading-[1.02] tracking-tighter">
              Stop fighting PowerPoint.{" "}
              <span className="gradient-text text-glow">Start submitting decks that slap.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Type your seminar topic. Get a fully-formatted, professor-ready presentation in 60 seconds —
              with definitions, formulas, diagrams and examples baked in.
            </p>

            <div className="max-w-3xl mx-auto mt-12 relative">
              <div className="relative animated-border rounded-2xl">
                <div className="relative flex items-center bg-background/70 backdrop-blur-xl rounded-2xl">
                  <Wand2 className="absolute left-5 h-5 w-5 text-primary" />
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder="e.g. Convolutional Neural Networks, Newton's Laws, SWOT Analysis…"
                    className="flex-1 h-[68px] pl-14 pr-4 bg-transparent text-foreground placeholder:text-muted-foreground/50 outline-none text-base font-medium"
                  />
                  <Button
                    onClick={handleGenerate}
                    className="gradient-primary text-primary-foreground rounded-xl px-6 h-12 mr-3 text-sm font-semibold hover:scale-[1.02] hover:brightness-110 transition-all glow-primary-sm"
                  >
                    Generate
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                {subjects.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    onClick={() => setTopic(s)}
                    className="text-xs px-3 py-1.5 rounded-full glass-card hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs font-mono-cy uppercase tracking-widest text-muted-foreground/60 mt-6">
                Free to try · No card · Pay ₹20 only when you download
              </p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-12">
              {[
                { v: "60s", l: "avg deck time" },
                { v: "10k+", l: "students using" },
                { v: "4.9★", l: "rated by users" },
              ].map((s) => (
                <div key={s.l} className="glass-card rounded-2xl p-4">
                  <div className="text-2xl font-bold font-display gradient-text">{s.v}</div>
                  <div className="text-[10px] font-mono-cy uppercase tracking-widest text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block text-[10px] font-mono-cy uppercase tracking-widest text-primary mb-4">· Made for student life ·</div>
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4">
              Every <span className="gradient-text">submission</span>, sorted.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From late-night seminars to final-year projects — Deckora has your back.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((u, i) => (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="group glass-card rounded-2xl p-6 hover:border-primary/40 transition-all relative overflow-hidden"
              >
                <div className="absolute -inset-x-10 -top-10 h-32 bg-primary/0 group-hover:bg-primary/10 blur-3xl transition-all" />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                    <u.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold font-display text-lg mb-1.5">{u.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{u.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Features */}
      <section id="features" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block text-[10px] font-mono-cy uppercase tracking-widest text-primary mb-4">· Features ·</div>
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4">
              Why students <span className="gradient-text">switch to Deckora</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={`group glass-card rounded-2xl p-7 hover:border-primary/40 transition-all relative overflow-hidden ${f.span || ""}`}
              >
                <div className="absolute -inset-x-10 -top-10 h-40 bg-primary/0 group-hover:bg-primary/10 blur-3xl transition-all" />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold font-display text-xl mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block text-[10px] font-mono-cy uppercase tracking-widest text-primary mb-4">· How it works ·</div>
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight">
              Three steps. <span className="gradient-text">One coffee.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: "01", icon: Wand2, t: "Type your topic", d: "Anything from your syllabus — be specific or vague, Deckora figures it out." },
              { n: "02", icon: Sparkles, t: "AI builds the deck", d: "Title, intro, core concepts, formulas, examples, applications, summary — auto-structured." },
              { n: "03", icon: Coffee, t: "Edit or present", d: "Tweak slides, swap templates, present fullscreen, or export to PPT/PDF/DOCX." },
            ].map((s) => (
              <div key={s.n} className="glass-card rounded-2xl p-7 relative overflow-hidden">
                <div className="text-[10px] font-mono-cy text-primary mb-4">{s.n}</div>
                <s.icon className="h-7 w-7 text-primary mb-4" />
                <h3 className="font-semibold font-display text-lg mb-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block text-[10px] font-mono-cy uppercase tracking-widest text-primary mb-4">· What students say ·</div>
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight">
              Loved on <span className="gradient-text">every campus</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-card rounded-2xl p-7 relative overflow-hidden"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-base font-display leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="text-xl">{t.emoji}</span>
                  <span>{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 relative">
        <div className="max-w-5xl mx-auto px-6 mb-10 text-center">
          <div className="inline-block text-[10px] font-mono-cy uppercase tracking-widest text-primary mb-4">· Student-friendly pricing ·</div>
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-3">
            Cheaper than a <span className="gradient-text">canteen lunch</span>
          </h2>
          <p className="text-muted-foreground">Generate and preview unlimited decks free. Pay only when you download.</p>
        </div>
        <div className="max-w-4xl mx-auto px-6 grid sm:grid-cols-2 gap-5">
          <div className="glass-card rounded-2xl p-8">
            <div className="text-xs font-mono-cy uppercase tracking-widest text-muted-foreground mb-2">Free Forever</div>
            <div className="text-4xl font-bold font-display mb-1">₹0</div>
            <p className="text-sm text-muted-foreground mb-6">Generate, preview, edit and present unlimited decks.</p>
            <ul className="text-sm space-y-2 text-foreground/80">
              <li>· Unlimited AI generations</li>
              <li>· Full slide editor access</li>
              <li>· Fullscreen present mode</li>
              <li>· All premium templates</li>
            </ul>
          </div>
          <div className="glass-card-strong neon-border rounded-2xl p-8 relative">
            <div className="absolute -top-3 right-6 text-[10px] font-mono-cy uppercase tracking-widest bg-primary text-primary-foreground px-2.5 py-1 rounded-full">Most loved</div>
            <div className="text-xs font-mono-cy uppercase tracking-widest text-primary mb-2">Pay per download</div>
            <div className="text-4xl font-bold font-display mb-1">
              ₹20<span className="text-base text-muted-foreground font-normal"> / export</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Download to PPTX, PDF, or DOCX whenever you need.</p>
            <ul className="text-sm space-y-2 text-foreground/80">
              <li>· High-fidelity 1920×1080 exports</li>
              <li>· Editable PowerPoint output</li>
              <li>· PDF + DOCX bundled in</li>
              <li>· Topic-relevant visuals</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card-strong rounded-3xl p-12 glow-primary relative overflow-hidden scanline"
          >
            <div className="absolute inset-0 gradient-primary-subtle pointer-events-none" />
            <div className="relative">
              <Presentation className="h-10 w-10 text-primary mx-auto mb-5" />
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4">
                Submission tomorrow?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Type your topic now. Have a polished deck before your chai gets cold.
              </p>
              <Button
                onClick={handleGenerate}
                className="gradient-primary text-primary-foreground rounded-full px-8 h-12 text-base font-semibold hover:scale-[1.03] hover:brightness-110 transition-all glow-primary-sm"
              >
                Make my deck — free
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <BrandLogo className="text-base" />
          <p className="font-mono-cy uppercase tracking-widest text-[10px]">© 2026 · For students, by students</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} reason="Sign in to generate and save presentations" />
    </div>
  );
}
