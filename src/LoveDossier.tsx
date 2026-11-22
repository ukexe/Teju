import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react'
import {
  ArrowDown,
  ArrowUp,
  BookHeart,
  Brain,
  CakeSlice,
  Check,
  ChevronRight,
  ClipboardCheck,
  Code2,
  Cpu,
  FileHeart,
  Gavel,
  Heart,
  HeartHandshake,
  MapPin,
  Menu,
  MoonStar,
  Quote,
  Scale,
  Sparkles,
  Star,
  Utensils,
  X,
} from 'lucide-react'
import InteractivePhoto from './components/InteractivePhoto'
import './dossier.css'

const HeroScene = lazy(() => import('./components/HeroScene'))

const chapters = [
  ['chapter-1', 'Executive summary'],
  ['chapter-2', 'The beauty problem'],
  ['chapter-3', 'Personality department'],
  ['chapter-4', 'Telugu foodie investigation'],
  ['chapter-5', 'The human being'],
  ['chapter-6', 'The candidate'],
  ['chapter-7', 'Boyfriend advantage'],
  ['chapter-8', 'Relationship roadmap'],
  ['chapter-9', 'Relationship policies'],
  ['chapter-10', 'Final verdict'],
] as const

const apologies = [
  'I sincerely apologise for what I apparently did in your sleep.',
  'I accept full responsibility for my dream universe cameo. My real world record remains spotless.',
  'Dear Dream Court: I was asleep too, but somehow I would still like to say sorry.',
  'Official apology #4: Imaginary me has been placed on extremely strict probation.',
]

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function ChapterLabel({ number, eyebrow }: { number: number; eyebrow: string }) {
  return (
    <div className="chapter-label">
      <span>{String(number).padStart(2, '0')}</span>
      <span aria-hidden="true">/</span>
      <span>{eyebrow}</span>
    </div>
  )
}

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The CSS illustration beneath the canvas is the intentional fallback.
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function useHeroSceneEnabled() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(
      '(min-width: 720px) and (prefers-reduced-motion: no-preference)',
    )
    const update = () => {
      const canvas = document.createElement('canvas')
      const webgl =
        canvas.getContext('webgl2') || canvas.getContext('webgl')
      setEnabled(media.matches && Boolean(webgl))
    }

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return enabled
}

