/**
 * Blog Seed Script
 * Run: node --env-file=.env seeders/blogSeeder.js
 * (or): node -r dotenv/config seeders/blogSeeder.js
 *
 * This inserts 10 SEO-friendly published education blogs.
 * It automatically picks the first superadmin (or admin) as the author.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Blog from "../models/Blog.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

dotenv.config();

const connect = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
};

// Local absolute paths created by the AI image generator tool.
// These will be uploaded to Cloudinary during seeding, then stored as `featuredImage` URLs.
const coverUrlsBySlug = {
    "neet-biology-in-45-days-ncert-chapter-plan-daily-revision":
        "https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=1600",
    "cbse-class-9-science-study-plan-chapter-wise-schedule-90-marks":
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=1600",
    "cbse-class-10-maths-30-day-revision-plan-high-scores":
        "https://images.unsplash.com/photo-1509228468518-180dd486d15a?auto=format&fit=crop&q=80&w=1600",
    "smart-study-timetable-for-students-classes-4-to-10":
        "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1600",
    "how-to-crack-neet-2025-complete-study-plan":
        "https://images.unsplash.com/photo-1532187863486-abf9d343469a?auto=format&fit=crop&q=80&w=1600",
    "top-10-scientifically-proven-study-techniques":
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1600",
    "jee-main-2025-preparation-tips-best-books":
        "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=1600",
    "benefits-of-online-learning-digital-education-future":
        "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1600",
    "time-management-for-students-study-smarter":
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1600",
    "class-10-board-exam-preparation-study-schedule":
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1600",
};

const coverUrlCache = new Map();

const uploadCoverToCloudinary = async (slug) => {
    // If Cloudinary credentials are missing, or it's already a URL, skip uploading gracefully.
    const url = coverUrlsBySlug[slug];
    if (!url) return "";

    if (url.startsWith("http")) return url;

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return url;
    }

    if (coverUrlCache.has(slug)) return coverUrlCache.get(slug);

    // If it's a local path (old logic), try to upload
    if (fs.existsSync(url)) {
        try {
            const res = await cloudinary.uploader.upload(url, {
                folder: "synapse/blog-covers",
                public_id: `blog-cover-${slug}`,
                overwrite: false,
            });
            const secureUrl = res?.secure_url || "";
            coverUrlCache.set(slug, secureUrl);
            return secureUrl;
        } catch (e) {
            console.error(`❌ Cloudinary upload failed for slug "${slug}":`, e?.message || e);
            return url;
        }
    }

    return url;
};

const blogs = [
    {
        title: "How to Crack NEET 2025: A Complete Study Plan for Aspiring Doctors",
        slug: "how-to-crack-neet-2025-complete-study-plan",
        excerpt:
            "Planning to appear for NEET 2025? Here's a structured, month-by-month study plan covering Physics, Chemistry, and Biology to maximise your score.",
        content: `
## Introduction

NEET (National Eligibility cum Entrance Test) is the single gateway to MBBS and BDS admissions across India. With over 20 lakh candidates appearing each year, preparation must be strategic, consistent, and well-paced.

## Subject-Wise Strategy

### Biology (360 Marks — Most Important)
Biology carries the highest weightage in NEET. Focus on NCERT Chapters 1–22 thoroughly. Key topics include:
- Cell Biology & Cell Division
- Genetics and Evolution
- Human Physiology
- Plant Physiology
- Ecology and Environment

**Tip:** Read NCERT Biology line by line. Almost 80% of Biology questions are directly from NCERT.

### Physics (180 Marks)
Physics requires conceptual clarity combined with formula application. High-weightage topics:
- Mechanics (Laws of Motion, Work & Energy)
- Electrostatics and Current Electricity
- Optics
- Modern Physics

**Tip:** Solve at least 30 numerical problems per day. Use HC Verma for concept building.

![Medical Study](https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=800)

### Chemistry (180 Marks)
Split equally between Physical, Organic, and Inorganic Chemistry.
- Physical Chemistry: Focus on Mole Concept, Electrochemistry, Thermodynamics
- Organic: Reaction mechanisms, Named Reactions, Biomolecules
- Inorganic: NCERT is king — memorise reactions and properties

## Monthly Study Plan (12 Months)

| Month | Focus Area |
|-------|-----------|
| Jan–Feb | Complete NCERT Biology Vol 1 & 2 |
| Mar–Apr | Physics Mechanics + Organic Chemistry basics |
| May–Jun | Full syllabus revision + NCERT re-reading |
| Jul–Aug | Mock tests (1 full test every 3 days) |
| Sep–Oct | Weak topic revision + previous year papers (2015–2024) |
| Nov | Final revision + daily MCQ practice |

## Mock Tests — Your Secret Weapon

Appear for at least 20 full-length mock tests before the exam. Analyse each test to identify weak areas. Use platforms like NTA Abhyas, Synapse Edu Hub mock tests, and Allen DLP.

## Conclusion

Cracking NEET 2025 requires patience, consistent effort, and smart study. Start early, stay focused, and revise regularly. Good luck!
        `.trim(),
        tags: ["NEET", "Medical Entrance", "Study Plan", "NEET 2025", "MBBS"],
        isPublished: true,
    },
    {
        title: "Top 10 Scientifically Proven Study Techniques Every Student Should Know",
        slug: "top-10-scientifically-proven-study-techniques",
        excerpt:
            "Stop re-reading your notes. Science has proven far better ways to learn. Discover 10 powerful evidence-backed study methods to boost retention and exam scores.",
        content: `
## Why Most Students Study Wrong

Most students rely on passive techniques — re-reading, highlighting, and copying notes. Research shows these methods have very low learning efficiency. Here are 10 techniques that actually work.

![Active Learning](https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800)

## 1. Active Recall (Retrieval Practice)
Instead of reading, close the book and write down everything you remember. This forces your brain to retrieve information, which strengthens memory pathways.

**How to:** After reading a chapter, close the book. Write everything you know. Then check and fill gaps.

## 2. Spaced Repetition
Review material at increasing intervals — after 1 day, 3 days, 1 week, 2 weeks, 1 month. Use apps like Anki to automate this.

## 3. The Pomodoro Technique
Study in 25-minute focused sprints with 5-minute breaks. After 4 sprints, take a 20-minute break.

## 4. Interleaving
Instead of studying one subject for hours, mix subjects. For example: 30 mins Maths → 30 mins Physics → 30 mins Chemistry. This improves transfer of learning.

## 5. Mind Mapping
Create visual diagrams linking concepts. Ideal for Biology and History topics.

## 6. Feynman Technique
Explain a concept in simple language as if teaching a 10-year-old. If you can't explain it simply, you don't understand it yet.

## 7. Elaborative Interrogation
Ask "Why?" and "How?" for every concept. Go beyond surface understanding.

## 8. Dual Coding
Combine text with visuals — draw diagrams, timelines, and charts alongside written notes.

## 9. Sleep After Studying
Your brain consolidates memories during sleep. Studying before sleep dramatically improves retention.

## 10. Practice Testing
Solve past exam papers and sample questions regularly. This is the single most effective study strategy according to research.

## Conclusion

Replace passive reading with active recall, spaced repetition, and practice tests. Combine these techniques and watch your scores soar.
        `.trim(),
        tags: ["Study Tips", "Learning Techniques", "Academic Success", "Exam Preparation", "Students"],
        isPublished: true,
    },
    {
        title: "JEE Main 2025: Subject-Wise Preparation Tips and Best Books",
        slug: "jee-main-2025-preparation-tips-best-books",
        excerpt:
            "Preparing for JEE Main 2025? Here are proven subject-wise tips, the best books recommended by toppers, and a practical timetable to ace the exam.",
        content: `
## JEE Main 2025 — An Overview

JEE Main is conducted by the National Testing Agency (NTA) for admissions to NITs, IIITs, and other Centrally Funded Technical Institutions (CFTIs). Scoring well in JEE Main also serves as a prerequisite for JEE Advanced.

![Engineering Entrance](https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800)

## Mathematics

**Key Topics:**
- Coordinate Geometry
- Calculus (Differentiation & Integration)
- Matrices and Determinants
- Probability & Statistics
- Complex Numbers

**Best Books:**
- RD Sharma (Class 11 & 12)
- Cengage Mathematics Series
- Previous Year JEE Papers (10 years)

**Tip:** Solve at least 50 questions per topic before moving on. Quality over quantity.

## Physics

**Key Topics:**
- Mechanics (30% weightage)
- Electrodynamics
- Modern Physics
- Waves and Sound

**Best Books:**
- HC Verma — "Concepts of Physics" (Vol 1 & 2)
- DC Pandey for problem-solving
- NCERT (for theory and diagrams)

**Tip:** Understand the concept first, then solve numericals. Never memorise formulas without understanding derivations.

## Chemistry

**Key Topics:**
- Chemical Bonding
- Organic Reactions (SN1, SN2, E1, E2)
- Periodic Table Trends
- Electrochemistry

**Best Books:**
- NCERT Chemistry (11 & 12) — mandatory
- O.P. Tandon for Physical Chemistry
- M.S. Chauhan for Organic Chemistry

## Timetable for 6-Month Preparation

| Month | Plan |
|-------|------|
| Month 1–2 | Build foundation — complete all NCERT chapters |
| Month 3–4 | Topic-wise solve reference books |
| Month 5 | 3 full mock tests per week |
| Month 6 | Revision + error book + previous papers |

## Conclusion

JEE Main rewards consistent, rigorous practice. Focus on NCERT, master the fundamentals, and solve at least 3,000 problems before the exam.
        `.trim(),
        tags: ["JEE Main", "Engineering Entrance", "IIT", "NIT", "JEE 2025"],
        isPublished: true,
    },
    {
        title: "The Benefits of Online Learning: Why Digital Education is the Future",
        slug: "benefits-of-online-learning-digital-education-future",
        excerpt:
            "Online learning has transformed how students access quality education. Explore the top benefits of e-learning and how platforms like Synapse Edu Hub are shaping the future of education.",
        content: `
## The Rise of Online Education

The global e-learning market is projected to reach $375 billion by 2026. The COVID-19 pandemic accelerated a shift that was already underway — students are increasingly choosing online platforms over traditional classrooms.

![Online Education](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800)

## Key Benefits of Online Learning

### 1. Flexibility and Convenience
Students can learn at their own pace, from anywhere, at any time. This is especially important for students who travel, work part-time, or need to revisit complex topics.

### 2. Access to World-Class Content
Online platforms bring the best teachers and content to students regardless of their geographical location. A student in a small town can access the same quality content as a student in a metro city.

### 3. Personalised Learning Paths
Adaptive learning technologies allow platforms to customise content based on each student's strengths and weaknesses.

### 4. Cost-Effectiveness
Online courses typically cost significantly less than traditional coaching. No commute, no paper textbooks, and no accommodation costs.

### 5. Immediate Feedback
Digital assessments provide instant results. Students know where they went wrong immediately, which accelerates the learning cycle.

### 6. Rich Multimedia Content
Videos, animations, interactive diagrams, and virtual labs make abstract concepts easier to understand compared to static textbook images.

### 7. Recorded Sessions for Revision
Unlike physical classrooms, online lectures can be paused, rewound, and replayed. This is invaluable during exam revision.

## How Synapse Edu Hub Supports Online Learning

At Synapse Edu Hub, we combine the intimacy of personalised coaching with the convenience of digital learning. Our platform offers:
- Live and recorded classes
- Topic-wise practice tests and full-length mock exams
- One-on-one doubt sessions
- Progress tracking dashboards for students and parents

## Conclusion

Online learning is no longer a compromise — it's often the smarter choice. With the right platform and discipline, students can achieve outstanding results from the comfort of their homes.
        `.trim(),
        tags: ["Online Learning", "E-Learning", "Digital Education", "EdTech", "Study Online"],
        isPublished: true,
    },
    {
        title: "Time Management for Students: 7 Habits to Study Smarter, Not Harder",
        slug: "time-management-for-students-study-smarter",
        excerpt:
            "Struggling to balance school, coaching, and personal time? These 7 proven time management habits will help students maximise their productivity and reduce stress.",
        content: `
## The Time Management Challenge

Most students have the same 24 hours, yet some manage to cover the entire syllabus, score high marks, and still have time for hobbies. The difference? Time management.

![Time Management Outline](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800)

## Habit 1: Plan the Night Before

Spend 10 minutes each night planning the next day. Write down 3 "must-complete" tasks and 3 "nice-to-have" tasks. This removes decision fatigue in the morning.

## Habit 2: Use Time Blocks, Not Task Lists

Instead of a to-do list, block specific time slots for specific subjects. Example:
- 6:00–8:00 AM → Mathematics
- 4:00–6:00 PM → Physics
- 8:00–9:30 PM → Biology

## Habit 3: Identify and Eliminate Time Leaks

Track how you spend 1 week. Most students waste 2–3 hours daily on social media without realising it. Use apps like Digital Wellbeing (Android) or Screen Time (iOS) to audit usage.

## Habit 4: Prioritise with the Eisenhower Matrix

Categorise tasks into:
- **Urgent + Important:** Do immediately (e.g., tomorrow's exam revision)
- **Important, Not Urgent:** Schedule (e.g., starting syllabus early)
- **Urgent, Not Important:** Delegate or minimise
- **Neither:** Eliminate

## Habit 5: Protect Your Peak Hours

Every student has 2–4 hours each day when their brain is sharpest. Use these hours for the most difficult subjects. Reserve low-energy times for revision or lighter tasks.

## Habit 6: Take Strategic Breaks

The brain can focus intensely for 45–90 minutes before performance drops. Use the Pomodoro method or take a 10-minute break after every 50 minutes of study.

## Habit 7: Weekly Review

Every Sunday, review the week. Ask:
- Did I complete my planned tasks?
- Which subjects need more time next week?
- What distractions can I reduce?

## Conclusion

Time management is a skill — not a talent. Build these habits consistently and you'll be amazed at how much more you can accomplish in the same 24 hours.
        `.trim(),
        tags: ["Time Management", "Student Productivity", "Study Habits", "Academic Success", "Exam Tips"],
        isPublished: true,
    },
    {
        title: "Class 10 Board Exam Preparation: A Month-Wise Study Schedule",
        slug: "class-10-board-exam-preparation-study-schedule",
        excerpt:
            "Class 10 board exams can feel overwhelming. This practical month-by-month study schedule for CBSE Class 10 covers all subjects and builds confidence before exam day.",
        content: `
## Why Class 10 Matters

Class 10 board results influence stream selection, scholarship eligibility, and college admissions. A score of 90%+ opens doors to Science, Commerce, or Arts streams at top schools.

## Subject Overview and Weightage

| Subject | Maximum Marks |
|---------|---------------|
| Mathematics | 80 |
| Science | 80 |
| Social Science | 80 |
| English | 80 |
| Hindi / Second Language | 80 |

**Internal Assessment:** 20 marks each (practicals, projects, periodic tests)

## Month-Wise Study Plan (October to March)

### October — Foundation Month
- Complete NCERT reading for all subjects
- Make chapter-wise notes
- Solve NCERT exercises at the back of each chapter

### November — Deep Dive
- Start solving sample papers (subject-wise)
- Focus: Science diagrams + Maths formulas
- Begin Social Science map practice

### December — Mock Tests Begin
- Solve 2 full-length practice papers per week
- Identify weak chapters and revisit them
- English: Practice letter writing, essay, and comprehension

### January — Intensive Revision
- Solve past 5-year CBSE board papers (2019–2024)
- Science: Revise all chemical equations + diagrams
- Maths: Solve all NCERT examples and exercises

### February — Subject Sprints
- Dedicate one full day to each subject for revision
- Focus on frequently asked questions
- Reduce social media to under 30 minutes/day

### March (Exam Month) — Final Sprint
- Revise notes only (no new topics)
- Sleep 8 hours — memory consolidation is critical
- Practise writing within time limits

## Key Tips

1. **NCERT is the Bible** for Class 10 — CBSE sets questions directly from it
2. **Diagrams matter** — In Science, labelled diagrams fetch full marks
3. **Show your working** in Maths — even if the final answer is wrong, you get step marks
4. **Attempt all questions** — CBSE has no negative marking

## Conclusion

Class 10 is a marathon, not a sprint. Start early, stay consistent, and trust the process. With the right plan and dedication, scoring 90%+ is absolutely achievable.
        `.trim(),
        tags: ["CBSE Class 10", "Board Exams", "Study Schedule", "Class 10 Tips", "School Exams"],
        isPublished: true,
    },
    {
        title: "CBSE Class 9 Science Study Plan: Chapter-Wise Schedule for 90+",
        slug: "cbse-class-9-science-study-plan-chapter-wise-schedule-90-marks",
        excerpt:
            "Need a clear chapter-wise plan for CBSE Class 9 Science? Follow this 12-week schedule with NCERT-first reading, diagram practice, and weekly revision cycles.",
        content: `
## Goal: Finish NCERT Deeply (Not Quickly)

For Class 9 Science, CBSE questions are strongly based on NCERT concepts. Your best strategy is:

- Read NCERT first (concept clarity)
- Make short notes (only what you can revise)
- Practice NCERT exercises + extra questions
- Revise with active recall every week

## How to Use This 12-Week Plan

- Each week has 5 study days and 2 revision/practice days.
- Focus on 1-2 chapters per week to avoid rushing.
- Keep a single "Error Notebook" for mistakes and recurring weak topics.

## Weeks 1-3: Build Strong Concepts (Physics + Chemistry Foundations)

### Week 1
- Chapters/Units: Start with fundamentals (Motion, Measurement concepts where applicable)
- Daily routine: 30 min NCERT reading + 45 min examples + 15 min recall
- End of week: 30-40 question mixed practice

### Week 2
- Continue core concepts and start writing short definitions in your own words
- Add diagram practice wherever diagrams are involved
- End of week: 1 mini test (45-60 minutes)

### Week 3
- Finish understanding the key ideas
- Practice NCERT questions without looking at notes
- End of week: Revise Week 1-2 key points (active recall)

## Weeks 4-7: Chemistry + Biology Concepts with Regular Practice

### Week 4
- Chemistry concepts: focus on reactions, properties, and reasoning (not memorization only)
- Daily: 1 explanation you can speak aloud (Feynman-style)
- End: diagram-based answers + short notes review

### Week 5
- Biology concepts: study the processes in steps (cause -> process -> result)
- Practice: label diagrams + answer in 3-5 points

### Week 6
- Mixed revision: revisit weak subtopics from Weeks 1-5
- Do 2 sets of 25 questions (timed)

### Week 7
- Complete remaining chapters (or catch-up if you fell behind)
- End of week: one full chapter test

## Weeks 8-10: Term-II Style Preparation (Practice + Revision)

### Week 8
- Past school papers / sample papers style questions
- Build strong answer writing: introduction, 3 points, conclusion

### Week 9
- Focus on high-weight topics and repeatedly weak areas
- Daily: 20-minute recall + 30-minute practice

### Week 10
- Chapter-wise revision
- Prepare a formula/diagram sheet (only what you use frequently)

## Weeks 11-12: Final Revision and Exam Readiness

### Week 11
- Full syllabus revision (short notes only)
- 1 full mock test + detailed correction

### Week 12
- Last 7 days: revise, do error notebook, and practice diagram answers
- Sleep well before the final exam day (memory consolidation matters)

## Exam Day Checklist (Quick)

- Read the question carefully (key words like "explain", "compare", "label")
- Start with the easiest marks first
- Use diagrams wherever required (neatness scores)

## Conclusion

If you follow this schedule consistently, you will not just "complete" the syllabus. You will be able to remember concepts, explain answers clearly, and score 90+ with confidence.
        `.trim(),
        tags: ["CBSE Class 9", "Science", "Study Plan", "NCERT", "Board Exams"],
        isPublished: true,
    },
    {
        title: "CBSE Class 10 Maths: 30-Day Revision Plan for High Scores",
        slug: "cbse-class-10-maths-30-day-revision-plan-high-scores",
        excerpt:
            "A practical 30-day CBSE Class 10 Maths revision roadmap. Includes daily practice routine, chapter focus order, and last-week exam strategy.",
        content: `
## Why a Revision Plan Works for Maths

In Class 10 Maths, marks come from:

- Correct concepts
- Accurate formulas and steps
- Lots of practice under time limits

This 30-day plan is built to do all three.

## Daily Routine (Non-Negotiable)

- 30 minutes: revise concepts + formulas (from your short notes)
- 45 minutes: solve 12-20 questions (mix easy and medium first)
- 15 minutes: error notebook (write the "why" behind each mistake)

## Chapter Focus Order (So You Keep Momentum)

Use this sequence. If you already finished chapters earlier, treat these as revision.

- Week 1-2: Algebra + Arithmetic
- Week 3: Geometry + Mensuration
- Week 4: Trigonometry + Coordinate Geometry + Statistics/Probability

## 30-Day Schedule

### Days 1-7: Algebra + Arithmetic Revision
- Focus: equations, identities, and number work
- Daily target: 2 mixed question sets
- End of Day 7: mini test (60-75 minutes)

### Days 8-14: Geometry + Mensuration
- Focus: theorems, angle relationships, area/volume type questions
- Daily target: 1 diagram-heavy question + 10 calculation questions
- End of Day 14: revise mistakes and redo missed questions

### Days 15-21: Trigonometry + Coordinate Geometry
- Focus: trigonometric identities, graphs, and coordinate problems
- Daily target: 15 medium problems + 5 previous-year style questions
- End of Day 21: one timed section test

### Days 22-27: Mixed Practice (Most Important Week)
- Focus: whatever you missed most often in the first 3 weeks
- Daily target: 25-35 questions with time tracking
- End: sort mistakes by topic (fractions, algebra, geometry, etc.)

### Days 28-30: Final Exam Simulation
- Day 28: full mock test + correction
- Day 29: redo correction set + revise formula sheet
- Day 30: light revision + 15-20 question warm-up

## Last 3 Things to Remember

- Write steps even if you are unsure (partial marks happen)
- Use your formula sheet, but understand when to apply each formula
- Practice with a timer to improve speed and accuracy

## Conclusion

If you follow this 30-day plan with consistency, you will improve both accuracy and speed. That is the quickest path to high scores in CBSE Class 10 Maths.
        `.trim(),
        tags: ["CBSE Class 10", "Maths", "Revision Plan", "Board Exams", "Practice"],
        isPublished: true,
    },
    {
        title: "NEET Biology in 45 Days: NCERT Chapter Plan + Daily Revision Routine",
        slug: "neet-biology-in-45-days-ncert-chapter-plan-daily-revision",
        excerpt:
            "A focused 45-day NEET Biology plan based on NCERT. Includes chapter flow, daily study routine, diagram/recall method, and weekly revision cycles.",
        content: `
## Why 45 Days Can Work for Biology

Biology is scoring if you:

- finish NCERT chapters properly
- revise using active recall
- practice NCERT line-to-question thinking (what concept answers a question?)

This plan is designed to do exactly that.

## Your Daily Routine (6-7 Hours Example)

- 90 minutes: NCERT reading (1 subtopic at a time)
- 60 minutes: diagrams/figures + explanation in your own words
- 90 minutes: NCERT exercise + MCQs (topic wise)
- 45 minutes: active recall (write from memory, then check)
- 30 minutes: error notebook + weak-topic mini revision

## Weekly Flow (9 Weeks)

### Week 1-2: Core Foundations
- Cell division, genetics basics, and evolution fundamentals
- Daily focus: definitions + diagrams (you must be able to draw/label)
- End of Week 2: revision test (mixed from Week 1-2)

### Week 3-4: Human Physiology (High Scoring)
- Focus on systems, processes, and cause-effect statements
- Learn diagrams as steps (e.g., pathway: organ -> process -> output)
- End of Week 4: timed practice session (60-75 minutes)

### Week 5: Plant Physiology
- Focus on photosynthesis, transport, and plant processes
- Practice: make your own "flowchart" notes for each topic

### Week 6: Ecology and Environment
- Learn cycles, ecosystems, and key environmental terms
- Practice: answer in 3-5 points (avoid long paragraphs)

### Week 7-8: Revision + Gap Filling
- Revisit weak chapters and redo the questions you got wrong
- Add "one page summary" for each chapter (only important points)

### Week 9: Rapid Recall + Full Coverage
- 5 days: chapter-wise revision
- 2 days: mixed tests and final recall

## Active Recall Rules (Do These Every Week)

- After each reading session, close the book and write what you remember.
- Review errors the same day (small fixes lead to big score gains).
- Use spaced repetition: Day 3, Day 7, Day 14 for the same chapter notes.

## Conclusion

If you commit to NCERT-first learning plus active recall, Biology becomes predictable and scoreable. Follow this 45-day routine and you will walk into NEET with strong confidence.
        `.trim(),
        tags: ["NEET Biology", "Biology", "NCERT", "Study Plan", "NEET 2025"],
        isPublished: true,
    },
    {
        title: "How to Create a Smart Study Timetable for Students (Classes 4-10)",
        slug: "smart-study-timetable-for-students-classes-4-to-10",
        excerpt:
            "A simple timetable template for students in Classes 4 to 10: balance homework, revision, and practice while avoiding burnout.",
        content: `
## The Real Problem: Students Don't Need More Time

Most students fail not because they lack time, but because they lack a routine.
An effective timetable makes study:

- predictable (you know what to do next)
- realistic (matches energy levels)
- measurable (you can track progress)

## Step 1: List What Must Be Done

Make 3 lists:

- School subjects (Maths, Science, English, Social Science, etc.)
- Homework tasks (daily/weekly)
- Exam preparation (spaced revision + practice)

## Step 2: Use Time Blocks (Not Vague Plans)

Example blocks you can adjust:

- "Power Hour" (most focused time): 60-90 minutes for difficult subject
- Practice block: 30-45 minutes for problem solving
- Revision block: 20-30 minutes for active recall
- Light block: 20 minutes for reading, diagrams, or note review

## Step 3: Sample Timetable (Weekdays)

Use this as a starting template:

- After school: 30-45 minutes break + snacks
- 4:30-5:45: Power Hour (Maths or Science)
- 6:00-6:30: Homework / written practice
- 7:00-7:30: Revision with active recall
- 8:00-8:15: Error notebook + quick planning for tomorrow

## Step 4: Weekend Plan (Avoid the "Sunday Panic")

Saturday:
- 45 minutes: one subject revision
- 45 minutes: practice test / worksheet

Sunday:
- 60 minutes: full revision of the week
- 30 minutes: fix weak topics

## Step 5: Weekly Review (5 minutes only)

Every Sunday night, answer:

- Which subject improved most?
- Which chapter is still weak?
- What will you change next week?

## Conclusion

Once you start following a timetable consistently, results become easier: better focus, better revision, and less stress.
Use this template and adjust it based on your child/student's energy and school schedule.
        `.trim(),
        tags: ["Study Timetable", "Students", "Learning Routine", "Homework", "Academic Success"],
        isPublished: true,
    },
];

const seed = async () => {
    await connect();

    // Find a superadmin or admin to act as author
    const author = await User.findOne({ role: { $in: ["superadmin", "admin"] } });
    if (!author) {
        console.error("❌ No admin or superadmin user found in the database. Please create one first.");
        process.exit(1);
    }
    console.log(`✅ Using author: ${author.name} (${author.role})`);

    let inserted = 0;
    let skipped = 0;

    for (const blogData of blogs) {
        try {
            const existing = await Blog.findOne({ slug: blogData.slug });
            const existingHasFeaturedImage = Boolean(existing?.featuredImage);
            const needsFeaturedImage = !existingHasFeaturedImage && Boolean(coverUrlsBySlug[blogData.slug]);
            const uploadedFeaturedImage = needsFeaturedImage ? await uploadCoverToCloudinary(blogData.slug) : "";

            if (existing) {
                // If the blog already exists, update `featuredImage` if it's different or missing.
                if (uploadedFeaturedImage && existing.featuredImage !== uploadedFeaturedImage) {
                    existing.featuredImage = uploadedFeaturedImage;
                    await existing.save();
                    console.log(`✅ Updated featuredImage: "${blogData.title}"`);
                }
                
                // Always sync content and excerpt from seeder
                if (existing.content !== blogData.content || existing.excerpt !== blogData.excerpt) {
                    existing.content = blogData.content;
                    existing.excerpt = blogData.excerpt;
                    await existing.save();
                    console.log(`✅ Updated content/excerpt: "${blogData.title}"`);
                }
                
                console.log(`⏭️  Synced/Skipped: "${blogData.title}"`);
                skipped++;
                continue;
            }

            const blog = new Blog({
                ...blogData,
                featuredImage: uploadedFeaturedImage || blogData.featuredImage,
                author: author._id,
                publishedAt: new Date(),
            });

            // Validate before save to surface field-level errors clearly
            const validationError = blog.validateSync();
            if (validationError) {
                console.error(`❌ Validation failed for "${blogData.title}":`, validationError.message);
                skipped++;
                continue;
            }

            await blog.save();
            console.log(`✅ Inserted: "${blogData.title}"`);
            inserted++;
        } catch (err) {
            console.error(`❌ Failed to insert "${blogData.title}":`, err.message);
            if (err.errors) {
                Object.entries(err.errors).forEach(([field, e]) => {
                    console.error(`   • ${field}: ${e.message}`);
                });
            }
            skipped++;
        }
    }

    console.log(`\n🎉 Done! ${inserted} blogs inserted/updated, ${skipped} skipped.`);
    process.exit(0);
};

seed().catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
});
