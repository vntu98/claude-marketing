# Facebook Post Workflow — End-to-End Example

Complete step-by-step guide to create a Facebook post for the AI Social Automation Challenge, from research to scheduling.

---

## Prerequisites

Make sure you have:
- Claude Code open in the `claude-marketing` directory
- `.agents/product-marketing-context.md` already created (run `/product-marketing-context` first)

---

## Step 1: Customer Research — Find real language

**Command:**
```
/customer-research Mine Reddit and Facebook groups for how people talk about social media automation pain points. Focus on small teams and solo marketers. Look at r/socialmedia, r/marketing, r/smallbusiness.
```

**What Claude does:**
- Searches Reddit threads for real complaints and desires
- Extracts verbatim quotes, pain points, trigger events
- Identifies Jobs to Be Done
- Outputs a research synthesis with exact customer language

**Example output you get:**
```
## Research Synthesis

### Pain Points (verbatim):
- "I spend 3 hours just scheduling posts for the week"
- "My boss wants us on 5 platforms but there's only 2 of us"
- "Every tool does one thing, nothing connects"

### Trigger Events:
- Hired a new marketing person who quit after 2 months
- Lost a client because social content was inconsistent
- Saw a competitor posting daily while they post 2x/week

### Jobs to Be Done:
- "Help me look like a big team when I'm just one person"
- "Make social media less painful so I can focus on strategy"
```

---

## Step 2: Content Strategy — Decide what to post

**Command:**
```
/content-strategy Plan Facebook content pillars for the AI Social Automation Challenge. Target audience: small teams and solo marketers. Goal: drive challenge signups and prove AI automation works.
```

**What Claude does:**
- Reads your product-marketing-context.md
- Creates 3-5 content pillars with percentage allocation
- Maps topics to buyer stages
- Prioritizes by impact score

**Example output:**
```
## Facebook Content Pillars

| Pillar | % | Topics |
|--------|---|--------|
| Proof of Concept | 35% | Before/after workflows, time saved, real results |
| Educational | 25% | How-to guides, tool tutorials, automation tips |
| Community | 20% | Participant stories, Q&A, polls, discussions |
| Behind the Scenes | 15% | Building the challenge, lessons learned |
| Promotional | 5% | Challenge announcements, deadlines, CTAs |
```

---

## Step 3: Marketing Psychology — Choose persuasion angle

**Command:**
```
/marketing-psychology What psychological principles should I use for a Facebook post promoting an AI automation challenge to small marketing teams?
```

**What Claude does:**
- Recommends specific mental models for your audience
- Explains how to apply each principle
- Gives concrete examples

**Example output:**
```
## Recommended Principles

1. **Social Proof** — "47 teams have already submitted workflows"
2. **Loss Aversion** — "Your competitors are already automating. Every week you wait..."
3. **IKEA Effect** — "Build YOUR workflow, own the process"
4. **Bandwagon + Scarcity** — "Limited spots. Join 200+ marketers who..."
5. **Curiosity Gap** — "One solo marketer created 30 posts/week. Here's how."
```

---

## Step 4: Social Content — Write the Facebook post

**Command:**
```
/social-content Write a Facebook post for the AI Social Automation Challenge. Platform: Facebook. Goal: drive signups. Use social proof + curiosity gap hooks. Tone: practical, inspiring, no hype. Include a discussion-prompting question at the end. Use the customer language from research: "I spend 3 hours just scheduling posts" and "look like a big team when I'm just one person."
```

**What Claude does:**
- Reads product-marketing-context.md for brand voice
- Applies Facebook-specific best practices (native video > links, discussion-prompting, 1-4pm posting)
- Uses hook formulas from the skill
- Writes the full post with CTA

**Example output:**
```
## Facebook Post — Curiosity Gap Hook

---

One solo marketer just created 30 posts in a single afternoon.

No agency. No team of 5. No burning out on weekends.

Just one AI-powered workflow that handles everything:
Idea → Copy → Design → Video → Schedule

Here's the thing most people get wrong about AI and social media:

They try to automate ONE step.
❌ "AI write me a caption"
❌ "AI schedule this post"

That saves you 10 minutes.

The real unlock? Automating the ENTIRE pipeline.

That's what the AI Social Automation Challenge is about:

→ Build a complete workflow
→ Prove a small team can outperform a large one
→ Share it with the community so everyone levels up

Teams that have built these workflows report:
• 80% less time on content production
• 5-10x more output per person
• Consistent quality across every platform

We're looking for the most complete, most scalable
workflow automation for social media.

Think yours could win?

🔗 [Link to challenge in comments]

Question for you: What's the ONE step in your social media
process that eats up the most time? ⬇️

---

**Posting notes:**
- Post between 1-4pm weekdays for best reach
- Put the link in the FIRST COMMENT (not in post body — kills reach)
- Reply to every comment in the first hour
- Pin the comment with the link
```

---

## Step 5: Copy Editing — QA before publishing

