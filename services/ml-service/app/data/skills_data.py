# Comprehensive skill taxonomy for ML matching

ROLE_SKILL_MAP = {
    "backend engineer": {
        "core": ["node.js", "python", "java", "express", "fastapi", "django", "rest api", "postgresql", "mysql", "redis", "docker", "git"],
        "advanced": ["kubernetes", "microservices", "kafka", "rabbitmq", "graphql", "grpc", "aws", "system design"],
        "nice_to_have": ["typescript", "golang", "rust", "nginx", "terraform", "ci/cd"],
        "avg_salary_lpa": {"fresher": 6, "junior": 10, "mid": 18, "senior": 30, "lead": 45},
    },
    "frontend engineer": {
        "core": ["react", "javascript", "typescript", "html", "css", "tailwind", "git", "rest api"],
        "advanced": ["next.js", "vue", "angular", "webpack", "redux", "testing", "performance"],
        "nice_to_have": ["react native", "graphql", "figma", "accessibility", "seo"],
        "avg_salary_lpa": {"fresher": 5, "junior": 9, "mid": 16, "senior": 28, "lead": 40},
    },
    "full stack engineer": {
        "core": ["react", "node.js", "javascript", "typescript", "postgresql", "rest api", "git", "docker"],
        "advanced": ["next.js", "redis", "aws", "microservices", "graphql", "ci/cd"],
        "nice_to_have": ["kubernetes", "python", "system design", "devops"],
        "avg_salary_lpa": {"fresher": 7, "junior": 12, "mid": 20, "senior": 35, "lead": 50},
    },
    "data scientist": {
        "core": ["python", "machine learning", "scikit-learn", "pandas", "numpy", "sql", "statistics", "matplotlib"],
        "advanced": ["tensorflow", "pytorch", "deep learning", "nlp", "computer vision", "spark", "feature engineering"],
        "nice_to_have": ["mlflow", "airflow", "aws sagemaker", "docker", "a/b testing", "causal inference"],
        "avg_salary_lpa": {"fresher": 7, "junior": 12, "mid": 22, "senior": 38, "lead": 55},
    },
    "ml engineer": {
        "core": ["python", "machine learning", "tensorflow", "pytorch", "scikit-learn", "docker", "git", "sql"],
        "advanced": ["mlops", "kubernetes", "spark", "feature store", "model serving", "aws", "distributed training"],
        "nice_to_have": ["rust", "c++", "triton", "ray", "wandb", "dvc"],
        "avg_salary_lpa": {"fresher": 8, "junior": 14, "mid": 25, "senior": 42, "lead": 60},
    },
    "devops engineer": {
        "core": ["docker", "kubernetes", "ci/cd", "linux", "aws", "git", "bash", "terraform"],
        "advanced": ["ansible", "helm", "prometheus", "grafana", "jenkins", "github actions", "networking"],
        "nice_to_have": ["python", "go", "service mesh", "security", "chaos engineering"],
        "avg_salary_lpa": {"fresher": 6, "junior": 11, "mid": 20, "senior": 32, "lead": 48},
    },
    "software engineer": {
        "core": ["python", "java", "javascript", "data structures", "algorithms", "git", "sql", "rest api"],
        "advanced": ["system design", "docker", "aws", "microservices", "testing", "ci/cd"],
        "nice_to_have": ["kubernetes", "kafka", "redis", "distributed systems"],
        "avg_salary_lpa": {"fresher": 6, "junior": 10, "mid": 18, "senior": 30, "lead": 45},
    },
}

