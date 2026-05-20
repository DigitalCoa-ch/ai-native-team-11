"use client";
import { useEffect, useRef } from "react";

function MIcon({ n, s }: { n: string; s?: number }) {
  return <span className="material-symbols-outlined" style={{ fontSize: s || 24 }}>{n}</span>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass-effect rounded-2xl ${className}`}>{children}</div>;
}

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    const els = document.querySelectorAll(".animate-on-scroll");
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.remove("opacity-0", "translate-y-10"); }
      });
    }, { threshold: 0.1 });
    els.forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);


  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      {/* Top Navbar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 shadow-sm">
        <nav className="flex items-center justify-between px-margin-desktop py-4 max-w-container-max-width mx-auto">
          <div className="font-display-lg text-headline-md tracking-tighter text-primary">CampusAI Navigator</div>
          <div className="hidden md:flex gap-8">
            <a className="font-label-md text-label-md text-primary font-bold border-b-2 border-primary pb-1" href="#">Features</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">How it Works</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="font-label-md text-label-md text-on-surface-variant hover:opacity-90 transition-all duration-300">Login</button>
            <button className="bg-secondary-container text-on-secondary-container px-6 py-2 rounded-full font-label-md text-label-md hover:opacity-90 transition-all duration-300 active:scale-95">Get Started</button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="min-h-screen pt-32 pb-20 hero-gradient overflow-hidden">
          <div className="max-w-container-max-width mx-auto px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
            {/* Left: Text */}
            <div className="z-10">
              <h1 className="font-display-lg text-display-lg mb-6 leading-[1.1]">
                Your Semester. <br/>
                Organized. Automated. <br/>
                <span className="text-tertiary">Under Control.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-lg">
                Turn the chaos of syllabi, lectures, and deadlines into a crystal-clear path to graduation. CampusAI does the heavy lifting so you can focus on learning.
              </p>
              <button className="electric-gradient text-on-secondary px-10 py-4 rounded-xl font-headline-md text-label-md hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-secondary-container/20">
                Get Your Free Account
              </button>
            </div>
            {/* Right: Dashboard Preview */}
            <div className="relative mt-12 lg:mt-0">
              <GlassCard className="p-6 shadow-2xl relative z-20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-headline-md text-primary">Weekly Schedule</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-error"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-3 mb-8">
                  <div className="h-24 bg-primary/10 rounded-lg border border-primary/20 p-2 text-[10px] uppercase font-bold text-primary flex items-end justify-center pb-1">Mon</div>
                  <div className="h-24 bg-secondary/10 rounded-lg border border-secondary/20 p-2 text-[10px] uppercase font-bold text-secondary flex flex-col items-center justify-center gap-1">
                    <span>Tue</span><div className="bg-secondary/30 h-8 rounded w-full flex items-center justify-center text-[9px] text-secondary">Lecture</div>
                  </div>
                  <div className="h-24 bg-tertiary/10 rounded-lg border border-tertiary/20 p-2 text-[10px] uppercase font-bold text-tertiary flex items-end justify-center pb-1">Wed</div>
                  <div className="h-24 bg-error/10 rounded-lg border border-error/20 p-2 text-[10px] uppercase font-bold text-error flex flex-col items-center justify-center gap-1">
                    <span>Thu</span><div className="bg-error/30 h-10 rounded w-full flex items-center justify-center text-[9px] text-error">Essay Due</div>
                  </div>
                  <div className="h-24 bg-primary/10 rounded-lg border border-primary/20 p-2 text-[10px] uppercase font-bold text-primary flex items-end justify-center pb-1">Fri</div>
                </div>
                <div className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/30 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <MIcon n="description" s={20} />
                    <div>
                      <p className="font-label-md text-label-md">Ethics Case Study</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">48 hours remaining</p>
                    </div>
                  </div>
                  <div className="text-error font-bold text-label-sm">Urgent</div>
                </div>
              </GlassCard>

              {/* AI Bubble */}
              <div className="absolute -bottom-8 -left-8 lg:-left-20 glass-effect p-5 rounded-2xl rounded-bl-none max-w-xs z-30 shadow-2xl animate-float">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary ai-pulse shrink-0">
                    <MIcon n="auto_awesome" s={18} />
                  </div>
                  <p className="font-body-md text-body-md leading-relaxed">
                    You have 2 essays due Thursday — want me to <span className="text-tertiary font-bold">summarize your lecture notes</span> first?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="py-24 bg-surface-container-lowest relative">
          {/* Wave divider */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
            <svg className="relative block w-[calc(100%+1.3px)] h-[50px] fill-background" preserveAspectRatio="none" viewBox="0 0 1200 120">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
          <div className="max-w-container-max-width mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            {/* Left: Problem */}
            <div className="space-y-6">
              <span className="text-error font-label-md tracking-widest uppercase">The Reality</span>
              <h2 className="font-headline-lg text-headline-lg">Overwhelmed &amp; Buried</h2>
              <p className="font-body-lg text-on-surface-variant">Caffeine-fueled nights, missing assignments, and a desk that looks like a paper storm. The mental load of managing a semester should not be the hardest part of college.</p>
              <div className="rounded-2xl overflow-hidden border border-outline-variant/30 shadow-lg">
                <img alt="Messy Desk Reality" className="w-full object-cover aspect-video" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJRtqFzebtcC6__DQWJwEOBUaVQBqGkGGTtY5UAPke4Sx5ZyOkpciE75RVVDckc2_YeRJDKDfWaUU8QFHlQZjI72vXr8VC6TqGR9kfzDfbI_46TjN9QKNc2javSm0SQpyqAcKziRhxQi7iYvSh0UBHvlMhac12YCuskpyJtK1hEujvDKr5PQLyA8DNqqofvReQ1zt0-k5uezWhkIaNmuNDWZ3jrDlB3qYi9Au0zYxcJvSVafA-6eCAXcduDOsUWgTR2vyfbYaHytNX" />
              </div>
            </div>
            {/* Right: Solution */}
            <div className="space-y-6">
              <span className="text-tertiary font-label-md tracking-widest uppercase">The Fix</span>
              <h2 className="font-headline-lg text-headline-lg">Total Academic Serenity</h2>
              <p className="font-body-lg text-on-surface-variant">Automated schedules, smart prioritization, and an AI assistant that anticipates your needs. Step into a world where everything has its place and your time is yours again.</p>
              <div className="rounded-2xl overflow-hidden border border-tertiary/20 shadow-2xl shadow-tertiary/10 scale-105">
                <img alt="Clean Desk Fix" className="w-full object-cover aspect-video" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA08MQIwU74deZKGoI0rOcfVJ6Xr8t1xphr_aWD5U7FXivje5VUGqTTyeweI84dCkG1OZ3UuFpmTvK9pAAcZPzv37T1i59TvBLvU8JTCVjS8MtafCyTnxbHfAoyd8UZOnAvQZsiBuat93dDctvU0AQocWGPJtZJoBsQyKagz4Px2NIa0s42L5JI5-iW0CZiYM-yOPzjelBsXp-Kn00lbbh7wM20v1YOWhsDz4PqyUcl8F9FLLPN026qotBAPGbxsZjgObARDuCMBAE" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 bg-background">
          <div className="max-w-container-max-width mx-auto px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-display-lg text-headline-lg mb-4">Intelligent Infrastructure</h2>
              <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">Five ways CampusAI changes the game for high-performing students.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {/* Card 1: Calendar */}
              <GlassCard className="md:col-span-2 p-8 hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <MIcon n="calendar_month" s={24} />
                </div>
                <h3 className="font-headline-md text-headline-md mb-3">Automated Organization</h3>
                <p className="font-body-md text-on-surface-variant">Drop your syllabus PDF and watch as your entire semester maps itself out instantly.</p>
              </GlassCard>
              {/* Card 2: Summarize */}
              <GlassCard className="md:col-span-2 p-8 hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6">
                  <MIcon n="summarize" s={24} />
                </div>
                <h3 className="font-headline-md text-headline-md mb-3">Lecture Summarization</h3>
                <p className="font-body-md text-on-surface-variant">Turn hours of audio or pages of messy notes into actionable, structured study guides.</p>
              </GlassCard>
              {/* Card 3: Notifications */}
              <GlassCard className="md:col-span-2 p-8 hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary mb-6">
                  <MIcon n="notifications_active" s={24} />
                </div>
                <h3 className="font-headline-md text-headline-md mb-3">Smart Reminders</h3>
                <p className="font-body-md text-on-surface-variant">Gentle nudges based on your actual workload, not just arbitrary dates.</p>
              </GlassCard>
              {/* Card 4: Priority */}
              <GlassCard className="md:col-span-3 p-8 hover:-translate-y-2 transition-all duration-300 flex items-center gap-8">
                <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center text-error shrink-0">
                  <MIcon n="priority_high" s={32} />
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md mb-3">Study Priorities</h3>
                  <p className="font-body-md text-on-surface-variant">Our algorithm analyzes grade weights and difficulty to tell you exactly what to study first.</p>
                </div>
              </GlassCard>
              {/* Card 5: Bolt */}
              <GlassCard className="md:col-span-3 p-8 hover:-translate-y-2 transition-all duration-300 flex items-center gap-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shrink-0">
                  <MIcon n="bolt" s={32} />
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md mb-3">Personalized Assistant</h3>
                  <p className="font-body-md text-on-surface-variant">A persistent companion that handles the scheduling friction so you can focus on the mastery.</p>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-tertiary-container/30">
          <div className="max-w-container-max-width mx-auto px-margin-desktop">
            <div className="text-center mb-20">
              <h2 className="font-display-lg text-headline-lg">Three Steps to Clarity</h2>
            </div>
            <div className="flex flex-col md:flex-row items-start justify-between gap-12 relative">
              {/* Step 1 */}
              <div className="flex-1 text-center relative z-10">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center border-2 border-primary mx-auto mb-6 shadow-xl">
                  <MIcon n="upload_file" s={32} />
                </div>
                <h4 className="font-headline-md text-headline-md mb-3">1. Upload</h4>
                <p className="font-body-md text-on-surface-variant">Upload your syllabus, lecture slides, or voice recordings to the hub.</p>
              </div>
              {/* Step 2 */}
              <div className="flex-1 text-center relative z-10">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center border-2 border-secondary mx-auto mb-6 shadow-xl">
                  <MIcon n="dashboard_customize" s={32} />
                </div>
                <h4 className="font-headline-md text-headline-md mb-3">2. Dashboard</h4>
                <p className="font-body-md text-on-surface-variant">The AI builds your dynamic study plan and highlights critical deadlines.</p>
              </div>
              {/* Step 3 */}
              <div className="flex-1 text-center relative z-10">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center border-2 border-tertiary mx-auto mb-6 shadow-xl">
                  <MIcon n="school" s={32} />
                </div>
                <h4 className="font-headline-md text-headline-md mb-3">3. Success</h4>
                <p className="font-body-md text-on-surface-variant">Execute with confidence, ace your exams, and maintain your sanity.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-margin-desktop">
          <div className="max-w-container-max-width mx-auto">
            <div className="electric-gradient rounded-3xl p-12 md:p-20 text-center relative overflow-hidden group">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
              <h2 className="font-display-lg text-display-lg text-on-secondary mb-6 relative z-10">Ready to Own Your Education?</h2>
              <p className="font-body-lg text-on-secondary/80 max-w-2xl mx-auto mb-12 relative z-10">Join thousands of students who have traded stress for structure. Your most productive semester starts today.</p>
              <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-surface text-primary px-10 py-4 rounded-xl font-headline-md text-label-md hover:scale-105 transition-transform active:scale-95 shadow-2xl">Create Free Account</button>
                <button className="bg-transparent border-2 border-on-secondary/30 text-on-secondary px-10 py-4 rounded-xl font-headline-md text-label-md hover:bg-on-secondary/10 transition-colors">See Pricing</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full rounded-t-xl bg-surface-container-lowest border-t border-outline-variant/10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-gutter px-margin-desktop py-12 max-w-container-max-width mx-auto">
          <div className="col-span-2 lg:col-span-1">
            <div className="font-headline-md text-headline-md text-on-surface mb-4">CampusAI</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">Elevating academic performance through intelligent automation and serenity-driven design.</p>
          </div>
          <div>
            <h5 className="text-tertiary font-medium mb-4">Product</h5>
            <ul className="space-y-3 font-body-sm text-body-sm">
              <li><a className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Features</a></li>
              <li><a className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Integrations</a></li>
              <li><a className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-tertiary font-medium mb-4">Resources</h5>
            <ul className="space-y-3 font-body-sm text-body-sm">
              <li><a className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Study Tips</a></li>
              <li><a className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Help Center</a></li>
              <li><a className="text-on-surface-variant hover:text-secondary transition-colors" href="#">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-tertiary font-medium mb-4">Company</h5>
            <ul className="space-y-3 font-body-sm text-body-sm">
              <li><a className="text-on-surface-variant hover:text-secondary transition-colors" href="#">About</a></li>
              <li><a className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Careers</a></li>
              <li><a className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Blog</a></li>
            </ul>
          </div>
          <div className="col-span-full mt-12 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 CampusAI Navigator. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Legal</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Privacy</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
