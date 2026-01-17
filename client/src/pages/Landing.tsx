import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Dumbbell, Brain, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="text-3xl font-display font-bold text-primary tracking-wider">YOUR COACH</div>
        <div className="flex gap-4">
          <Link href="/auth?mode=login">
            <Button variant="ghost" className="text-foreground hover:text-primary">Log In</Button>
          </Link>
          <Link href="/auth?mode=register">
            <Button className="bg-primary text-black font-bold hover:bg-primary/90">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-6xl md:text-8xl font-display font-bold leading-[0.9] text-white">
              BUILD YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">DREAM BODY</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              AI-powered bodybuilding coaching tailored to your DNA. Get personalized workout plans, nutrition strategies, and 24/7 expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth?mode=register">
                <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary text-black hover:bg-primary/90 hover:scale-105 transition-transform">
                  Start Your Transformation <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
             {/* Unsplash image of a muscular person in gym lighting */}
            <img 
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
              alt="Athlete training" 
              className="relative z-10 rounded-3xl border border-white/10 shadow-2xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-card/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="w-10 h-10 text-primary" />}
              title="AI Intelligence"
              description="Your coach learns from your feedback and adapts your plan in real-time."
            />
            <FeatureCard 
              icon={<Dumbbell className="w-10 h-10 text-primary" />}
              title="Custom Workouts"
              description="Generated routines based on your equipment, schedule, and goals."
            />
            <FeatureCard 
              icon={<Zap className="w-10 h-10 text-primary" />}
              title="Dynamic Nutrition"
              description="Macro-perfect meal plans that adjust as your body composition changes."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors group">
      <div className="mb-6 p-4 bg-primary/10 rounded-xl w-fit group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-display font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
