# AI-Powered Adaptive Learning & Automated Remediation System

An end-to-end intelligent assessment and learning intervention engine built with Python and Streamlit. The system combines **Random Forest Machine Learning** to model teacher grading behaviors and **Bayesian Knowledge Tracing (BKT)** approximations to estimate student concept mastery. 

Instead of forcing struggling students through immediate re-testing, the platform automatically deploys targeted micro-interventions, content recommendations, and error-pattern feedback.

---

## 🌟 Key Features

* **Student Remediation Hub**: Real-time mastery probability $P(M)$ tracking, error-pattern feedback (misconceptions, slips, wrong formulas), and low-stakes 2-item micro-reviews.
* **Teacher Dashboard**: Real-time alerts for struggling students ($P(M) < 40\%$), interactive AI grading score simulator, and Bloom's Taxonomy-balanced exam generator.
* **Learned Grading Model**: A Random Forest regressor (`100 trees, max_depth=15`) trained on historical grading logs (correctness, presentation, effort) to replicate evaluation patterns.
* **Automated Synthetic Data Engine**: Auto-generates lightweight CSV data structures for testing without requiring external database setups.

---

## 📁 Repository Structure

```text
AI_Exam_System/
│
├── data/                       # Synthetic CSV datasets (Auto-generated)
│   ├── student_responses.csv   # Student interaction logs & error types
│   ├── teacher_grading.csv     # Historical grading records for AI training
│   ├── question_bank.csv       # Items tagged with Bloom's Taxonomy levels
│   └── resource_bank.csv       # Learning materials for targeted remediation
│
├── generate_data.py            # Generates mock CSV files in data/
├── engine.py                   # Core ML models, BKT mastery logic, & remediation rules
└── app.py                      # Streamlit interactive web dashboard
```
---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Language** | Python 3.10+ |
| **User Interface** | Streamlit |
| **Machine Learning** | scikit-learn (Random Forest) |
| **Data Processing** | pandas, numpy |
| **Knowledge Tracing** | pyBKT, custom heuristic rules |

---
