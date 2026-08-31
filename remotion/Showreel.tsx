import type { CSSProperties, ReactNode } from 'react'
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

import { fontDisplay, fontSans, fontSerif } from './fonts'
import { SCENES, colors } from './theme'

const FADE = 12

const offers = [
  { num: '01', title: 'Design & Technik', line: 'Individuell statt Baukasten' },
  { num: '02', title: 'Texte & Hosting', line: 'Inhalt und Betrieb inklusive' },
  { num: '03', title: 'Foto & Video', line: 'Echte Aufnahmen, kein Stock' },
  { num: '04', title: 'SEO & Reichweite', line: 'Sichtbar in der Region' },
] as const

const usps = [
  { num: '01', title: 'Alles aus einer Hand', line: 'Ein Ansprechpartner. Ein Prozess. Ein Ergebnis.' },
  { num: '02', title: 'Kein Baukasten', line: 'Jede Webseite wird für deinen Betrieb gebaut.' },
  { num: '03', title: 'Lokal verankert', line: 'Aus Bünde für KMU und Handwerk in OWL.' },
  { num: '04', title: 'Langfristig gedacht', line: 'Sauber, pflegeleicht, auch nach dem Launch.' },
] as const

const leads = [
  { title: 'Anfragen', line: 'Nicht Awards. Aufträge.' },
  { title: 'Sichtbarkeit', line: 'Gefunden werden in OWL.' },
  { title: 'Vertrauen', line: 'Echte Menschen, echte Bilder.' },
] as const

function scene(id: string) {
  return SCENES[id]
}

function clampFade(frame: number, duration: number) {
  return interpolate(frame, [0, FADE, duration, FADE, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  })
}

function enter(frame: number, delay: number, distance = 28, duration = 24) {
  const t = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  return {
    opacity: t,
    transform: `translateY(${(1, t) * distance}px)`,
  }
}

function SceneFade({ duration, children }: { duration: number; children: ReactNode }) {
  const frame = useCurrentFrame()
  return <AbsoluteFill style={{ opacity: clampFade(frame, duration) }}>{children}</AbsoluteFill>
}

function Kicker({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: fontSans,
        fontSize: 20,
        fontWeight: 500,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: colors.muted...style,
      }}
    >
      {children}
    </div>
  )
}

function Em({ children, size }: { children: ReactNode; size: number }) {
  return (
    <span
      style={{
        fontFamily: fontSerif,
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.1,
        backgroundImage: colors.gradient,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {children}
    </span>
  )
}

function LogoLockup({ scale }: { scale: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transform: `scale(${scale})`,
      }}
    >
      <span style={{ fontFamily: fontDisplay, fontSize: 92, letterSpacing: '0.08em', color: colors.cream, lineHeight: 1 }}>
        ROCKET
      </span>
      <Img
        src={staticFile('assets/images/rocketory-o-icon.webp')}
        style={{ width: 86, height: 58, objectFit: 'contain', margin: '0 4px 4px' }}
      />
      <span style={{ fontFamily: fontDisplay, fontSize: 92, letterSpacing: '0.08em', color: colors.cream, lineHeight: 1 }}>
        RY
      </span>
    </div>
  )
}

function Title({
  line,
  em,
  after,
  size = 92,
  emSize,
}: {
  line?: string
  em?: string
  after?: string
  size?: number
  emSize?: number
}) {
  return (
    <div
      style={{
        fontFamily: fontSans,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '-0.04em',
        color: colors.cream,
        lineHeight: 1.05,
      }}
    >
      {line}
      {after && em ? (
        <>
          <Em size={emSize ?? size * 0.9}>{em}</Em>
          <br />
          {after}
        </>
      ) : em ? (
        <>
          {line ? <br /> : null}
          <Em size={emSize ?? size * 0.9}>{em}</Em>
        </>
      ) : null}
    </div>
  )
}

function KenBurns({ src, duration }: { src: string; duration: number }) {
  const frame = useCurrentFrame()
  const zoom = interpolate(frame, [0, duration], [1.08, 1.02], { extrapolateRight: 'clamp' })

  return (
    <Img
      src={staticFile(src)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }}
    />
  )
}

