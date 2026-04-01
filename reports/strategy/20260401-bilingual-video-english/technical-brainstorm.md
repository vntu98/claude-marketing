# Technical Brainstorm: Bilingual Video English Learning App

**Date:** 2026-04-01
**Author:** technical-brainstormer
**Inputs:** strategy-memo.md (DEV-02 through DEV-08), competitor-landscape.md, research-summary.md, eup-context.md

---

## Problem Framing

eUp needs to build a mobile-first app that lets Vietnamese English learners watch real videos with accurate EN-VI bilingual subtitles, save words with full context, and review them via spaced repetition tied to video moments. The six hardest technical decisions are:

1. **AI Subtitle Engine** — how to transcribe/translate video audio with >=95% accuracy, resilient to YouTube AutoDub
2. **EN-VI Translation Layer** — how to produce Vietnamese translations that meet the Toomva-trained quality bar
3. **Progressive Subtitle Modes** — how to render blur/delayed-reveal/click-to-reveal overlays on mobile video
4. **Video Player Architecture** — how to play YouTube content with custom subtitle overlays on iOS+Android
5. **Context-Rich Review Loop** — how to store and replay word + sentence + audio clip + video timestamp
6. **Mobile Framework** — Flutter vs alternatives given eUp's existing expertise

---

## Assumptions To Challenge

1. **"We need real-time transcription."** — Challenge: most learning use cases are batch, not live. Users pick a video, wait 5-30s for processing, then watch. Real-time transcription adds cost and complexity for marginal UX gain. **Verdict: batch-first is correct for v1.** Real-time only matters if users demand live-stream learning (unlikely for P0).

2. **"We must transcribe audio ourselves for every video."** — Challenge: ~70% of YouTube English-language videos already have accurate auto-generated or manual captions. Extracting existing captions first and falling back to AI transcription only when captions are missing/poor saves 60-80% of compute cost. **Verdict: hybrid caption-extraction-first approach is correct.**

3. **"DeepL or Google Translate will be good enough for EN-VI."** — Challenge: Vietnamese learners trained by Toomva expect near-human subtitle quality. Generic machine translation for idiomatic English dialogue will produce awkward Vietnamese. **Verdict: generic MT is a starting point, but needs post-processing or a fine-tuned model for dialogue-heavy content. Budget for human QA in the quality loop.**

4. **"Flutter can handle complex video subtitle overlays without performance issues."** — Challenge: Flutter's video_player plugin delegates to platform players (AVPlayer/ExoPlayer) but subtitle rendering as Flutter widgets overlaid on a Texture widget is well-proven. The risk is not rendering performance but **YouTube embed limitations** — YouTube's IFrame player in a WebView gives poor overlay control. **Verdict: the real constraint is the video source architecture, not Flutter's rendering.**

---

## Option Matrix

### Decision 1: AI Subtitle Engine (DEV-02 — P0)

#### Option A: YouTube Caption Extraction + Whisper API Fallback (RECOMMENDED)

| Dimension | Detail |
|-----------|--------|
| **How it works** | 1. Extract existing YouTube captions via youtube_explode_dart or YouTube Data API. 2. Detect AutoDub by comparing audio language metadata vs expected EN. 3. If captions missing/AutoDub detected/quality low, send audio to OpenAI Whisper API (or gpt-4o-mini-transcribe) for EN transcription. |
| **Accuracy** | YouTube manual captions: ~99%. YouTube auto-captions EN: ~92-95%. Whisper large-v3 fallback: ~95-97% WER on clean English. gpt-4o-mini-transcribe: lower WER than Whisper, recommended by OpenAI as of March 2025. |
| **AutoDub resilience** | Caption extraction bypasses audio entirely — immune to AutoDub. For videos where only audio is available, Whisper processes the original audio track (before AutoDub overlay). |
| **Cost at scale** | Caption extraction: ~$0 (no API cost, or minimal YouTube Data API quota). Whisper API fallback: $0.006/min. At 100K min/month fallback (assuming 30% of videos need it): ~$600/month. At 1M min/month fallback: ~$6,000/month. Via Groq: ~$0.0007/min ($70/month at 100K min). |
| **Latency** | Caption extraction: <2s. Whisper API: ~5-15s for a 10-min video. Batch is fine for this UX. |
| **Build complexity** | Medium. Caption extraction is well-understood. Whisper API integration is straightforward. |
| **Reversibility** | High. Can swap Whisper for Deepgram/AssemblyAI/Gemini without changing the architecture. |