**Command:**
```
/copy-editing Review this Facebook post for clarity, tone, and persuasion. Apply the 7 Sweeps. Make sure it matches our brand voice: practical, inspiring, no hype.

[paste the post from Step 4]
```

**What Claude does:**
- Runs 7 Sweeps: Clarity → Voice → So What → Prove It → Specificity → Emotion → Zero Risk
- Flags weak spots
- Suggests line-by-line improvements

**Example output:**
```
## Copy Editing — 7 Sweeps

### Sweep 1: Clarity ✅
All sentences clear and scannable.

### Sweep 2: Voice & Tone ✅
Matches brand: practical, direct, inspiring without hype.

### Sweep 3: So What 🔶
Line "Share it with the community so everyone levels up"
→ Suggest: "Share it with the community — and steal ideas from others"
(Stronger self-interest appeal)

### Sweep 4: Prove It 🔶
"80% less time" — add source or example
→ Suggest: "Teams in our pilot reported 80% less time on content production"

### Sweep 5: Specificity ✅
Good use of numbers and concrete examples.

### Sweep 6: Emotion ✅
"No burning out on weekends" hits the pain point.

### Sweep 7: Zero Risk 🔶
No mention of what happens if the workflow doesn't work.
→ Suggest adding: "Even if you don't win, you walk away with a
production-ready workflow your team can use tomorrow."
```

---

## Step 6: Create ad variations (optional — for paid boost)

**Command:**
```
/ad-creative Generate 10 Facebook ad headline + primary text variations for the AI Social Automation Challenge. Target: marketing managers at small teams. Angles: social proof, curiosity, pain point. Budget: boosted post.
```

**Example output:**
```
## Facebook Ad Variations

### Pain Point Angle
1. "Still spending 20 hours/week on social media?"
   → One workflow. 80% less time. Same quality.

2. "Your team is too small for 5 social channels."
   → Unless you automate the entire pipeline.

### Curiosity Angle
3. "How one marketer creates 30 posts/week (alone)"
   → The answer isn't working harder.

4. "What if your social media ran itself?"
   → It's closer than you think.

### Social Proof Angle
5. "200+ marketers are building automated workflows."
   → The AI Social Automation Challenge is live.

...
```

---

## Step 7: Set up tracking

**Command:**
```
/analytics-tracking Set up UTM parameters and conversion tracking for our Facebook post campaign. Track: post clicks, challenge signups, workflow submissions.
```

**Example output:**
```
## UTM Parameters

Link in comment:
https://yoursite.com/challenge?utm_source=facebook&utm_medium=organic&utm_campaign=ai-social-challenge&utm_content=curiosity-hook-v1

Boosted post:
https://yoursite.com/challenge?utm_source=facebook&utm_medium=paid&utm_campaign=ai-social-challenge&utm_content=pain-point-ad-v2

## GA4 Events to Track
- challenge_page_view (pageview)
- challenge_signup_start (button click)
- challenge_signup_complete (form submit)
- workflow_submission (file upload)
```

---

## Full Command Sequence (Copy-Paste Ready)

Run these in order in Claude Code:

```bash
# Step 0: Foundation (one-time setup)
/product-marketing-context

# Step 1: Research
/customer-research Mine Reddit and Facebook groups for social media automation pain points targeting small teams

# Step 2: Strategy
/content-strategy Plan Facebook content pillars for AI Social Automation Challenge targeting small teams

# Step 3: Psychology
/marketing-psychology Best psychological principles for Facebook post promoting AI automation challenge

# Step 4: Write
/social-content Write a Facebook post for AI Social Automation Challenge using social proof and curiosity hooks

# Step 5: Edit
/copy-editing Review the Facebook post with 7 Sweeps framework

# Step 6: Ads (optional)
/ad-creative Generate 10 Facebook ad variations for the challenge

# Step 7: Track
/analytics-tracking Set up UTM and conversion tracking for Facebook campaign
```

---

## Batch Production: Create a Full Week of Facebook Posts

```
/social-content Create 7 Facebook posts for the AI Social Automation Challenge, one for each day next week. Mix content pillars: 2 proof-of-concept, 2 educational, 1 community, 1 behind-the-scenes, 1 promotional. Include posting times and engagement prompts for each.
```

This produces 7 ready-to-schedule posts with:
- Optimized hooks for Facebook algorithm
- Discussion questions to drive comments
- Posting time recommendations (1-4pm weekdays)
- Link placement instructions (always in first comment)

---

## Facebook-Specific Best Practices (from skills)

| Do | Don't |
|----|-------|
| Put links in first comment | Put links in post body (kills reach) |
| Use native video | Cross-post from other platforms |
| Ask discussion questions | Post and forget |
| Reply to every comment in first hour | Ignore engagement |
| Post 1-2x/day, 1-4pm weekdays | Post randomly |
| Create Facebook Group for community | Only use Page posts |
| Use polls and questions | Only post promotional content |
