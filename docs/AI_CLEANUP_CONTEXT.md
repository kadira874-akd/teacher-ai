# Teacher AI Cleanup Context

## Current Project

Next.js 16.2.11
TypeScript
Supabase


## Feature Structure

features/
 └── ai/

Current files:

ai.discovery.repository.ts
ai.discovery.service.ts
ai.engine.ts
ai.evaluator.ts
ai.feedback.repository.ts
ai.feedback.service.ts
ai.insight.repository.ts
ai.learning.repository.ts
ai.learning.service.ts
ai.pattern.analytics.repository.ts
ai.pattern.analytics.service.ts
ai.pattern.candidate.repository.ts
ai.pattern.repository.ts
ai.pattern.service.ts
ai.recommendation.repository.ts
ai.recommendation.service.ts
ai.student.performance.repository.ts
ai.service.ts
ai.types.ts


## Database AI Tables

ai_student_insights

ai_feedback

ai_learning_memory

ai_patterns

ai_pattern_candidates


## Current Working Flow

Student
 |
 v
AI Engine
 |
 v
AI Insight
 |
 v
Teacher Feedback
 |
 v
Learning Memory
 |
 v
Pattern Discovery
 |
 v
AI Pattern
 |
 v
Adaptive Recommendation


## Cleanup Already Done

Renamed:

ai.memory.repository.ts

to:

(deleted after audit because unused)


Renamed:

ai.repository.ts

to:

ai.student.performance.repository.ts


## Known Orphan Candidates

Need audit:

ai.student.performance.repository.ts

ai.evaluator.ts


## Important Rule

Do not change AI logic.

Only:

- remove duplicate files
- fix naming
- simplify architecture
- preserve working flow


## Current Verified Features

AI Insight:
WORKING

Feedback:
WORKING

Learning Memory:
WORKING

Pattern Discovery:
WORKING

Recommendation:
WORKING