#### Option B: Deepgram Nova-3 as Primary Transcription

| Dimension | Detail |
|-----------|--------|
| **How it works** | Send all video audio to Deepgram Nova-3 for transcription. |
| **Accuracy** | 8.1% WER English (per AssemblyAI benchmarks Feb 2026) — worse than Whisper/GPT-4o-transcribe. |
| **Cost** | $0.0043/min (Nova-2) to ~$0.005/min (Nova-3). Similar to Whisper API. |
| **AutoDub resilience** | Must process audio — vulnerable to AutoDub unless caption extraction is added as first pass. |
| **Why not** | No accuracy advantage over Whisper. Adds vendor lock-in. Still needs caption extraction for cost optimization. |

#### Option C: Full Self-Hosted Whisper (GPU Infrastructure)

| Dimension | Detail |
|-----------|--------|
| **How it works** | Run Whisper large-v3-turbo on own GPU servers (or Groq/Replicate). |
| **Accuracy** | Same as Option A fallback. |
| **Cost** | GPU hosting: $500-2000/month for a dedicated A100. Cost-effective only above ~500K min/month. Below that, API is cheaper. |
| **Why not for v1** | Premature optimization. Operational burden (GPU scaling, model updates, monitoring) delays launch. Revisit when volume exceeds 500K min/month. |

**Recommendation: Option A.** Caption extraction first, Whisper API (or gpt-4o-mini-transcribe) as fallback. Lowest cost, highest accuracy for the common case, immune to AutoDub for caption-available videos, and fully reversible. Self-host (Option C) becomes relevant at scale.

**Risk:** YouTube may change caption extraction endpoints. **Mitigation:** youtube_explode_dart has active maintenance; also implement YouTube Data API captions.list as secondary extraction path.

---

### Decision 2: EN-VI Translation Layer

#### Option A: Google Cloud Translation API + Post-Processing (RECOMMENDED)

| Dimension | Detail |
|-----------|--------|
| **How it works** | 1. Send EN subtitle segments to Google Cloud Translation (Advanced/v3) for EN-VI. 2. Apply rule-based post-processing for common dialogue patterns (contractions, slang, idioms). 3. Cache translations by subtitle hash. 4. Human QA pipeline for top-viewed videos. |
| **Quality** | Google Translate EN-VI is the strongest general-purpose option. Vietnamese is a Tier 1 supported language for Google. DeepL added Vietnamese recently but quality for Asian pairs is still maturing. |
| **Cost** | $20 per 1M characters. A 10-min video ~5000 chars EN = $0.10. At 100K videos/month: ~$10,000/month. With caching (same video watched by many users): actual cost 10-20% of that. |
| **Latency** | <1s for a full video's subtitles (batch). |
| **Lock-in** | Low. Translation APIs are interchangeable at the interface level. |

#### Option B: DeepL API for EN-VI

| Dimension | Detail |
|-----------|--------|
| **Quality** | DeepL is generally more natural-sounding for European pairs. For EN-VI specifically, Google has more training data and longer support history. DeepL Vietnamese support is newer (added 2024). |
| **Cost** | $25 per 1M characters (DeepL Pro API). 25% more expensive than Google. |
| **Why not primary** | Less proven for Vietnamese specifically. Can be added as A/B test alternative later. |

#### Option C: Fine-Tuned LLM (GPT-4o-mini or open-source)

| Dimension | Detail |
|-----------|--------|
| **How it works** | Fine-tune a model on curated EN-VI subtitle pairs from Toomva-quality sources. |
| **Quality** | Potentially highest quality for dialogue/idiom translation. |
| **Cost** | High upfront (data curation, fine-tuning, hosting). $0.15-0.60 per 1M input tokens for inference — comparable to Google at subtitle scale. |
| **Why not for v1** | Requires curated training data that doesn't exist yet. 4-8 week effort before quality can be evaluated. Fine-tune after launch using user feedback to identify systematic translation errors. |

**Recommendation: Option A.** Google Cloud Translation with post-processing rules and caching. Lowest risk, fastest to ship, adequate quality. Build the human QA feedback loop from day 1 to collect data for Option C later.

