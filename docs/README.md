# AASRA / KrishYantra — Documentation & Research Repository

Welcome to the **Documentation and Research Hub** for KrishYantra (AASRA). This directory contains all technical specifications, agronomic research papers, machine learning model manuals, and architectural blueprints for the platform.

---

## Directory Organization

```
docs/
├── architecture/       # System architecture specifications and diagrams
├── ml-models/          # Training manuals, Colab notebooks, and model specs
├── research/           # Agronomic reports, concept notes, and product databases
├── cehub/              # Strategic analyses, presentation decks, and hackathon notes
├── generate_pdf.js     # Script for generating branded PDF documentation
└── pdf_style.css       # Print styling for PDF generation
```

---

## 1. Architecture (`docs/architecture/`)

| Document | Format | Description |
| :--- | :--- | :--- |
| [`ARCHITECTURE.txt`](file:///d:/Projects/DriveF-Projects/nibooz-whatup/docs/architecture/ARCHITECTURE.txt) | Plain Text | Complete system architectural specification, end-to-end data pipelines, API contracts, and security models. |
| `AASRA_Features_and_Architecture_Guide.pdf` | PDF | Executive overview of system features, user interfaces, and multi-tier cloud deployment. |
| `AASRA_Technology_Stack_Specification.pdf` | PDF | Technical breakdown of Next.js 16, FastAPI, Vertex AI, Webhooks, and PostgreSQL/Firebase layers. |
| `ASSARA_SYSTEM_ARCHITECTURE_AND_ALGORITHMS.pdf` | PDF | Detailed mathematical and algorithmic formulations for biophysical stress scoring and causal inference. |
| `Hyperion_PS02_PS03Technical_specification.pdf` | PDF | Technical specifications covering Problem Statements PS-02 and PS-03. |
| `PS04_ALGORITHM_AND_ARCHITECTURE.md` | Markdown | Deep dive into Problem Statement PS-04: Closed-loop remission engine and salvage analytics. |
| `PS04_PS07_TECHNICAL_DOCUMENTATION.md` | Markdown | Technical specifications covering Problem Statements PS-04 and PS-07. |
| `AASRA_PS02_PS03_Technical_Documentation.pdf` | PDF | Compiled documentation for PS-02 and PS-03 agronomic engines. |

---

## 2. Machine Learning Models (`docs/ml-models/`)

| Document | Target Model | Description |
| :--- | :--- | :--- |
| `AASRA_Model_1_Climate_Stress_Training_Manual.pdf` | **Model 1** | XGBoost classifier manual for multi-stress biophysical risk forecasting (heat, frost, drought, pests). |
| `AASRA_Model_1_Executive_Checklist_and_Access_Directory.pdf` | **Model 1** | Deployment checklist, feature importance rankings, and cloud endpoints. |
| `AASRA_Model_2_Biological_Readiness_Training_Manual.pdf` | **Model 2** | Delta-T and vapor pressure deficit (VPD) spray safety decision engine manual. |
| `AASRA_Model_2_Executive_Checklist_and_Access_Directory.pdf` | **Model 2** | Operational parameters and chemical stability gates. |
| `AASRA_Model_3_Product_Ranking_Master_Manual.pdf` | **Model 3** | Portfolio Ranker manual for matching Syngenta products to crops, stresses, and growth stages. |
| [`AASRA_Model_3_Training_Google_Colab.ipynb`](file:///d:/Projects/DriveF-Projects/nibooz-whatup/docs/ml-models/AASRA_Model_3_Training_Google_Colab.ipynb) | **Model 3** | Interactive Jupyter/Colab notebook for model training, validation, and evaluation. |
| `AASRA_Model_5_Field_Yield_Baseline_Training_Manual.pdf` | **Model 5** | Genetic yield potential and historical district baseline regression manual. |
| `AASRA_6_Models_Linear_Input_Specification.pdf` | **Models 1–6** | Unified end-to-end vector pipeline schema linking all 6 models sequentially. |
| `AASRA_ML_Models_and_Vertex_AI_Deployment_Guide.pdf` | **Vertex AI** | Step-by-step guide for containerizing and deploying models to GCP Vertex AI endpoints. |

---

## 3. Agronomic Research & Datasets (`docs/research/`)

| Document | Description |
| :--- | :--- |
| `02-Concept note.pdf` | Initial project concept note framing the agricultural challenge and proposed AI solution. |
| `AASRA_25_Page_Model_Master_Report.pdf` | Comprehensive 25-page research report detailing scientific methodology, datasets, and ICAR trials. |
| `AASRA_Syngenta_50_Products_Full_Agronomic_Guide.pdf` | Complete agronomic field guide for 50 Syngenta biologicals, fungicides, and insecticides. |
| [`syngenta_50_products.csv`](file:///d:/Projects/DriveF-Projects/nibooz-whatup/docs/research/syngenta_50_products.csv) | Machine-readable CSV database of products, active ingredients, dosage rates, and compatibility. |
| `AASRA_Team_ML_Master_Training_Guide.pdf` | Developer training guide for building and evaluating agronomic models. |
| `AASRA_TECHNICAL_RESEARCH.md` | Field notes and technical research summaries from Indian agricultural university publications. |
| `ANNAM_AI_Technical_Documentation_PS02_PS03.md` | Multi-language agronomic triage research and integration findings. |
| `API_FINAL_REPORT.md` | Comprehensive benchmark report on API latencies, Vertex AI response times, and model throughput. |
| `FRONTEND_DATA_INTEGRATION_AUDIT.md` | Audit verifying end-to-end data parity across all frontend state managers and backend endpoints. |
| `cehub/` | Presentation slide decks and strategic documentation. |

---

## PDF Generation Utility

You can generate branded PDF versions of markdown documentation using the included script:

```bash
cd docs
npm install
node generate_pdf.js input.md output.pdf
```
