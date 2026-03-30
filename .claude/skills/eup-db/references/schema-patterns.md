# Common Marketing Data Model Patterns

## Lead Capture System

```sql
-- Core leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  company VARCHAR(255),
  source VARCHAR(50),           -- organic, paid, referral, social
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  landing_page VARCHAR(500),
  referrer VARCHAR(500),
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'new',  -- new, contacted, qualified, converted
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead activity tracking
CREATE TABLE lead_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,  -- page_view, form_submit, email_open, email_click
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_events_lead_id ON lead_events(lead_id);
CREATE INDEX idx_lead_events_type ON lead_events(event_type);
```

## Content Management

```sql
-- Content posts (social, blog, etc.)
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  excerpt TEXT,
  slug VARCHAR(500) UNIQUE,
  status VARCHAR(20) DEFAULT 'draft',  -- draft, scheduled, published, archived
  platform VARCHAR(30),                -- linkedin, twitter, instagram, blog
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',         -- platform-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content tags/categories
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Content calendar
CREATE TABLE content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  platform VARCHAR(30) NOT NULL,
  scheduled_date DATE NOT NULL,
  time_slot VARCHAR(10),              -- morning, afternoon, evening
  status VARCHAR(20) DEFAULT 'planned',
  notes TEXT
);

CREATE INDEX idx_calendar_date ON content_calendar(scheduled_date);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_platform ON posts(platform);
```

## Email Marketing

```sql
-- Subscribers
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',  -- active, unsubscribed, bounced, complained
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Email sequences
CREATE TABLE sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50),     -- signup, tag_added, event, manual
  trigger_config JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence emails (steps)
CREATE TABLE sequence_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID REFERENCES sequences(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  delay_hours INTEGER DEFAULT 0,    -- hours after previous step
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Send tracking
CREATE TABLE email_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES subscribers(id),
  sequence_email_id UUID REFERENCES sequence_emails(id),
  status VARCHAR(20) DEFAULT 'queued',  -- queued, sent, delivered, opened, clicked, bounced
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

CREATE INDEX idx_sends_subscriber ON email_sends(subscriber_id);
CREATE INDEX idx_sends_status ON email_sends(status);
```

## Analytics Events

```sql
-- Custom analytics events
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(100),
  user_id UUID,
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),
  event_data JSONB DEFAULT '{}',
  page_url VARCHAR(500),
  referrer VARCHAR(500),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  device_type VARCHAR(20),
  browser VARCHAR(50),
  country VARCHAR(2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for performance
CREATE INDEX idx_events_name ON analytics_events(event_name);
CREATE INDEX idx_events_created ON analytics_events(created_at);
CREATE INDEX idx_events_session ON analytics_events(session_id);
```

## A/B Testing

```sql
-- Experiments
CREATE TABLE experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft',  -- draft, running, paused, completed
  metric_name VARCHAR(100),             -- conversion_rate, click_rate, etc.
  traffic_percentage INTEGER DEFAULT 100,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variants
CREATE TABLE variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,           -- control, variant_a, variant_b
  weight INTEGER DEFAULT 50,            -- traffic weight percentage
  config JSONB NOT NULL                 -- variant-specific configuration
);

-- Assignments (which user sees which variant)
CREATE TABLE experiment_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES experiments(id),
  variant_id UUID REFERENCES variants(id),
  visitor_id VARCHAR(100) NOT NULL,
  converted BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_assignment_unique ON experiment_assignments(experiment_id, visitor_id);
CREATE INDEX idx_assignment_variant ON experiment_assignments(variant_id);
```