function LoveDossier() {
  const [navOpen, setNavOpen] = useState(false)
  const [activeChapter, setActiveChapter] = useState(1)
  const [apologyIndex, setApologyIndex] = useState(0)
  const [finaleOpen, setFinaleOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 28,
    mass: 0.25,
  })
  const sceneEnabled = useHeroSceneEnabled()

  useEffect(() => {
    const sections = chapters
      .map(([id]) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          setActiveChapter(Number(visible.target.getAttribute('data-chapter')))
        }
      },
      { rootMargin: '-28% 0px -58% 0px', threshold: [0, 0.2, 0.5] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!navOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [navOpen])

  const navigateToChapter = (id: string) => {
    setNavOpen(false)
    window.setTimeout(() => {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      document.getElementById(id)?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
      window.history.replaceState(null, '', `#${id}`)
    }, 80)
  }

  return (
    <>
      <a className="skip-link" href="#chapter-1">
        Skip to the love dossier
      </a>

      <motion.div
        className="scroll-progress"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <div className="current-chapter" aria-live="polite">
        <span>{String(activeChapter).padStart(2, '0')}</span>
        <span className="current-chapter-copy">of 10</span>
      </div>

      <button
        className="mobile-nav-trigger"
        type="button"
        onClick={() => setNavOpen(true)}
        aria-expanded={navOpen}
        aria-controls="mobile-chapter-nav"
      >
        <Menu size={18} aria-hidden="true" />
        Chapters
        <span>{String(activeChapter).padStart(2, '0')}/10</span>
      </button>

      <nav className="chapter-rail" aria-label="Story chapters">
        <span className="rail-title">THE FILE</span>
        <div className="rail-line" aria-hidden="true" />
        {chapters.map(([id, label], index) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(event) => {
              event.preventDefault()
              navigateToChapter(id)
            }}
            className={activeChapter === index + 1 ? 'is-active' : ''}
            aria-label={`Chapter ${index + 1}: ${label}`}
            aria-current={activeChapter === index + 1 ? 'step' : undefined}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span className="rail-label">{label}</span>
          </a>
        ))}
      </nav>

      <AnimatePresence>
        {navOpen && (
          <motion.div
            className="mobile-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNavOpen(false)}
          >
            <motion.nav
              id="mobile-chapter-nav"
              className="mobile-nav-sheet"
              aria-label="Mobile story chapters"
              initial={reduceMotion ? false : { y: '100%' }}
              animate={{ y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', damping: 28, stiffness: 280 }
              }
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mobile-nav-heading">
                <div>
                  <span className="kicker">CONFIDENTIAL INDEX</span>
                  <h2>Choose a chapter</h2>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setNavOpen(false)}
                  aria-label="Close chapter navigation"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
              <div className="mobile-nav-list">
                {chapters.map(([id, label], index) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(event) => {
                      event.preventDefault()
                      navigateToChapter(id)
                    }}
                    className={activeChapter === index + 1 ? 'is-active' : ''}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span>{label}</span>
                    <ChevronRight size={17} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <section
          id="chapter-1"
          data-chapter="1"
          className="chapter hero-chapter"
          aria-labelledby="chapter-1-title"
        >
          <div className="hero-grain" aria-hidden="true" />
          <div className="orb orb-one" aria-hidden="true" />
          <div className="orb orb-two" aria-hidden="true" />
          <div className="chapter-inner hero-inner">
            <div className="hero-copy">
              <Reveal>
                <div className="hero-meta">
                  <span>Birthday special</span>
                  <span>File № TEJU 01</span>
                </div>
                <div className="confidential-stamp">
                  Confidential: girlfriend research
                </div>
                <p className="hero-overline">
                  The love dossier <span aria-hidden="true">✦</span> for Teju
                </p>
                <h1 id="chapter-1-title">
                  An unbiased scientific investigation into why you&apos;re
                  <em> absolutely irreplaceable.</em>
                </h1>
                <p className="hero-subtitle">
                  A comprehensive study conducted by the person who is
                  hopelessly obsessed with you.
                </p>
              </Reveal>

              <Reveal className="hero-objectives" delay={0.12}>
                <div className="objectives-heading">
                  <ClipboardCheck aria-hidden="true" />
                  <span>Today&apos;s research objectives</span>
                </div>
                <ol>
                  <li>
                    <span>01</span>
                    Why you&apos;re one of the most beautiful humans to ever
                    exist.
                  </li>
                  <li>
                    <span>02</span>
                    Why your personality is somehow even more attractive.
                  </li>
                  <li>
                    <span>03</span>
                    Why choosing this boyfriend was statistically excellent.
                  </li>
                </ol>
              </Reveal>

              <Reveal className="method-row" delay={0.2}>
                <span>Extensive observation</span>
                <span>Daily interaction</span>
                <span>Zero objectivity</span>
              </Reveal>
            </div>

            <Reveal className="hero-visual" delay={0.08}>
              <div className="scene-shell" aria-hidden="true">
                <div className="css-scene-fallback">
                  <span className="fallback-heart heart-a">♥</span>
                  <span className="fallback-heart heart-b">♥</span>
                  <span className="fallback-star star-a">✦</span>
                  <span className="fallback-star star-b">✧</span>
                  <div className="fallback-file">
                    <span>SUBJECT</span>
                    <strong>TEJU</strong>
                    <small>STATUS: VERY LOVED</small>
                  </div>
                </div>
                {sceneEnabled && (
                  <SceneBoundary>
                    <Suspense fallback={null}>
                      <HeroScene />
                    </Suspense>
                  </SceneBoundary>
                )}
              </div>
              <div className="hero-sticker sticker-heart">
                100% biased
                <Heart size={18} fill="currentColor" aria-hidden="true" />
              </div>
              <div className="hero-sticker sticker-moon">
                <MoonStar size={19} aria-hidden="true" />
                immortal devotion dept.
              </div>
              <blockquote className="hero-disclaimer">
                “The researcher is extremely biased and refuses to apologise.”
              </blockquote>
            </Reveal>
          </div>

          <a className="scroll-cue" href="#chapter-2">
            <span>Scroll to inspect the evidence</span>
            <ArrowDown aria-hidden="true" />
          </a>
        </section>

        <section
          id="chapter-2"
          data-chapter="2"
          className="chapter beauty-chapter"
          aria-labelledby="chapter-2-title"
        >
          <div className="chapter-inner">
            <Reveal>
              <ChapterLabel number={2} eyebrow="The beauty problem" />
              <div className="headline-grid">
                <div>
                  <p className="kicker">Finding № BEAUTY 1000</p>
                  <h2 id="chapter-2-title">
                    Let&apos;s address the elephant in the room.
                    <em> You&apos;re ridiculously beautiful.</em>
                  </h2>
                </div>
                <div className="score-badge">
                  <span>Beauty score</span>
                  <strong>1000/10</strong>
                  <small>highly scientific boyfriend estimate</small>
                </div>
              </div>
            </Reveal>

            <div className="beauty-layout">
              <Reveal className="photo-stack">
                <figure className="polaroid polaroid-main">
                  <InteractivePhoto
                    src="/media/teju-portrait.webp"
                    alt="Teju smiling softly in a café"
                    width="576"
                    height="1024"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>Exhibit B: unfair advantage</figcaption>
                </figure>
                <figure className="polaroid polaroid-back">
                  <InteractivePhoto
                    src="/media/teju-full.webp"
                    alt="Teju in a relaxed full length café portrait"
                    width="960"
                    height="1280"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>Evidence keeps arriving</figcaption>
                </figure>
                <div className="sparkle-sticker" aria-hidden="true">
                  <Sparkles />
                  excessive cuteness
                </div>
              </Reveal>

              <Reveal className="beauty-copy" delay={0.08}>
                <p className="lead-copy">
                  There are approximately 8 billion people on this planet. And
                  somehow, the universe spent an unreasonable amount of its
                  resources on you.
                </p>
                <div className="finding-list">
                  {[
                    ['Face', 'A genuinely unfair advantage.'],
                    ['Smile', 'A serious threat to my concentration.'],
                    ['Eyes', 'Responsible for questionable decisions.'],
                    ['Overall', 'A violation of the natural order.'],
                  ].map(([label, text]) => (
                    <div className="finding" key={label}>
                      <span>{label}</span>
                      <p>{text}</p>
                      <div className="finding-meter" aria-hidden="true">
                        <span />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="love-note-card">
                  <Heart fill="currentColor" aria-hidden="true" />
                  <p>
                    And that adorable chubby side of yours? I love every bit of
                    it. Cute, gorgeous and ridiculously attractive is a
                    genuinely unfair combination.
                  </p>
                </div>
                <blockquote className="pull-quote">
                  <Quote aria-hidden="true" />
                  You&apos;re the kind of pretty that makes someone forget what
                  they were about to say. Unfortunately, I know this from
                  experience.
                </blockquote>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          id="chapter-3"
          data-chapter="3"
          className="chapter personality-chapter"
          aria-labelledby="chapter-3-title"
        >
          <div className="doodle doodle-arrow" aria-hidden="true">
            ↝
          </div>
          <div className="chapter-inner">
            <Reveal>
              <ChapterLabel number={3} eyebrow="Personality department" />
              <p className="kicker">Lab report: somehow even better</p>
              <h2 id="chapter-3-title">
                A beautiful face is one thing. But you also have a beautiful
                brain? <em>Seriously?</em>
              </h2>
            </Reveal>

            <div className="personality-layout">
              <Reveal className="metric-board">
                {[
                  ['Kindness', '99.99%', 'dangerously high'],
                  ['Innocence', '98%', 'suspiciously adorable'],
                  ['Wit', '97%', 'criminally underrated'],
                  ['Intelligence', '99%', 'very high'],
                  ['Quick thinking', '100%', 'faster than my comebacks'],
                  ['Independence', '100%', 'absolutely impressive'],
                  ['Caring nature', '∞', 'off the charts'],
                ].map(([label, value, note], index) => (
                  <motion.div
                    className="metric-card"
                    key={label}
                    whileHover={{ y: -5, rotate: index % 2 ? 1 : -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                    <p>{note}</p>
                  </motion.div>
                ))}
              </Reveal>

              <Reveal className="personality-photo-wrap" delay={0.1}>
                <figure className="taped-photo">
                  <div className="washi" aria-hidden="true" />
                  <InteractivePhoto
                    src="/media/teju-smile.webp"
                    alt="Teju smiling during a candid café moment"
                    width="1024"
                    height="576"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>Sweet without trying. Witty without warning.</figcaption>
                </figure>
                <div className="personality-verdict">
                  <Brain aria-hidden="true" />
                  <p>
                    Disney princess + stand up comedian + very attractive
                    lawyer who wins arguments against me.
                  </p>
                  <span>And I hate how good you are at it.</span>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          id="chapter-4"
          data-chapter="4"
          className="chapter foodie-chapter"
          aria-labelledby="chapter-4-title"
        >
          <div className="food-pattern" aria-hidden="true" />
          <div className="chapter-inner">
            <Reveal>
              <ChapterLabel number={4} eyebrow="Telugu foodie investigation" />
              <div className="food-heading">
                <div>
                  <p className="kicker">Taste division · appetite approved</p>
                  <h2 id="chapter-4-title">
                    A woman with excellent taste. <em>Literally.</em>
                  </h2>
                </div>
                <div className="food-sticker">
                  <Utensils aria-hidden="true" />
                  Proper foodie
                </div>
              </div>
            </Reveal>

            <div className="foodie-layout">
              <Reveal className="menu-card">
                <div className="menu-top">
                  <span>Proposed field research</span>
                  <span>TABLE FOR TWO</span>
                </div>
                <p className="lead-copy">
                  Teju, you understand that a genuinely good meal can rescue an
                  otherwise terrible day. As a Telugu foodie with excellent
                  taste, your recommendations may also arrive with admirably
                  strong opinions.
                </p>
                <ol className="food-program">
                  {[
                    'Try new restaurants',
                    'Discover underrated food spots',
                    'Eat unnecessarily large quantities',
                    'Pretend to share dessert',
                    'Fail miserably at sharing dessert',
                  ].map((item, index) => (
                    <li key={item}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {item}
                      {index === 4 && <Check aria-hidden="true" />}
                    </li>
                  ))}
                </ol>
                <div className="receipt-total">
                  <span>Budget approval</span>
                  <strong>Pending</strong>
                  <span>Appetite</span>
                  <strong>Approved ✓</strong>
                </div>
              </Reveal>

              <Reveal className="food-visual" delay={0.1}>
                <figure className="restaurant-ticket">
                  <InteractivePhoto
                    src="/media/teju-colourful.webp"
                    alt="Teju in a colourful café setting"
                    width="1280"
                    height="960"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    <MapPin size={15} aria-hidden="true" />
                    Future food expedition headquarters
                  </figcaption>
                </figure>
                <div className="illustrated-plate" aria-hidden="true">
                  <div className="plate-rim">
                    <span className="dosa-shape" />
                    <span className="chutney chutney-one" />
                    <span className="chutney chutney-two" />
                  </div>
                </div>
                <div className="dessert-stamp">Sharing is under review</div>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          id="chapter-5"
          data-chapter="5"
          className="chapter human-chapter"
          aria-labelledby="chapter-5-title"
        >
          <div className="light-leak" aria-hidden="true" />
          <div className="chapter-inner">
            <Reveal>
              <ChapterLabel number={5} eyebrow="The human being behind everything" />
              <p className="kicker">No jokes for a minute</p>
              <h2 id="chapter-5-title">
                Here&apos;s where things <em>get serious.</em>
              </h2>
            </Reveal>

            <div className="letter-layout">
              <Reveal className="letter-paper">
                <span className="letter-date">A note for my favourite human</span>
                <p>
                  Beyond your appearance, humour, intelligence and everything
                  else, there&apos;s something I genuinely admire about you:
                  you&apos;re a truly good human being.
                </p>
                <p>
                  You care about people. You&apos;re independent, thoughtful
                  and considerate. And you&apos;ve learned so much about me in
                  such a short time. Not only the obvious things, but the little
                  things that make me who I am.
                </p>
                <div className="handwritten-list">
                  <span>You listen.</span>
                  <span>You observe.</span>
                  <span>You remember.</span>
                  <span>You try.</span>
                </div>
                <p>
                  You genuinely try to become a better girlfriend every day.
                  That effort is one of the most beautiful things about you.
                </p>
                <blockquote>
                  You don&apos;t just say that you care. You actually make an
                  effort to demonstrate it.
                </blockquote>
                <p className="letter-signoff">
                  And that means more to me than you probably realise.
                  <span>With love, your very lucky boyfriend</span>
                </p>
                <div className="pressed-flower" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </Reveal>

              <Reveal className="warm-photo-column" delay={0.12}>
                <figure className="soft-photo">
                  <InteractivePhoto
                    src="/media/teju-warm.webp"
                    alt="Teju seated with a warm, gentle smile"
                    width="960"
                    height="1280"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>The softest part of the evidence file.</figcaption>
                </figure>
                <figure className="mini-photo">
                  <InteractivePhoto
                    src="/media/teju-profile.webp"
                    alt="A relaxed candid portrait of Teju"
                    width="1280"
                    height="960"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>Thoughtful. Considerate. Teju.</figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          id="chapter-6"
          data-chapter="6"
          className="chapter candidate-chapter"
          aria-labelledby="chapter-6-title"
        >
          <div className="blueprint-grid" aria-hidden="true" />
          <div className="chapter-inner">
            <Reveal>
              <ChapterLabel number={6} eyebrow="Introducing the candidate" />
              <p className="kicker">Applicant file · boyfriend division</p>
              <h2 id="chapter-6-title">
                Enough about the subject. Let&apos;s discuss{' '}
                <em>the boyfriend.</em>
              </h2>
              <p className="chapter-subtitle">
                Introducing the candidate you somehow managed to acquire.
              </p>
            </Reveal>

            <div className="candidate-layout">
              <Reveal className="id-card">
                <div className="id-card-top">
                  <Cpu aria-hidden="true" />
                  <span>RELATIONSHIP SYSTEMS LAB</span>
                  <span>ACTIVE</span>
                </div>
                <div className="id-card-body">
                  <div className="candidate-avatar" aria-hidden="true">
                    <Code2 />
                    <span>BF</span>
                  </div>
                  <div>
                    <p>ROLE</p>
                    <h3>Boyfriend Candidate</h3>
                    <span className="id-code">ID: TEJU BF 0001</span>
                  </div>
                </div>
                <div className="barcode" aria-hidden="true" />
                <div className="id-rating">
                  <span>Self assessment</span>
                  <strong>9.8/10</strong>
                  <small>0.2 deducted for occasionally annoying her</small>
                </div>
              </Reveal>

              <Reveal className="candidate-profile" delay={0.08}>
                <dl>
                  <div>
                    <dt>Profession</dt>
                    <dd>AI Engineer</dd>
                  </div>
                  <div>
                    <dt>Specialisation</dt>
                    <dd>Ridiculously Dedicated Boyfriend Energy</dd>
                  </div>
                  <div>
                    <dt>Core competency</dt>
                    <dd>Overthinking everything</dd>
                  </div>
                  <div>
                    <dt>Secondary competency</dt>
                    <dd>Unnecessarily elaborate romantic gestures</dd>
                  </div>
                  <div>
                    <dt>Hobbies</dt>
                    <dd>Gaming, building, questionable jokes, annoying Teju</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>Extremely committed to one particular Telugu foodie</dd>
                  </div>
                </dl>
                <div className="usp-card">
                  <span>UNIQUE SELLING PROPOSITION</span>
                  <p>
                    Can build AI systems, develop complicated software,
                    troubleshoot technical problems. He may still occasionally struggle
                    to understand why she&apos;s angry.
                  </p>
                </div>
                <p className="software-note">
                  I&apos;m not saying I&apos;m perfect. I&apos;m saying the
                  software is still receiving regular updates.
                  <span className="status-dot" aria-hidden="true" />
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          id="chapter-7"
          data-chapter="7"
          className="chapter advantage-chapter"
          aria-labelledby="chapter-7-title"
        >
          <div className="chapter-inner">
            <Reveal>
              <ChapterLabel number={7} eyebrow="The boyfriend advantage" />
              <p className="kicker">Annual performance review</p>
              <h2 id="chapter-7-title">
                What exactly do I bring <em>to the table?</em>
              </h2>
            </Reveal>

            <Reveal className="capability-grid">
              {[
                [
                  '01',
                  'Pays attention',
                  'I want to understand your personality, preferences and all the little things that make you happy.',
                  <BookHeart key="book" />,
                ],
                [
                  '02',
                  'Emotionally invested',
                  'I want to actively contribute something positive to your life, not simply exist in it.',
                  <HeartHandshake key="hands" />,
                ],
                [
                  '03',
                  'Creatively committed',
                  'I might build an entire digital universe just to make you smile. Exhibit A: this website.',
                  <Code2 key="code" />,
                ],
                [
                  '04',
                  'Biggest supporter',
                  'Your ambitions, independence, achievements and personal growth genuinely matter to me.',
                  <Star key="star" />,
                ],
                [
                  '05',
                  'Can take a joke',
                  'My legal team advises that this qualification remains subject to the severity of the joke.',
                  <Scale key="scale" />,
                ],
              ].map(([number, title, copy, icon], index) => (
                <motion.article
                  className={`capability-card capability-${index + 1}`}
                  key={String(title)}
                  whileHover={{ y: -8, rotate: index % 2 ? 1.2 : -1.2 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <div className="capability-top">
                    <span>{number}</span>
                    {icon as ReactNode}
                  </div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  {index === 2 && (
                    <span className="exhibit-stamp">EXHIBIT A: CONFIRMED</span>
                  )}
                </motion.article>
              ))}
            </Reveal>

            <Reveal className="review-footer">
              <span>Manager&apos;s note</span>
              <p>
                “Promising candidate. High effort. Annoyance levels require
                occasional monitoring.”
              </p>
              <span className="approved-stamp">APPROVED*</span>
              <small>*by the candidate himself</small>
            </Reveal>
          </div>
        </section>

        <section
          id="chapter-8"
          data-chapter="8"
          className="chapter roadmap-chapter"
          aria-labelledby="chapter-8-title"
        >
          <div className="chapter-inner">
            <Reveal>
              <ChapterLabel number={8} eyebrow="The relationship roadmap" />
              <p className="kicker">Strategy deck · subject to your approval</p>
              <h2 id="chapter-8-title">
                My five year strategic plan.
                <em> Built to last beyond the slide.</em>
              </h2>
            </Reveal>

            <div className="roadmap-layout">
              <Reveal className="roadmap-path">
                {[
                  ['Make you laugh', 'Daily'],
                  ['Understand you better', 'Continuously'],
                  ['Support your dreams', 'Always'],
                  ['Explore food places', 'Aggressively'],
                  ['Create beautiful memories', 'Frequently'],
                  ['Be your safe space', 'Every single day'],
                ].map(([goal, cadence], index) => (
                  <div className="roadmap-stop" key={goal}>
                    <span className="roadmap-pin">{index + 1}</span>
                    <div>
                      <h3>{goal}</h3>
                      <p>{cadence}</p>
                    </div>
                  </div>
                ))}
                <div className="roadmap-destination">
                  <Heart fill="currentColor" aria-hidden="true" />
                  More memories
                </div>
              </Reveal>

              <Reveal className="couple-memory" delay={0.1}>
                <figure className="couple-polaroid">
                  <div className="paperclip" aria-hidden="true" />
                  <InteractivePhoto
                    src="/media/us-together.webp"
                    alt="Teju and her boyfriend smiling together in a mirror selfie"
                    width="868"
                    height="1156"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>My favourite “us” evidence.</figcaption>
                </figure>
                <div className="memory-note">
                  <p>
                    Laugh at ridiculous things. Talk at 2 AM. Argue about
                    unnecessary things. Explore places and cuisines. Support
                    each other&apos;s ambitions.
                  </p>
                  <strong>Grow individually, without growing apart.</strong>
                </div>
              </Reveal>
            </div>

            <Reveal className="kpi-banner">
              <span>KPI</span>
              <p>
                We should both feel happier, safer and more loved because
                we&apos;re together.
              </p>
              <div aria-label="Target: one hundred percent">
                <span />
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="chapter-9"
          data-chapter="9"
          className="chapter policies-chapter"
          aria-labelledby="chapter-9-title"
        >
          <div className="gothic-moon" aria-hidden="true">
            <MoonStar />
          </div>
          <div className="chapter-inner">
            <Reveal>
              <ChapterLabel number={9} eyebrow="Non negotiable policies" />
              <p className="kicker">Immortal devotion office · lovingly binding</p>
              <h2 id="chapter-9-title">
                My promises that are <em>not up for debate.</em>
              </h2>
            </Reveal>

            <div className="policy-layout">
              <Reveal className="legal-document">
                <div className="legal-heading">
                  <FileHeart aria-hidden="true" />
                  <div>
                    <span>RELATIONSHIP AGREEMENT</span>
                    <small>Effective immediately · valid for a delightfully long time</small>
                  </div>
                </div>
                <ol className="policy-list">
                  {[
                    'Never stop finding you attractive, even in questionable outfits.',
                    'Keep trying to understand you, even when it requires a PhD in girlfriend linguistics.',
                    'Never make you feel like you have to compete for my attention.',
                    'Celebrate your achievements as enthusiastically as my own.',
                    'Make an effort when things are difficult, not only when they are easy.',
                    'Keep flirting after you are legally obligated to tolerate my nonsense.',
                    'Keep choosing you through actions, not just words.',
                  ].map((policy, index) => (
                    <li key={policy}>
                      <span>{index + 1}</span>
                      <p>{policy}</p>
                    </li>
                  ))}
                </ol>
                <div className="food-clause">
                  <Utensils aria-hidden="true" />
                  <div>
                    <strong>Additional clause</strong>
                    <p>
                      You are legally required to let me steal at least one bite
                      of your food. This clause is final.
                    </p>
                  </div>
                </div>
                <div className="signature-row">
                  <span>Boyfriend: enthusiastically signed</span>
                  <span className="wax-seal" aria-hidden="true">
                    T + B
                  </span>
                </div>
              </Reveal>

              <Reveal className="dream-court" delay={0.12}>
                <div className="dream-court-top">
                  <Gavel aria-hidden="true" />
                  <div>
                    <span>CASE № DREAM 001</span>
                    <h3>The Dream Cheating Incident</h3>
                  </div>
                </div>
                <p className="court-summary">
                  An offence allegedly committed exclusively inside one dream
                  universe.
                </p>
                <div className="verdict-grid">
                  <div>
                    <span>GUILTY</span>
                    <p>of making an appearance in the dream</p>
                  </div>
                  <div>
                    <span>NOT GUILTY</span>
                    <p>of any real world cheating whatsoever</p>
                  </div>
                </div>
                <div className="apology-slip" aria-live="polite">
                  <span>OFFICIAL APOLOGY</span>
                  <p>{apologies[apologyIndex]}</p>
                </div>
                <button
                  type="button"
                  className="court-button"
                  onClick={() =>
                    setApologyIndex((current) => (current + 1) % apologies.length)
                  }
                >
                  Submit another apology
                  <Gavel size={18} aria-hidden="true" />
                </button>
                <small>
                  Jurisdiction: Dreamland · Evidence: one dream · Real world
                  evidence: absolutely none.
                </small>
                <figure className="court-cameo">
                  <InteractivePhoto
                    compact
                    src="/media/teju-candid.webp"
                    alt="A composed side profile portrait of Teju"
                    width="960"
                    height="1280"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>Honourable judge Teju presiding</figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          id="chapter-10"
          data-chapter="10"
          className="chapter finale-chapter"
          aria-labelledby="chapter-10-title"
        >
          <div className="finale-stars" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => (
              <span key={index}>✦</span>
            ))}
          </div>
          <div className="finale-moon" aria-hidden="true" />
          <div className="chapter-inner">
            <Reveal>
              <ChapterLabel number={10} eyebrow="The final verdict" />
              <p className="kicker">Case closed · forever department</p>
              <h2 id="chapter-10-title">
                There is simply <em>no competition.</em>
              </h2>
            </Reveal>

            <div className="finale-grid">
              <Reveal className="verdict-card">
                <div className="verdict-card-heading">
                  <Scale aria-hidden="true" />
                  <span>FINDINGS OF THE HEART</span>
                </div>
                <ul>
                  {[
                    'Beautiful beyond reasonable explanation.',
                    'Intelligent, witty and wonderfully unpredictable.',
                    'Kind, caring and genuinely thoughtful.',
                    'Independent, capable and deeply admired.',
                    'Makes an effort to understand me.',
                    'Makes me want to become a better partner.',
                  ].map((finding) => (
                    <li key={finding}>
                      <Check aria-hidden="true" />
                      {finding}
                    </li>
                  ))}
                </ul>
                <p>
                  I don&apos;t claim to be perfect. I just want to keep learning
                  how to love you better. I want to be someone you can laugh with, cry
                  with, grow with, depend on, and be completely yourself around.
                </p>
              </Reveal>

              <Reveal className="video-postcard" delay={0.1}>
                <div className="video-label">
                  <span>LIVE POSTCARD</span>
                  <Heart fill="currentColor" aria-hidden="true" />
                </div>
                <video
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  poster="/media/teju-video-poster.webp"
                  aria-label="A short mirror selfie video of Teju"
                >
                  <source src="/media/teju-selfie.mp4" type="video/mp4" />
                  Your browser does not support the video element.
                </video>
                <p>A little moving proof that the subject is, in fact, lovely.</p>
              </Reveal>
            </div>

            <Reveal className="closing-copy">
              <p>
                I don&apos;t think I need a presentation to prove that
                you&apos;re amazing.
              </p>
              <strong>
                I just wanted an excuse to spend 10 chapters telling you how
                ridiculously lucky I feel to have you.
              </strong>
            </Reveal>

            <Reveal className="final-envelope-wrap">
              <div className="heart-photo-stamp">
                <InteractivePhoto
                  compact
                  src="/media/love-heart.webp"
                  alt="A purple heart shaped cushion with the word love"
                  width="868"
                  height="1156"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <button
                className={`envelope-button ${finaleOpen ? 'is-open' : ''}`}
                type="button"
                onClick={() => setFinaleOpen((open) => !open)}
                aria-expanded={finaleOpen}
                aria-controls="birthday-letter"
              >
                <span className="envelope-flap" aria-hidden="true" />
                <Heart fill="currentColor" aria-hidden="true" />
                <span>
                  {finaleOpen ? 'Birthday letter opened' : 'Open your birthday letter'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {finaleOpen && (
                  <motion.div
                    id="birthday-letter"
                    className="birthday-letter"
                    initial={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 28, scale: 0.96 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 18, scale: 0.98 }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
                    }
                    role="status"
                  >
                    <CakeSlice aria-hidden="true" />
                    <span>THE ONLY VERDICT THAT MATTERS</span>
                    <h3>Happy Birthday, Teju, my favourite human. ❤️</h3>
                    <p>
                      I hope this year gives you as much warmth, laughter and
                      goodness as you bring into my life. Keep being brilliant,
                      independent, caring and wonderfully unpredictable. Stay
                      completely yourself. I&apos;ll keep choosing you, learning
                      you and cheering for you.
                    </p>
                    <div className="five-stars" aria-label="Five star rating">
                      <Star fill="currentColor" aria-hidden="true" />
                      <Star fill="currentColor" aria-hidden="true" />
                      <Star fill="currentColor" aria-hidden="true" />
                      <Star fill="currentColor" aria-hidden="true" />
                      <Star fill="currentColor" aria-hidden="true" />
                    </div>
                    <small>
                      P.S. Please award five stars. The presenter is emotionally
                      vulnerable and has invested considerable resources.
                    </small>
                  </motion.div>
                )}
              </AnimatePresence>

              {finaleOpen && (
                <div className="confetti" aria-hidden="true">
                  {Array.from({ length: 20 }, (_, index) => (
                    <i key={index} />
                  ))}
                </div>
              )}
            </Reveal>

            <a className="back-to-top" href="#chapter-1">
              <ArrowUp aria-hidden="true" />
              Back to the beginning
            </a>
          </div>
        </section>
      </main>

      <footer>
        <span>Built with excessive affection.</span>
        <span>TEJU LOVE DOSSIER · 10/10 COMPLETE</span>
      </footer>
    </>
  )
}

export default LoveDossier
