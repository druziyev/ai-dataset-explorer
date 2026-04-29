Project Title: Interactive Big Data Analytics Web Application – Automated Dataset Explorer with AI-Powered Insights

Course: Big Data Analytics Deadline: [Insert date, e.g., 2 weeks from assignment date] Team Size: 1–3 students (recommended to work in pairs) Total Points: 100

1. Project Objective
You will build a full-stack web application that allows users to upload a real-world dataset (CSV or Excel file) and receive a complete automated big-data analysis:

Data parsing and cleaning
Exploratory Data Analysis (EDA)
Automatic generation of relevant visualizations
Detection of patterns, correlations, and business insights
AI-assisted natural-language summary and conclusions
The goal is to demonstrate end-to-end big data processing skills: data ingestion, analytics pipeline, visualization, and actionable insight generation.

2. Functional Requirements
Frontend (Web Interface)

Modern, clean single-page application.
Drag-and-drop or “Browse” button to upload CSV or Excel (.xlsx) file (max 50 MB).
After upload, show a preview table of the first 20 rows.
One-click button “Analyze Dataset”.
Display loading indicator while backend processes the file.
Results page must show:
All generated visualizations
Statistical summary
AI-generated insights and conclusions
Backend (Python)

Use any Python web framework you prefer (FastAPI recommended, Flask or Django also accepted).
Accept the uploaded file via REST API.
Parse the file using pandas.
Perform automatic Exploratory Data Analysis:
Handle missing values and basic data cleaning
Identify column types (numeric, categorical, datetime, text)
Generate appropriate visualizations for different column types:
Line / area charts (time-series / trends)
Bar / column charts
Histograms & density plots
Pie / donut charts (for categorical distributions)
Box plots & violin plots
Correlation heatmaps / pair plots
Scatter plots with regression lines
Any other relevant charts (geographical maps if coordinates present, etc.)
Use Plotly or Altair (highly recommended) for interactive charts.
Automatically detect patterns and insights (correlations, outliers, trends, clusters, etc.).
Optional but strongly encouraged: Integrate AI agents (LangChain, CrewAI, AutoGen, or OpenAI/Groq API) to generate human-readable insights and business recommendations.
Output The backend must return a single JSON response containing:

Cleaned dataset summary (shape, missing values, data types)
All visualization data (as Plotly JSON or base64 images)
Statistical metrics (descriptive statistics, top correlations, etc.)
Natural-language insights and final conclusions
3. Example Project (Car Sales Dataset)
Dataset: car_sales.csv (you can download a sample from Kaggle or use any public dataset)

Expected Output on the Results Page:

Visualizations:
Line chart: Average price by Year
Bar chart: Sales by Manufacturer
Pie chart: Market share by Fuel Type
Histogram: Price distribution
Correlation heatmap between numeric features
Scatter plot: Engine Size vs. Price with regression line
AI-Generated Insights (example):
“Electric vehicles show 28% higher average price but 42% lower mileage. There is a strong positive correlation (r = 0.87) between engine size and price. Sales of hybrid models have grown 156% in the last 3 years. Recommendation: Focus marketing on electric SUV segment in urban areas where mileage sensitivity is lower.”

4. Technologies (Recommended Stack)
Layer	Allowed Technologies
Frontend	React, Vue 3, Svelte, or plain HTML + Tailwind + JavaScript
Backend	Python (FastAPI / Flask / Django)
Data	pandas, numpy
Visualization	Plotly, Altair, or seaborn + matplotlib
AI Agents	LangChain, CrewAI, LlamaIndex, OpenAI/Groq API
Deployment	Render, Railway, Hugging Face Spaces, or local
You may use any other modern libraries as long as the core requirements are met.

5. Deliverables (What to Submit)
GitHub repository link (public) with:
Complete source code (frontend + backend)
README.md with setup instructions and screenshots
One sample dataset + generated report (PDF or HTML)
Short video demo (2–4 minutes) showing upload → analysis → insights
Presentation slides (5–7 slides) explaining architecture and key insights found
6. Evaluation Criteria (100 points)
Frontend usability & design: 20 pts
Backend functionality & correct parsing: 25 pts
Quality and relevance of visualizations: 20 pts
Depth of insights & use of AI agents: 20 pts
Code quality, documentation & error handling: 10 pts
Creativity & extra features (auto-cleaning, export report, multiple datasets, etc.): 5 pts bonus
Important Notes:

You must handle errors gracefully (wrong file format, empty file, etc.).
Datasets should be realistic (sales, marketing, healthcare, social media, finance, etc.).
Plagiarism will result in zero points.