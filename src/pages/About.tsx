import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const About = () => {
  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ═══ HERO — Full-bleed portrait ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
          className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden"
        >
          <img
            src="/dwindik/1.jpeg"
            alt="Dwindik"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 md:px-12 pb-10 sm:pb-14">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-foreground tracking-[0.04em] uppercase leading-[0.85]"
            >
              Dwindik
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-3 sm:mt-4 font-body text-[10px] sm:text-xs tracking-[0.3em] uppercase text-foreground/35"
            >
              Director of Photography · Visual Storyteller
            </motion.p>
          </div>
        </motion.div>

        {/* ═══ BIO SECTION ═══ */}
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8 }}
              className="font-display text-2xl sm:text-3xl md:text-4xl font-light text-foreground/85 leading-[1.4] tracking-[0.01em]"
            >
              Dwindik is a Nigerian-based Director of Photography, visual effects artist, and editor. Through his production company Cre8te, his work bridges the worlds of faith-driven storytelling and cinematic craft.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mt-10 sm:mt-14 space-y-6 font-body text-sm sm:text-base leading-[1.9] text-foreground/50"
            >
              <p>
                With a deep passion for visual storytelling, Dwindik — through Cre8te — has served as the creative backbone behind some of the most impactful productions in collaboration with The Winlos Studio, working across direction of photography, cinematography, lighting, editing, VFX, and sound design.
              </p>
              <p>
                His filmography includes the acclaimed <em className="text-foreground/65">Prophet Suddenly</em> trilogy, the <em className="text-foreground/65">Spirituals</em> series, <em className="text-foreground/65">Holy Scam</em>, and <em className="text-foreground/65">Love in the Guest Room</em> — all streaming on YouTube and reaching audiences across Africa and the diaspora. Every project is built on a foundation of purpose: stories that challenge, convict, and inspire.
              </p>
              <p>
                Beyond the camera, Dwindik brings a meticulous eye to post-production — shaping each frame through colour grading, visual effects, and sound design to create an immersive viewing experience. His approach is rooted in the belief that film is not just entertainment — it is ministry, and every frame carries weight.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══ IMAGE BREAK — Two-column ═══ */}
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8 }}
              className="aspect-[3/4] overflow-hidden"
            >
              <img
                src="/dwindik/2.jpeg"
                alt="Dwindik — Behind the scenes"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="aspect-[3/4] overflow-hidden"
            >
              <img
                src="/dwindik/3.jpeg"
                alt="Dwindik — On set"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* ═══ CRAFT SECTION — with pull quote ═══ */}
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="border-t border-foreground/[0.06] pt-10 sm:pt-14"
          >
            <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/20 block mb-8 sm:mb-12">
              The Craft
            </span>
            <blockquote className="max-w-2xl font-display text-xl sm:text-2xl md:text-3xl font-light text-foreground/70 leading-[1.5] tracking-[0.01em] italic">
              "Every frame is intentional. I don't just capture moments — I shape them. Light, movement, colour — they all serve the story. And the story always has to matter."
            </blockquote>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 max-w-3xl"
          >
            <div>
              <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/20 block mb-3">
                Cinematography & Lighting
              </span>
              <p className="font-body text-sm leading-[1.8] text-foreground/45">
                Crafting mood and atmosphere through natural and controlled lighting setups. From intimate dialogue scenes to sweeping exteriors, every shot is designed to serve the emotional arc of the story.
              </p>
            </div>
            <div>
              <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/20 block mb-3">
                Editing & Post-Production
              </span>
              <p className="font-body text-sm leading-[1.8] text-foreground/45">
                Shaping raw footage into polished narratives through meticulous editing, colour grading, and pacing. Post-production is where the story finds its final voice.
              </p>
            </div>
            <div>
              <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/20 block mb-3">
                Visual Effects
              </span>
              <p className="font-body text-sm leading-[1.8] text-foreground/45">
                Seamlessly blending practical and digital elements to enhance the visual world of each film — from subtle compositing to atmospheric enhancements.
              </p>
            </div>
            <div>
              <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/20 block mb-3">
                Sound Design
              </span>
              <p className="font-body text-sm leading-[1.8] text-foreground/45">
                Building immersive soundscapes that deepen the emotional impact of each scene. Sound is not an afterthought — it is an integral layer of the storytelling.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ═══ FULL-WIDTH IMAGE ═══ */}
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1 }}
            className="w-full aspect-[21/9] sm:aspect-[2.5/1] overflow-hidden"
          >
            <img
              src="/dwindik/4.jpeg"
              alt="Dwindik — Production"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </section>

        {/* ═══ PRODUCTION COMPANY & CONTACT ═══ */}
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24 pb-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="border-t border-foreground/[0.06] pt-10 sm:pt-14"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
              {/* Left — Production company */}
              <div>
                <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/20 block mb-4">
                  Production Company
                </span>
                <p className="font-display text-3xl sm:text-4xl font-light text-foreground/80 tracking-[0.06em] uppercase">
                  Cre8te
                </p>
                <p className="mt-4 font-body text-sm leading-[1.8] text-foreground/40">
                  Cre8te is Dwindik's production company — a creative studio dedicated to visual storytelling, cinematography, and post-production. Based in Nigeria, reaching the world.
                </p>
                <p className="mt-3 font-body text-[10px] tracking-[0.2em] uppercase text-foreground/25">
                  In collaboration with The Winlos Studio
                </p>
              </div>

              {/* Right — Portrait */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="aspect-[4/5] overflow-hidden"
              >
                <img
                  src="/dwindik/5.jpeg"
                  alt="Dwindik — Portrait"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border-t border-foreground/[0.06] pt-8 sm:pt-10 mt-14 sm:mt-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/20 block mb-2">
                Get in Touch
              </span>
              <a
                href="mailto:hello@dwindik.com"
                className="font-body text-sm text-foreground/45 hover:text-foreground/75 transition-colors duration-500"
              >
                hello@dwindik.com
              </a>
            </div>
            <Link
              to="/film"
              className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/25 hover:text-foreground/60 transition-colors duration-500 border-b border-foreground/10 pb-1 inline-block"
            >
              View Work →
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default About;
