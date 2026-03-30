# Evaluation Matrix Template

## Standard Criteria Set

| Criteria | Weight | Description |
|----------|--------|-------------|
| Simplicity | 25% | How easy to understand, implement, and maintain? |
| Time to ship | 25% | How fast can we deliver a working v1? |
| Scalability | 20% | Can it handle 10x growth without rewrite? |
| Maintainability | 15% | Will a new dev understand this in 6 months? |
| Cost | 15% | Total cost of ownership (hosting, licenses, dev time) |

## Scoring Guide

| Score | Meaning |
|-------|---------|
| 5 | Excellent — clearly best option for this criteria |
| 4 | Good — strong fit with minor gaps |
| 3 | Adequate — meets requirements but not standout |
| 2 | Weak — notable gaps or concerns |
| 1 | Poor — significant problems for this criteria |

## Calculation

```
Weighted Score = (Score × Weight) for each criteria, summed

Example:
Option A: (4×0.25) + (5×0.25) + (2×0.20) + (4×0.15) + (5×0.15)
        = 1.00 + 1.25 + 0.40 + 0.60 + 0.75
        = 4.00
```

## Alternative Criteria Sets

### For Build vs. Buy Decisions

| Criteria | Weight |
|----------|--------|
| Cost at current scale | 20% |
| Cost at 10x scale | 15% |
| Customization flexibility | 20% |
| Time to implement | 20% |
| Data ownership/portability | 15% |
| Vendor lock-in risk | 10% |

### For Framework Selection

| Criteria | Weight |
|----------|--------|
| Team familiarity | 30% |
| Ecosystem maturity | 20% |
| Performance | 15% |
| Documentation quality | 15% |
| Community size | 10% |
| Long-term viability | 10% |

### For Database Selection

| Criteria | Weight |
|----------|--------|
| Query complexity needs | 25% |
| Schema flexibility | 20% |
| Read/write patterns | 20% |
| Hosting options/cost | 15% |
| Ecosystem (ORMs, tools) | 10% |
| Backup/recovery | 10% |

## Quick Decision Shortcuts

Sometimes you don't need a full matrix:

- **"We need it yesterday"** → Pick the one the team knows best
- **"Budget is $0"** → Pick the one with the best free tier
- **"This is an experiment"** → Pick the simplest option
- **"This must scale to millions"** → Pick the one with proven scale stories
- **"We might pivot"** → Pick the most flexible/reversible option