**Assumption challenged:** "Generic MT won't be good enough." — It won't be *perfect*, but with post-processing and caching of corrected translations, it's *good enough to launch*. The fine-tuned model (Option C) is the right v2 investment after collecting real error patterns from users.

---

### Decision 3: Progressive Subtitle Modes (DEV-03 — P1)

#### Option A: Native Flutter Widget Overlay (RECOMMENDED)

| Dimension | Detail |
|-----------|--------|
| **How it works** | Render subtitles as Flutter widgets (Text, AnimatedOpacity, BackdropFilter) in a Stack positioned over the video Texture. Modes: (1) Full dual — two Text widgets. (2) Blur VI — BackdropFilter or ImageFiltered over VI text. (3) Delayed reveal — AnimatedOpacity with timer. (4) Target-only — hide VI entirely. Tap gesture on blurred/hidden text reveals it. |
| **Performance** | Flutter's Skia/Impeller rendering handles text overlay + blur at 60fps. BackdropFilter on a small text region is cheap. No frame drops expected. |
| **Complexity** | Low-medium. Standard Flutter animation/widget composition. |
| **Platform parity** | Identical rendering on iOS and Android (Flutter's core strength). |

#### Option B: WebView Subtitle Layer with JS Bridge

| Dimension | Detail |
|-----------|--------|
| **How it works** | Embed YouTube IFrame player in WebView. Inject JS to manipulate subtitle DOM for blur/reveal effects. |
| **Why not** | Fragile: YouTube IFrame API does not expose subtitle DOM reliably. JS bridge latency causes sync issues. WebView compositing with native Flutter widgets is problematic on Android. Testing and debugging cross-platform JS injection is painful. |

#### Option C: Custom Canvas Rendering

| Dimension | Detail |
|-----------|--------|
| **How it works** | Draw subtitles on a CustomPainter canvas synced to video position. |
| **Why not** | Over-engineered. Flutter's widget system already provides text rendering, animation, and blur. Canvas is lower-level with no benefit here. |

**Recommendation: Option A.** Flutter widget overlay is the simplest, most performant, and most maintainable approach. It gives full control over subtitle appearance, animation, and interaction — which is exactly what progressive modes need.

---

### Decision 4: Video Player Architecture

#### Option A: youtube_explode_dart + Native Player + Flutter Overlay (RECOMMENDED)

| Dimension | Detail |
|-----------|--------|
| **How it works** | 1. Use youtube_explode_dart to resolve video stream URLs and caption tracks. 2. Play the resolved stream URL in Flutter's video_player (backed by AVPlayer on iOS, ExoPlayer on Android). 3. Render custom subtitle overlay as Flutter widgets (Decision 3). 4. Sync subtitle timing with player position via addListener. |
| **Pros** | Full control over playback and subtitle rendering. No WebView. No YouTube IFrame restrictions. Can overlay any UI. Offline-capable if streams are cached. |
| **Cons** | **ToS risk**: youtube_explode_dart reverse-engineers YouTube's internal APIs, which violates YouTube's Terms of Service. YouTube can break it at any time. This is the same approach Miraa, eJOY, and similar apps use — it works until it doesn't. |
| **Mitigation** | Abstract the video source behind an interface. If YouTube enforcement happens, fall back to Option B (official IFrame) or pivot to direct upload/URL import. Many apps in this category have operated this way for years without enforcement, but the risk is real. |

#### Option B: YouTube IFrame Player in WebView

| Dimension | Detail |
|-----------|--------|
| **How it works** | Embed official YouTube IFrame player in a Flutter WebView. Use YouTube IFrame API for playback control. |
| **Pros** | Fully ToS-compliant. YouTube handles streaming, adaptive bitrate, CDN. |
| **Cons** | Cannot overlay custom Flutter widgets on WebView reliably (especially Android). Subtitle customization is extremely limited — YouTube controls subtitle rendering. Progressive subtitle modes (blur, delayed reveal) are impossible or require fragile JS hacks. Performance and UX are worse than native. |
| **Why not primary** | Kills the core differentiator (progressive subtitle modes). |

#### Option C: Direct Video URL Import (Non-YouTube)

| Dimension | Detail |
|-----------|--------|
| **How it works** | User provides direct video URLs or uploads files. Play via video_player. |
| **Pros** | No YouTube dependency. Full control. |
| **Cons** | Kills the "BYO YouTube" promise which is central to the product thesis. Most target users watch YouTube. |
| **Role** | Should be supported as secondary input alongside YouTube. Good for copyright-safe content and future expansion. |

**Recommendation: Option A as primary, with Option C as secondary input.** The ToS risk is real but accepted industry-wide in this category (eJOY, Miraa, Trancy all do this). Abstract the video source interface so the player is source-agnostic. Build Option C (direct URL/upload) from day 1 as both a feature and a risk hedge.

**Risk:** YouTube enforcement could break the app overnight. **Mitigation:** Video source abstraction layer + direct URL import as fallback + monitor youtube_explode_dart issue tracker actively.

---

### Decision 5: Context-Rich Review Loop (DEV-04 — P1)

#### Option A: Drift (SQLite) + Local Audio Clip Extraction (RECOMMENDED)

| Dimension | Detail |
|-----------|--------|
| **How it works** | **Storage:** Drift (type-safe SQLite wrapper for Dart) stores: word, sentence, translation, video_id, timestamp_start, timestamp_end, subtitle_index, audio_clip_path, thumbnail_path, SRS metadata (FSRS parameters). **Audio clips:** Extract 5-10s audio segments on-device using ffmpeg_kit_flutter when user saves a word. Store as small .opus files locally. **Review:** During review, replay the audio clip and optionally seek the cached video to the timestamp. |
| **Why Drift over Hive** | Drift (SQLite) supports relational queries, migrations, joins, and complex SRS queries (e.g., "due cards sorted by urgency"). Hive is a key-value store — wrong primitive for relational learning data. Drift has strong Flutter community adoption and type safety. |
| **SRS Algorithm** | FSRS (Free Spaced Repetition Scheduler). 20-30% fewer reviews than SM-2 for same retention. Adopted by Anki in 2023, now mainstream. Few parameters, self-optimizing. Pure Dart implementation available. |
| **Audio clip size** | 5-10s clip at .opus 48kbps = 30-60KB per clip. 1000 saved words = 30-60MB. Manageable on mobile. |
| **Complexity** | Medium. ffmpeg_kit_flutter is well-maintained. Drift migrations are straightforward. |

#### Option B: Server-Side Audio Extraction + Cloud Storage

| Dimension | Detail |
|-----------|--------|
| **How it works** | Send video_id + timestamp to server. Server extracts clip, stores in S3/GCS, returns URL. |
| **Pros** | Lighter on-device processing. Shared cache across users (same clip saved by many users). |
| **Cons** | Adds server infrastructure, latency (2-5s for clip extraction), and cloud storage cost. Offline review breaks unless clips are pre-downloaded. |
| **Why not for v1** | Over-engineered for launch. On-device extraction is fast enough and works offline. Server-side becomes valuable at scale for cache deduplication. |

#### Option C: Timestamp-Only (No Audio Clip)

| Dimension | Detail |
|-----------|--------|
| **How it works** | Store only video_id + timestamp. During review, re-seek the video to that timestamp. |
| **Pros** | Simplest. No storage overhead. |
| **Cons** | Requires network + video re-buffering during review. Review sessions become slow and data-heavy. Defeats the purpose of a tight review loop. |

**Recommendation: Option A.** Drift + on-device audio extraction + FSRS. Best offline experience, fastest review loop, reasonable storage footprint. Migrate to server-side deduplication (Option B) when user volume justifies it.

---

### Decision 6: Mobile Framework

#### Option A: Flutter (RECOMMENDED)

| Dimension | Detail |
|-----------|--------|
| **eUp expertise** | eUp has an existing Flutter portfolio. Team knows the ecosystem, tooling, and deployment pipeline. |
| **Video + subtitle risk** | Flutter's video_player delegates to platform players (AVPlayer/ExoPlayer) — proven performant. Custom subtitle overlay via Stack/Positioned widgets is well-documented. BackdropFilter for blur effects runs at 60fps via Impeller. |
| **Ecosystem** | youtube_explode_dart, ffmpeg_kit_flutter, drift, chewie — all mature Flutter packages needed for this app. |
| **Risk** | Platform-specific video edge cases (PiP, background audio, AirPlay) may require platform channels. This is standard Flutter practice, not a blocker. |

#### Option B: React Native

| **Why not** | eUp has no React Native expertise. Video player ecosystem in RN (react-native-video) has historically had more stability issues than Flutter's. Subtitle overlay requires native module bridging. No team skill advantage. |

#### Option C: Native (Swift + Kotlin)

| **Why not** | 2x development cost, 2x maintenance. eUp's team is Flutter-specialized. Only justified if Flutter hits a hard platform limitation — none identified for this use case. |

**Recommendation: Option A.** Flutter is the obvious choice given eUp's expertise, mature video/subtitle packages, and cross-platform parity. No technical reason to deviate.

---

## Build vs Buy Matrix

| Component | Verdict | Rationale |
|-----------|---------|-----------|
| Caption extraction | **Build** (integrate youtube_explode_dart) | No SaaS product does this; library is mature |
| AI transcription fallback | **Buy** (Whisper API / gpt-4o-mini-transcribe) | API is cheap, accurate, zero ops burden |
| EN-VI translation | **Buy** (Google Cloud Translation API) | Best EN-VI quality available; fine-tune later |
| Video player | **Build** (Flutter video_player + custom overlay) | Must own the subtitle rendering layer |
| Progressive subtitle modes | **Build** | Core differentiator; no off-the-shelf solution |
| Audio clip extraction | **Build** (ffmpeg_kit_flutter) | On-device, library handles it |
| SRS / review engine | **Build** (FSRS algorithm in Dart) | Core differentiator; algorithm is open and well-documented |
| Local database | **Build** (Drift/SQLite) | Standard mobile data layer |
| Analytics / tracking | **Buy** (Firebase/GA4 SDK) | Standard; DEV-01 scope |
| Push notifications | **Buy** (Firebase Cloud Messaging) | Standard |
| Billing / subscriptions | **Buy** (RevenueCat or in-app purchase SDK) | Don't build billing infrastructure |

---

## Recommendation

### Recommended Architecture Stack

```
┌─────────────────────────────────────────────────┐
│                    Flutter App                    │
├─────────────┬───────────────┬───────────────────┤
│ Video Layer │ Subtitle Layer│ Review Layer      │
│             │               │                   │
│ video_player│ Flutter Widgets│ FSRS engine      │
│ (AVPlayer/  │ (Stack +      │ (pure Dart)      │
│  ExoPlayer) │  BackdropFilter│                  │
│             │  + animations)│ Drift/SQLite DB   │
├─────────────┴───────────────┴───────────────────┤
│              Video Source Abstraction             │
│  ┌──────────────────┐  ┌──────────────────────┐ │
│  │ youtube_explode   │  │ Direct URL / Upload  │ │
│  │ (caption + stream)│  │ (fallback + hedge)   │ │
│  └──────────────────┘  └──────────────────────┘ │
├─────────────────────────────────────────────────┤
│              Backend Services (API)               │
│  ┌────────────┐ ┌──────────┐ ┌───────────────┐ │
│  │ Whisper API│ │ Google   │ │ Firebase      │ │
│  │ (fallback  │ │ Translate│ │ (GA4, FCM,    │ │
│  │  transcribe│ │ EN→VI   │ │  Auth, etc.)  │ │
│  │  only)     │ │          │ │               │ │
│  └────────────┘ └──────────┘ └───────────────┘ │
├─────────────────────────────────────────────────┤
│  RevenueCat (billing) │ ffmpeg_kit (audio clip) │
└─────────────────────────────────────────────────┘
```

### Cost Estimate at 10K MAU (month 3-4 post-launch)

| Service | Estimated Monthly Cost |
|---------|----------------------|
| Whisper API (30% fallback, ~3K min) | $18 |
| Google Translate (with caching) | $200-500 |
| Firebase (Spark→Blaze) | $50-100 |
| RevenueCat | Free tier (up to $2.5K MTR) |
| **Total infrastructure** | **~$300-650/month** |

### Cost Estimate at 100K MAU (month 8-12)

| Service | Estimated Monthly Cost |
|---------|----------------------|
| Whisper API (30K min fallback) | $180 |
| Google Translate (with caching) | $1,000-2,000 |
| Firebase Blaze | $200-500 |
| RevenueCat | $0-500 (depending on MTR) |
| **Total infrastructure** | **~$1,400-3,200/month** |

These are comfortable margins for a $4/month subscription product with even 5% conversion.

---

## Why Not The Other Options

| Decision | Rejected Option | Why It Lost |
|----------|----------------|-------------|
| Subtitle Engine | Deepgram (Option B) | Higher WER than Whisper/GPT-4o-transcribe, no accuracy advantage, adds vendor lock-in |
| Subtitle Engine | Self-hosted Whisper (Option C) | Premature optimization; operational burden delays launch; revisit at 500K+ min/month |
| Translation | DeepL (Option B) | Newer Vietnamese support, 25% more expensive, less proven for EN-VI specifically |
| Translation | Fine-tuned LLM (Option C) | 4-8 week upfront investment before quality can be evaluated; no training data yet; right v2 move |
| Subtitle Modes | WebView JS (Option B) | Fragile, no reliable subtitle DOM access, compositing issues on Android |
| Subtitle Modes | Custom Canvas (Option C) | Over-engineered when widget system already provides everything needed |
| Video Player | YouTube IFrame (Option B) | Cannot overlay custom subtitles — kills the core differentiator |
| Video Player | Direct URL only (Option C) | Kills BYO YouTube promise; should be secondary, not primary |
| Review Storage | Server-side extraction (Option B) | Over-engineered for v1; breaks offline; adds latency and infra cost |
| Review Storage | Timestamp-only (Option C) | Slow review, network-dependent, defeats tight review loop purpose |
| Framework | React Native (Option B) | No team expertise, weaker video ecosystem |
| Framework | Native (Option C) | 2x cost/maintenance, no justification given Flutter capabilities |

---

## Planner Notes

### Decision Triggers (what could change the recommendation)

1. **YouTube enforcement against youtube_explode_dart** → If YouTube actively blocks stream resolution, pivot to IFrame player with degraded subtitle UX, or pivot product thesis toward direct upload/import model.
2. **EN-VI translation quality below user expectations at beta** → Accelerate fine-tuned LLM (Decision 2, Option C). Budget 4-8 weeks and start collecting error patterns from day 1.
3. **Whisper API cost exceeds budget at scale** → Migrate to self-hosted Whisper on Groq ($0.04/hour) or own GPU. Break-even is ~500K min/month.
4. **Flutter video_player hits platform-specific bugs** → Use media_kit (libmpv-based) as drop-in alternative. Same overlay architecture works.

### Open Questions for Planner

1. **YouTube ToS risk tolerance** — Does eUp leadership explicitly accept the youtube_explode_dart ToS risk? This is a business decision, not a technical one. Every direct competitor does this, but it should be acknowledged.
2. **Human QA budget for translations** — How many hours/week of Vietnamese translator QA time can be allocated? This directly affects EN-VI quality perception.
3. **Offline mode scope for v1** — Should v1 support offline video playback (requires stream caching, significant storage)? Or only offline review (audio clips + flashcards)?
4. **Audio clip extraction on iOS** — ffmpeg_kit_flutter works on iOS but Apple has occasionally flagged ffmpeg-based libraries in App Store review. Test early in the submission process.

### Phase Alignment with Strategy Memo Timeline

| Strategy Phase | Technical Component | Readiness |
|---------------|---------------------|-----------|
| Phase 0 (Wk 1-4) | Caption extraction + Whisper fallback + Google Translate + Drift schema + FSRS skeleton | All dependencies are available libraries/APIs |
| Phase 1 (Wk 5-10) | Video player + dual subtitle + word save + basic review | Builds on Phase 0 foundation |
| Phase 2 (Wk 8-12) | Progressive subtitle modes + delay signup + billing | Flutter widget work, RevenueCat integration |
| Phase 3 (Wk 10-14) | GA4 events + experiments | Firebase SDK, standard |

No technical blockers identified for any phase. The highest-risk item is AI subtitle accuracy validation (Phase 0, weeks 1-2) — if Whisper fallback quality is below 95% on the 100-video test set, the team needs to evaluate gpt-4o-mini-transcribe or AssemblyAI Universal-3 as alternatives before committing to Phase 1.

---

**Status:** DONE
**Summary:** Recommended architecture: Flutter app with youtube_explode_dart for caption extraction, Whisper API as transcription fallback, Google Cloud Translation for EN-VI, native Flutter widget overlay for progressive subtitle modes, Drift/SQLite + FSRS for the review loop, and ffmpeg_kit_flutter for on-device audio clip extraction. Infrastructure cost starts at ~$300-650/month at 10K MAU. Biggest risks are YouTube ToS enforcement and EN-VI translation quality — both have explicit mitigation paths.
**Next Handoff:** implementation-planner