COMPANY_PROFILES = [
    {
        "name": "Google", "type": "Big Tech", "size": "Large",
        "required_skills": ["algorithms", "data structures", "system design", "python", "java"],
        "culture": ["innovation", "open source", "engineering excellence"],
        "typical_roles": ["software engineer", "ml engineer", "data scientist"],
        "difficulty": "very_hard", "interview_rounds": 5,
    },
    {
        "name": "Microsoft", "type": "Big Tech", "size": "Large",
        "required_skills": ["system design", "python", "java", "azure", "algorithms"],
        "culture": ["growth mindset", "collaboration", "diversity"],
        "typical_roles": ["software engineer", "full stack engineer", "ml engineer"],
        "difficulty": "hard", "interview_rounds": 5,
    },
    {
        "name": "Amazon", "type": "Big Tech", "size": "Large",
        "required_skills": ["aws", "system design", "java", "python", "microservices"],
        "culture": ["customer obsession", "ownership", "frugality"],
        "typical_roles": ["software engineer", "backend engineer", "devops engineer"],
        "difficulty": "hard", "interview_rounds": 5,
    },
    {
        "name": "Flipkart", "type": "E-commerce", "size": "Large",
        "required_skills": ["java", "python", "microservices", "kafka", "mysql"],
        "culture": ["scale", "ownership", "customer focus"],
        "typical_roles": ["backend engineer", "software engineer", "devops engineer"],
        "difficulty": "hard", "interview_rounds": 4,
    },
    {
        "name": "Razorpay", "type": "Fintech", "size": "Mid",
        "required_skills": ["python", "node.js", "postgresql", "redis", "microservices"],
        "culture": ["fast-paced", "ownership", "transparency"],
        "typical_roles": ["backend engineer", "full stack engineer", "devops engineer"],
        "difficulty": "medium", "interview_rounds": 4,
    },
    {
        "name": "Swiggy", "type": "Food Tech", "size": "Large",
        "required_skills": ["golang", "python", "kafka", "postgresql", "kubernetes"],
        "culture": ["fast delivery", "scale", "innovation"],
        "typical_roles": ["backend engineer", "software engineer", "data scientist"],
        "difficulty": "medium", "interview_rounds": 4,
    },
    {
        "name": "Zepto", "type": "Quick Commerce", "size": "Mid",
        "required_skills": ["node.js", "react", "postgresql", "redis", "aws"],
        "culture": ["startup energy", "speed", "ownership"],
        "typical_roles": ["full stack engineer", "backend engineer", "frontend engineer"],
        "difficulty": "medium", "interview_rounds": 3,
    },
    {
        "name": "Atlassian", "type": "SaaS", "size": "Large",
        "required_skills": ["java", "python", "react", "aws", "system design"],
        "culture": ["open company", "work-life balance", "innovation"],
        "typical_roles": ["software engineer", "full stack engineer", "devops engineer"],
        "difficulty": "hard", "interview_rounds": 4,
    },
    {
        "name": "Postman", "type": "Dev Tools", "size": "Mid",
        "required_skills": ["node.js", "react", "javascript", "rest api", "mongodb"],
        "culture": ["developer first", "remote-friendly", "transparency"],
        "typical_roles": ["full stack engineer", "frontend engineer", "backend engineer"],
        "difficulty": "medium", "interview_rounds": 4,
    },
    {
        "name": "CRED", "type": "Fintech", "size": "Mid",
        "required_skills": ["python", "react", "postgresql", "kafka", "microservices"],
        "culture": ["quality over quantity", "design-first", "trust"],
        "typical_roles": ["software engineer", "backend engineer", "data scientist"],
        "difficulty": "hard", "interview_rounds": 4,
    },
]

TRENDING_SKILLS_2025 = {
    "hottest": ["ai/ml", "llm fine-tuning", "rag", "kubernetes", "rust", "golang"],
    "growing": ["typescript", "fastapi", "next.js", "terraform", "grafana", "vector databases"],
    "stable": ["python", "react", "node.js", "postgresql", "docker", "aws", "git"],
    "declining": ["jquery", "angularjs", "svn", "soap", "monolith"],
}

EXPERIENCE_LEVELS = {
    "fresher": (0, 1),
    "junior": (1, 3),
    "mid": (3, 6),
    "senior": (6, 10),
    "lead": (10, 99),
}