function Overlay({ strong = false }: { strong?: boolean }) {
  return (
    <AbsoluteFill
      style={{
        background: strong
          ? 'linear-gradient(180deg, rgba(10,15,30,0.78) 0%, rgba(10,15,30,0.92) 100%)'
          : 'linear-gradient(180deg, rgba(10,15,30,0.45) 0%, rgba(10,15,30,0.78) 50%, rgba(10,15,30,0.94) 100%)',
      }}
    />
  )
}

function QuestionScene({
  duration,
  kicker,
  question,
  image,
}: {
  duration: number
  kicker: string
  question: string
  image?: string
}) {
  const frame = useCurrentFrame()

  return (
    <SceneFade duration={duration}>
      {image ? <KenBurns src={image} duration={duration} /> : null}
      <Overlay strong={!image} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 140px' }}>
        <div style={{ textAlign: 'center', maxWidth: 1500 }}>
          <div style={enter(frame, 8)}>
            <Kicker>{kicker}</Kicker>
          </div>
          <div
            style={{
              ...enter(frame, 18, 28, 26),
              marginTop: 28,
              fontFamily: fontSerif,
              fontStyle: 'italic',
              fontSize: 72,
              lineHeight: 1.12,
              color: colors.cream,
            }}
          >
            {question}
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function ExplainScene({
  duration,
  kicker,
  headline,
  em,
  body,
  image,
}: {
  duration: number
  kicker: string
  headline: string
  em?: string
  body: string
  image?: string
}) {
  const frame = useCurrentFrame()

  return (
    <SceneFade duration={duration}>
      {image ? <KenBurns src={image} duration={duration} /> : null}
      <Overlay strong={!image} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 160px' }}>
        <div style={{ textAlign: 'center', maxWidth: 980 }}>
          <div style={enter(frame, 10)}>
            <Kicker>{kicker}</Kicker>
          </div>
          <div style={{ ...enter(frame, 22), marginTop: 28 }}>
            {em ? <Title line={headline} em={em} size={64} emSize={58} /> : <Title line={headline} size={64} />}
          </div>
          <p
            style={{
              ...enter(frame, 38, 22, 28),
              marginTop: 32,
              fontFamily: fontSans,
              fontSize: 26,
              lineHeight: 1.55,
              color: colors.muted,
            }}
          >
            {body}
          </p>
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function ExampleScene({
  duration,
  kicker,
  title,
  em,
  result,
  image,
}: {
  duration: number
  kicker: string
  title: string
  em: string
  result: string
  image: string
}) {
  const frame = useCurrentFrame()

  return (
    <SceneFade duration={duration}>
      <KenBurns src={image} duration={duration} />
      <Overlay />
      <AbsoluteFill style={{ justifyContent: 'flex-end', padding: '0 120px 108px' }}>
        <div style={enter(frame, 10)}>
          <Kicker>{kicker}</Kicker>
        </div>
        <div style={{ ...enter(frame, 20), marginTop: 18 }}>
          <Title line={title} em={em} size={68} emSize={64} />
        </div>
        <div
          style={{
            ...enter(frame, 36),
            marginTop: 22,
            fontFamily: fontSans,
            fontSize: 26,
            color: colors.muted,
            maxWidth: 820,
            lineHeight: 1.45,
          }}
        >
          {result}
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function LogoIntro() {
  const frame = useCurrentFrame()
  const duration = scene('logo').duration
  const scale = interpolate(frame, [0, 28], [0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  return (
    <SceneFade duration={duration}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <div style={enter(frame, 6, 22, 26)}>
            <LogoLockup scale={scale} />
          </div>
          <div style={enter(frame, 22)}>
            <Kicker>Webdesign · SEO · Betreuung</Kicker>
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function Leads() {
  const frame = useCurrentFrame()
  const duration = scene('leads').duration

  return (
    <SceneFade duration={duration}>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 140px' }}>
        <div style={enter(frame, 6)}>
          <Kicker>Im Kern</Kicker>
        </div>
        <div style={{ ...enter(frame, 16), marginTop: 16, marginBottom: 48 }}>
          <Title line="Keine Awards." em="Anfragen." size={68} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {leads.map((item, index) => (
            <div
              key={item.title}
              style={{
                ...enter(frame, 22 + Math.round(((duration, 90) / 2) * index), 22, 20),
                padding: '30px 32px',
                border: '1px solid rgba(245,244,240,0.12)',
                background: 'rgba(245,244,240,0.04)',
              }}
            >
              <div style={{ fontFamily: fontSans, fontWeight: 700, fontSize: 32, color: colors.cream, letterSpacing: '-0.03em' }}>
                {item.title}
              </div>
              <div style={{ marginTop: 10, fontFamily: fontSans, fontSize: 21, color: colors.muted, lineHeight: 1.4 }}>{item.line}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function Problem() {
  const frame = useCurrentFrame()
  const duration = scene('problem').duration

  return (
    <SceneFade duration={duration}>
      <KenBurns src="assets/images/nasa-earth-space.webp" duration={duration} />
      <Overlay strong />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 140px' }}>
        <div style={{ textAlign: 'center', maxWidth: 1400 }}>
          <div style={enter(frame, 8)}>
            <Kicker>Das Muster</Kicker>
          </div>
          <div style={{ ...enter(frame, 18), marginTop: 26 }}>
            <Title line="Baukasten. Chaos." em="Keine Wiedererkennung." size={76} />
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function Promise() {
  const frame = useCurrentFrame()
  const duration = scene('promise').duration

  return (
    <SceneFade duration={duration}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
        <div style={{ textAlign: 'center', maxWidth: 1600 }}>
          <div style={enter(frame, 6)}>
            <Kicker>Der Anspruch</Kicker>
          </div>
          <div style={{ ...enter(frame, 16), marginTop: 26 }}>
            <Title line="Mehr Performance" em="für das gleiche Budget." size={96} emSize={82} />
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function Offer() {
  const frame = useCurrentFrame()
  const duration = scene('offer').duration

  return (
    <SceneFade duration={duration}>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 140px' }}>
        <div style={enter(frame, 6)}>
          <Kicker>Das Angebot</Kicker>
        </div>
        <div style={{ ...enter(frame, 14), marginTop: 14, marginBottom: 44 }}>
          <Title line="Alles, was eine" em="Webseite braucht." size={64} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, maxWidth: 1480 }}>
          {offers.map((item, index) => (
            <div
              key={item.num}
              style={{
                ...enter(frame, 18 + Math.round(((duration, 80) / 3) * index), 22, 20),
                padding: '28px 32px',
                border: '1px solid rgba(245,244,240,0.12)',
                background: 'rgba(245,244,240,0.04)',
              }}
            >
              <div style={{ fontFamily: fontSans, fontSize: 15, letterSpacing: '0.16em', color: colors.orange, marginBottom: 12 }}>
                {item.num}
              </div>
              <div style={{ fontFamily: fontSans, fontWeight: 700, fontSize: 30, color: colors.cream, letterSpacing: '-0.03em' }}>
                {item.title}
              </div>
              <div style={{ marginTop: 8, fontFamily: fontSans, fontSize: 20, color: colors.muted, lineHeight: 1.35 }}>{item.line}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function Why() {
  const frame = useCurrentFrame()
  const duration = scene('why').duration

  return (
    <SceneFade duration={duration}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 140px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={enter(frame, 6)}>
            <Kicker>Der Unterschied</Kicker>
          </div>
          <div style={{ ...enter(frame, 16), marginTop: 26 }}>
            <Title line="Ein Ansprechpartner." em="Ein Prozess." size={96} />
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function Usps() {
  const frame = useCurrentFrame()
  const duration = scene('usps').duration

  return (
    <SceneFade duration={duration}>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 180px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1320 }}>
          {usps.map((item, index) => (
            <div
              key={item.num}
              style={{
                ...enter(frame, 8 + Math.round(((duration, 90) / 3) * index), 20, 18),
                display: 'grid',
                gridTemplateColumns: '88px 1fr',
                gap: 28,
                alignItems: 'baseline',
                paddingBottom: 20,
                borderBottom: index === usps.length, 1 ? 'none' : '1px solid rgba(245,244,240,0.1)',
              }}
            >
              <div style={{ fontFamily: fontSans, fontSize: 20, letterSpacing: '0.14em', color: colors.orange }}>{item.num}</div>
              <div>
                <div style={{ fontFamily: fontSans, fontWeight: 700, fontSize: 36, color: colors.cream, letterSpacing: '-0.03em' }}>
                  {item.title}
                </div>
                <div style={{ marginTop: 6, fontFamily: fontSans, fontSize: 21, color: colors.muted, lineHeight: 1.4 }}>{item.line}</div>
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function Team() {
  const frame = useCurrentFrame()
  const duration = scene('team').duration

  return (
    <SceneFade duration={duration}>
      <KenBurns src="assets/images/buende/buende-webdesign-meeting.webp" duration={duration} />
      <Overlay />
      <AbsoluteFill style={{ justifyContent: 'flex-end', padding: '0 120px 108px' }}>
        <div style={enter(frame, 4, 16, 14)}>
          <Kicker>Aus Bünde für OWL</Kicker>
        </div>
        <div style={{ ...enter(frame, 10, 16, 16), marginTop: 18 }}>
          <Title line="Die " em="Menschen" after="hinter dem Projekt." size={72} />
        </div>
        <div
          style={{
            ...enter(frame, 18, 14, 16),
            marginTop: 20,
            fontFamily: fontSans,
            fontSize: 25,
            color: colors.muted,
            maxWidth: 760,
            lineHeight: 1.45,
          }}
        >
          Persönlich. Kein Ticket-System. Du sprichst mit denen, die bauen.
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function Close() {
  const frame = useCurrentFrame()
  const duration = scene('cta').duration
  const scale = interpolate(frame, [0, 28], [0.94, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  return (
    <SceneFade duration={duration}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, textAlign: 'center' }}>
          <div style={enter(frame, 6, 20, 22)}>
            <LogoLockup scale={scale} />
          </div>
          <div
            style={{
              ...enter(frame, 18),
              fontFamily: fontSerif,
              fontStyle: 'italic',
              fontSize: 54,
              color: colors.cream,
            }}
          >
            Lass uns reden.
          </div>
          <div
            style={{
              ...enter(frame, 28),
              fontFamily: fontSans,
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: colors.orange,
            }}
          >
            rocketory.de
          </div>
          <div style={{ ...enter(frame, 38), fontFamily: fontSans, fontSize: 21, color: colors.muted }}>
            Kostenloses Erstgespräch · Antwort in 24 Stunden
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  )
}

function Atmosphere() {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const drift = interpolate(frame, [0, durationInFrames], [0, 140])

  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          width: 980,
          height: 980,
          borderRadius: '50%',
          left: -180 + drift * 0.3,
          top: -420,
          background: 'radial-gradient(circle, rgba(255,92,0,0.16) 0%, transparent 64%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 860,
          height: 860,
          borderRadius: '50%',
          right: -240,
          bottom: -380 + drift * 0.18,
          background: 'radial-gradient(circle, rgba(193,39,45,0.14) 0%, transparent 66%)',
        }}
      />
    </AbsoluteFill>
  )
}

function Progress() {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const width = interpolate(frame, [0, durationInFrames], [0, 100], { extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 4,
        background: 'rgba(245,244,240,0.08)',
      }}
    >
      <div style={{ width: `${width}%`, height: '100%', backgroundImage: colors.gradient }} />
    </div>
  )
}

export const RocketoryShowreel = () => {
  const frame = useCurrentFrame()
  const grain = interpolate(frame % 6, [0, 5], [0.018, 0.03])

  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink, fontFamily: fontSans }}>
      <Audio src={staticFile('assets/audio/rocketory-showreel-vo.mp3')} />
      <Atmosphere />

      <Sequence from={scene('qWhySame').from} durationInFrames={scene('qWhySame').duration} premountFor={10}>
        <QuestionScene
          duration={scene('qWhySame').duration}
          kicker="Eine ehrliche Frage"
          question="Warum wirkt deine Webseite austauschbar?"
          image="assets/images/nasa-earth-space.webp"
        />
      </Sequence>

      <Sequence from={scene('explain1').from} durationInFrames={scene('explain1').duration} premountFor={10}>
        <ExplainScene
          duration={scene('explain1').duration}
          kicker="Was wir oft sehen"
          headline="Gleiches Layout."
          em="Anderes Logo."
          body="Besucher merken es in Sekunden: Hier steckt keine eigene Geschichte dahinter, nur eine Hülle, die schon hundertmal existiert."
        />
      </Sequence>

      <Sequence from={scene('logo').from} durationInFrames={scene('logo').duration} premountFor={10}>
        <LogoIntro />
      </Sequence>

      <Sequence from={scene('qWhatFor').from} durationInFrames={scene('qWhatFor').duration} premountFor={10}>
        <QuestionScene duration={scene('qWhatFor').duration} kicker="Überleitung" question="Was soll deine Webseite eigentlich leisten?" />
      </Sequence>

      <Sequence from={scene('explain2').from} durationInFrames={scene('explain2').duration} premountFor={10}>
        <ExplainScene
          duration={scene('explain2').duration}
          kicker="Unser Maßstab"
          headline="Anfragen."
          em="Nicht Dekoration."
          body="Nicht Eindruck um des Eindrucks willen. Sondern Klarheit: Wer bist du und warum soll ich dich kontaktieren?"
          image="assets/images/team-raketenstart.webp"
        />
      </Sequence>

      <Sequence from={scene('leads').from} durationInFrames={scene('leads').duration} premountFor={10}>
        <Leads />
      </Sequence>

      <Sequence from={scene('qWhyFail').from} durationInFrames={scene('qWhyFail').duration} premountFor={10}>
        <QuestionScene duration={scene('qWhyFail').duration} kicker="Die nächste Frage" question="Warum bleibt die Wirkung so oft aus?" />
      </Sequence>

      <Sequence from={scene('problem').from} durationInFrames={scene('problem').duration} premountFor={10}>
        <Problem />
      </Sequence>

      <Sequence from={scene('explain3').from} durationInFrames={scene('explain3').duration} premountFor={10}>
        <ExplainScene
          duration={scene('explain3').duration}
          kicker="Der Kern"
          headline="Viel Inhalt."
          em="Wenig Haltung."
          body="Technik läuft, Texte sind da, aber niemand erklärt, warum ausgerechnet du die richtige Wahl bist. Dann fehlt der Moment, in dem Vertrauen entsteht."
        />
      </Sequence>

      <Sequence from={scene('promise').from} durationInFrames={scene('promise').duration} premountFor={10}>
        <Promise />
      </Sequence>

      <Sequence from={scene('explain4').from} durationInFrames={scene('explain4').duration} premountFor={10}>
        <ExplainScene
          duration={scene('explain4').duration}
          kicker="So sparen wir nicht"
          headline="Ein Prozess."
          em="Ein Ergebnis."
          body="Mehr Performance für das gleiche Budget heißt bei uns: Design, Texte, Technik und Betrieb aus einer Hand, statt Reibung zwischen fünf Ansprechpartnern."
        />
      </Sequence>

      <Sequence from={scene('qWhatWeDo').from} durationInFrames={scene('qWhatWeDo').duration} premountFor={10}>
        <QuestionScene duration={scene('qWhatWeDo').duration} kicker="Konkret" question="Was machen wir konkret?" />
      </Sequence>

      <Sequence from={scene('offer').from} durationInFrames={scene('offer').duration} premountFor={10}>
        <Offer />
      </Sequence>

      <Sequence from={scene('explain5').from} durationInFrames={scene('explain5').duration} premountFor={10}>
        <ExplainScene
          duration={scene('explain5').duration}
          kicker="Warum aus einer Hand"
          headline="Sichtbar,"
          em="wenn es zählt."
          body="Design, Text und SEO gehören zusammen. Deshalb planen wir alles in einem Strang, damit man dich in der Region findet."
        />
      </Sequence>

      <Sequence from={scene('qWhyUs').from} durationInFrames={scene('qWhyUs').duration} premountFor={10}>
        <QuestionScene
          duration={scene('qWhyUs').duration}
          kicker="Der Vergleich"
          question="Warum Rocketory, nicht die nächste Agentur?"
        />
      </Sequence>

      <Sequence from={scene('why').from} durationInFrames={scene('why').duration} premountFor={10}>
        <Why />
      </Sequence>

      <Sequence from={scene('usps').from} durationInFrames={scene('usps').duration} premountFor={10}>
        <Usps />
      </Sequence>

      <Sequence from={scene('explain6').from} durationInFrames={scene('explain6').duration} premountFor={10}>
        <ExplainScene
          duration={scene('explain6').duration}
          kicker="Wie wir arbeiten"
          headline="Nah."
          em="Langfristig. Persönlich."
          body="Aus Bünde für KMU und Handwerk, mit dem Anspruch, dass deine Webseite nach dem Launch weiter mitdenkt, statt nur live geschaltet zu werden."
          image="assets/images/buende/buende-webdesign-meeting.webp"
        />
      </Sequence>

      <Sequence from={scene('qProof').from} durationInFrames={scene('qProof').duration} premountFor={10}>
        <QuestionScene duration={scene('qProof').duration} kicker="Beweis" question="Klingt das gut? Hier sind drei Beispiele." />
      </Sequence>

      <Sequence from={scene('exHandwerk').from} durationInFrames={scene('exHandwerk').duration} premountFor={10}>
        <ExampleScene
          duration={scene('exHandwerk').duration}
          kicker="Beispiel 01 · Handwerk Bünde"
          title="Relaunch statt"
          em="Schönfärberei."
          result="Klarere Startseite, lokale Suchintention, Anfragen mit konkretem Projektbezug."
          image="assets/images/buende/buende-rathaus.webp"
        />
      </Sequence>

      <Sequence from={scene('explain7').from} durationInFrames={scene('explain7').duration} premountFor={10}>
        <ExplainScene
          duration={scene('explain7').duration}
          kicker="Aus der Praxis"
          headline="Klarheit auf der"
          em="Startseite."
          body="Weniger Historie, mehr Antwort auf die eine Frage des Besuchers: Was macht ihr und warum genau ihr?"
        />
      </Sequence>

      <Sequence from={scene('exPhoto').from} durationInFrames={scene('exPhoto').duration} premountFor={10}>
        <ExampleScene
          duration={scene('exPhoto').duration}
          kicker="Beispiel 02 · Foto & Film"
          title="Echte Aufnahmen."
          em="Kein Stock."
          result="Vor Ort fotografiert und gefilmt, damit Vertrauen entsteht, bevor jemand schreibt."
          image="assets/images/foto-video.jpg"
        />
      </Sequence>

      <Sequence from={scene('explain8').from} durationInFrames={scene('explain8').duration} premountFor={10}>
        <ExplainScene
          duration={scene('explain8').duration}
          kicker="Vertrauen vor dem Klick"
          headline="Echt statt"
          em="austauschbar."
          body="Menschen erkennen Menschen. Deshalb setzen wir auf Aufnahmen aus dem Betrieb, nicht auf die nächste Bilddatenbank."
        />
      </Sequence>

      <Sequence from={scene('exCustom').from} durationInFrames={scene('exCustom').duration} premountFor={10}>
        <ExampleScene
          duration={scene('exCustom').duration}
          kicker="Beispiel 03 · Technik"
          title="Kein Template."
          em="Eine Webseite für dich."
          result="HTML, WordPress oder Next.js & Payload, je nachdem, was wirtschaftlich zu deinem Betrieb passt."
          image="assets/images/angebote-tech-stack.webp"
        />
      </Sequence>

      <Sequence from={scene('explain9').from} durationInFrames={scene('explain9').duration} premountFor={10}>
        <ExplainScene
          duration={scene('explain9').duration}
          kicker="Technik mit Haltung"
          headline="Maßgeschneidert"
          em="statt Masse."
          body="Wir empfehlen ehrlich, was zu deinem Vorhaben passt, nicht, was gerade am meisten Marge bringt."
        />
      </Sequence>

      <Sequence from={scene('team').from} durationInFrames={scene('team').duration} premountFor={10}>
        <Team />
      </Sequence>

      <Sequence from={scene('qNext').from} durationInFrames={scene('qNext').duration} premountFor={10}>
        <QuestionScene duration={scene('qNext').duration} kicker="Nächster Schritt" question="Wenn du soweit bist?" />
      </Sequence>

      <Sequence from={scene('cta').from} durationInFrames={scene('cta').duration} premountFor={10}>
        <Close />
      </Sequence>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          opacity: grain,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)',
          mixBlendMode: 'overlay',
        }}
      />
      <Progress />
    </AbsoluteFill>
  )
}
