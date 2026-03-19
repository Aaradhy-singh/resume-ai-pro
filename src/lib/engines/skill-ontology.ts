/**
 * Skill Ontology Database
 * 
 * Canonical skill taxonomy with normalization support for synonyms,
 * abbreviations, version variants, and category classification.
 */

export type SkillCategory =
  | 'language'
  | 'framework'
  | 'concept'
  | 'tool'
  | 'cloud'
  | 'database'
  | 'soft'
  | 'library' // keeping legacy categories for safety if needed
  | 'programming-language';

export interface SkillDefinition {
  canonical: string;
  variants: string[];
  category: string;
  basePriority: number;
}

export const SKILL_ONTOLOGY: SkillDefinition[] = [
  // ── LANGUAGES ──
  { canonical: 'JavaScript', variants: ['js', 'es6', 'es2015', 'ecmascript', 'vanilla js'], category: 'language', basePriority: 5 },
  { canonical: 'TypeScript', variants: ['ts', 'tsx'], category: 'language', basePriority: 5 },
  { canonical: 'Python', variants: ['py', 'python3', 'python2'], category: 'language', basePriority: 5 },
  { canonical: 'Java', variants: ['java8', 'java11', 'java17', 'jvm'], category: 'language', basePriority: 5 },
  { canonical: 'C++', variants: ['cpp', 'c plus plus', 'cplusplus'], category: 'language', basePriority: 4 },
  { canonical: 'C#', variants: ['csharp', 'c sharp', 'dotnet', '.net'], category: 'language', basePriority: 4 },
  { canonical: 'C', variants: ['c programming', 'c language'], category: 'language', basePriority: 3 },
  { canonical: 'Go', variants: ['golang'], category: 'language', basePriority: 4 },
  { canonical: 'Rust', variants: ['rust lang', 'rustlang'], category: 'language', basePriority: 4 },
  { canonical: 'Swift', variants: ['swift ui', 'swiftui'], category: 'language', basePriority: 4 },
  { canonical: 'Kotlin', variants: ['kotlin android'], category: 'language', basePriority: 4 },
  { canonical: 'Ruby', variants: ['ruby on rails', 'rails', 'ror'], category: 'language', basePriority: 3 },
  { canonical: 'PHP', variants: ['php7', 'php8', 'laravel', 'symfony'], category: 'language', basePriority: 3 },
  { canonical: 'Scala', variants: ['scala lang', 'akka'], category: 'language', basePriority: 3 },
  { canonical: 'R', variants: ['r programming', 'r language', 'rstudio'], category: 'language', basePriority: 3 },
  { canonical: 'MATLAB', variants: ['matlab simulink'], category: 'language', basePriority: 2 },
  { canonical: 'Dart', variants: ['dart lang'], category: 'language', basePriority: 3 },
  { canonical: 'Bash', variants: ['shell', 'shell scripting', 'bash scripting', 'zsh'], category: 'language', basePriority: 3 },
  { canonical: 'PowerShell', variants: ['powershell scripting'], category: 'language', basePriority: 2 },
  { canonical: 'Solidity', variants: ['solidity smart contracts'], category: 'language', basePriority: 3 },
  { canonical: 'Assembly', variants: ['asm', 'assembly language', 'x86'], category: 'language', basePriority: 2 },
  { canonical: 'Haskell', variants: ['haskell lang'], category: 'language', basePriority: 2 },
  { canonical: 'Elixir', variants: ['elixir phoenix', 'phoenix framework'], category: 'language', basePriority: 2 },

  // ── FRONTEND FRAMEWORKS ──
  { canonical: 'React', variants: ['reactjs', 'react.js', 'react native', 'react hooks'], category: 'framework', basePriority: 5 },
  { canonical: 'Vue.js', variants: ['vuejs', 'vue', 'vue3', 'nuxt', 'nuxtjs'], category: 'framework', basePriority: 4 },
  { canonical: 'Angular', variants: ['angularjs', 'angular2', 'angular cli'], category: 'framework', basePriority: 4 },
  { canonical: 'Next.js', variants: ['nextjs', 'next js'], category: 'framework', basePriority: 5 },
  { canonical: 'Svelte', variants: ['sveltekit', 'svelte kit'], category: 'framework', basePriority: 3 },
  { canonical: 'Flutter', variants: ['flutter dart', 'flutter mobile'], category: 'framework', basePriority: 4 },
  { canonical: 'Tailwind CSS', variants: ['tailwind', 'tailwindcss'], category: 'framework', basePriority: 4 },
  { canonical: 'HTML', variants: ['html5', 'hypertext markup language'], category: 'framework', basePriority: 3 },
  { canonical: 'CSS', variants: ['css3', 'sass', 'scss', 'less', 'styled components'], category: 'framework', basePriority: 3 },

  // ── BACKEND FRAMEWORKS ──
  { canonical: 'Node.js', variants: ['node', 'nodejs', 'express', 'expressjs'], category: 'framework', basePriority: 5 },
  { canonical: 'Django', variants: ['django rest framework', 'drf'], category: 'framework', basePriority: 4 },
  { canonical: 'FastAPI', variants: ['fast api'], category: 'framework', basePriority: 4 },
  { canonical: 'Flask', variants: ['flask python'], category: 'framework', basePriority: 3 },
  { canonical: 'Spring Boot', variants: ['spring', 'spring framework', 'spring mvc', 'spring cloud'], category: 'framework', basePriority: 4 },
  { canonical: 'ASP.NET', variants: ['asp.net core', 'asp net', 'dotnet core'], category: 'framework', basePriority: 4 },
  { canonical: 'GraphQL', variants: ['graphql api', 'apollo graphql', 'apollo server'], category: 'framework', basePriority: 4 },
  { canonical: 'REST API', variants: ['restful api', 'rest', 'restful', 'api development', 'http api', 'rest apis', 'api integration', 'api integrations', 'apis'], category: 'framework', basePriority: 4 },
  { canonical: 'gRPC', variants: ['grpc', 'protocol buffers', 'protobuf'], category: 'framework', basePriority: 3 },

  // ── ML / AI ──
  { canonical: 'TensorFlow', variants: ['tensorflow2', 'tf', 'keras'], category: 'framework', basePriority: 5 },
  { canonical: 'PyTorch', variants: ['pytorch lightning', 'torch'], category: 'framework', basePriority: 5 },
  { canonical: 'Scikit-learn', variants: ['sklearn', 'scikit learn'], category: 'framework', basePriority: 4 },
  { canonical: 'Pandas', variants: ['pandas dataframe'], category: 'framework', basePriority: 4 },
  { canonical: 'NumPy', variants: ['numpy array'], category: 'framework', basePriority: 4 },
  { canonical: 'Hugging Face', variants: ['huggingface', 'transformers library', 'hugging face transformers'], category: 'framework', basePriority: 4 },
  { canonical: 'LangChain', variants: ['langchain', 'lang chain'], category: 'framework', basePriority: 4 },
  { canonical: 'OpenAI API', variants: ['openai', 'gpt api', 'chatgpt api'], category: 'framework', basePriority: 4 },
  { canonical: 'Prompt Engineering', variants: ['prompt design', 'prompt development', 'prompting llm'], category: 'concept', basePriority: 4 },
  { canonical: 'RAG', variants: ['retrieval augmented generation', 'retrieval-augmented generation', 'rag pipeline', 'vector search', 'semantic search', 'embeddings search'], category: 'concept', basePriority: 4 },
  { canonical: 'LLMs', variants: ['large language model', 'large language models', 'llm', 'llms', 'local llm', 'local llm deployment', 'llm deployment', 'language model', 'foundation model', 'generative model'], category: 'concept', basePriority: 5 },
  { canonical: 'MLflow', variants: ['ml flow', 'mlflow tracking'], category: 'tool', basePriority: 3 },
  { canonical: 'Weights & Biases', variants: ['wandb', 'weights and biases'], category: 'tool', basePriority: 3 },
  { canonical: 'CUDA', variants: ['cuda programming', 'gpu programming', 'nvidia cuda'], category: 'tool', basePriority: 3 },
  { canonical: 'Computer Vision', variants: ['cv', 'image recognition', 'object detection', 'opencv'], category: 'concept', basePriority: 4 },
  { canonical: 'NLP', variants: ['natural language processing', 'text classification', 'named entity recognition', 'ner'], category: 'concept', basePriority: 4 },
  { canonical: 'Deep Learning', variants: ['neural networks', 'cnn', 'rnn', 'lstm', 'transformer model'], category: 'concept', basePriority: 4 },

  // ── CLOUD ──
  { canonical: 'AWS', variants: ['amazon web services', 'ec2', 's3', 'lambda', 'aws cloud', 'cloudformation', 'ecs', 'eks', 'rds', 'dynamodb', 'sqs', 'sns'], category: 'cloud', basePriority: 5 },
  { canonical: 'GCP', variants: ['google cloud', 'google cloud platform', 'bigquery', 'vertex ai', 'cloud run', 'gke', 'firebase'], category: 'cloud', basePriority: 4 },
  { canonical: 'Azure', variants: ['microsoft azure', 'azure devops', 'azure functions', 'aks', 'azure ml'], category: 'cloud', basePriority: 4 },
  { canonical: 'Terraform', variants: ['terraform iac', 'infrastructure as code', 'hashicorp terraform'], category: 'tool', basePriority: 4 },
  { canonical: 'Pulumi', variants: ['pulumi iac'], category: 'tool', basePriority: 2 },
  { canonical: 'Serverless', variants: ['serverless framework', 'faas', 'function as a service'], category: 'concept', basePriority: 3 },

  // ── DEVOPS / INFRA ──
  { canonical: 'Docker', variants: ['containers', 'dockerfile', 'docker compose', 'containerization', 'dockerized'], category: 'tool', basePriority: 5 },
  { canonical: 'Kubernetes', variants: ['k8s', 'container orchestration', 'kubectl', 'helm', 'eks', 'aks', 'gke'], category: 'tool', basePriority: 5 },
  { canonical: 'CI/CD', variants: ['continuous integration', 'continuous deployment', 'github actions', 'jenkins', 'circleci', 'gitlab ci', 'travis ci', 'pipeline automation'], category: 'tool', basePriority: 4 },
  { canonical: 'Linux', variants: ['ubuntu', 'centos', 'debian', 'unix', 'linux administration'], category: 'tool', basePriority: 4 },
  { canonical: 'Nginx', variants: ['nginx server', 'nginx proxy'], category: 'tool', basePriority: 3 },
  { canonical: 'Ansible', variants: ['ansible playbook', 'ansible automation'], category: 'tool', basePriority: 3 },
  { canonical: 'Prometheus', variants: ['prometheus monitoring'], category: 'tool', basePriority: 3 },
  { canonical: 'Grafana', variants: ['grafana dashboard'], category: 'tool', basePriority: 3 },
  { canonical: 'ELK Stack', variants: ['elasticsearch', 'logstash', 'kibana', 'elastic stack'], category: 'tool', basePriority: 3 },

  // ── DATABASES ──
  { canonical: 'SQL', variants: ['postgresql', 'mysql', 'queries', 'relational database', 'database queries', 'sql server', 'oracle db', 'sqlite'], category: 'database', basePriority: 5 },
  { canonical: 'MongoDB', variants: ['mongo', 'mongodb atlas', 'nosql mongodb'], category: 'database', basePriority: 4 },
  { canonical: 'Redis', variants: ['redis cache', 'redis cluster'], category: 'database', basePriority: 4 },
  { canonical: 'PostgreSQL', variants: ['postgres', 'pg', 'psql'], category: 'database', basePriority: 4 },
  { canonical: 'MySQL', variants: ['mysql db'], category: 'database', basePriority: 4 },
  { canonical: 'Cassandra', variants: ['apache cassandra', 'cassandra db'], category: 'database', basePriority: 3 },
  { canonical: 'DynamoDB', variants: ['aws dynamodb', 'dynamo db'], category: 'database', basePriority: 3 },
  { canonical: 'Elasticsearch', variants: ['elastic search', 'opensearch'], category: 'database', basePriority: 3 },
  { canonical: 'Firebase', variants: ['firebase realtime', 'firestore', 'firebase db'], category: 'database', basePriority: 3 },
  { canonical: 'Neo4j', variants: ['neo4j graph', 'graph database'], category: 'database', basePriority: 2 },
  { canonical: 'Snowflake', variants: ['snowflake cloud', 'snowflake data warehouse'], category: 'database', basePriority: 3 },

  // ── DATA & ANALYTICS ──
  { canonical: 'Apache Spark', variants: ['pyspark', 'spark streaming', 'databricks'], category: 'tool', basePriority: 4 },
  { canonical: 'Apache Kafka', variants: ['kafka streaming', 'kafka broker'], category: 'tool', basePriority: 4 },
  { canonical: 'Airflow', variants: ['apache airflow', 'airflow dag'], category: 'tool', basePriority: 3 },
  { canonical: 'dbt', variants: ['data build tool', 'dbt cloud'], category: 'tool', basePriority: 3 },
  { canonical: 'Tableau', variants: ['tableau desktop', 'tableau server'], category: 'tool', basePriority: 3 },
  { canonical: 'Power BI', variants: ['powerbi', 'microsoft power bi'], category: 'tool', basePriority: 3 },
  { canonical: 'Looker', variants: ['looker studio', 'google looker'], category: 'tool', basePriority: 3 },
  { canonical: 'Excel', variants: ['microsoft excel', 'advanced excel', 'google sheets'], category: 'tool', basePriority: 3 },

  // ── VERSION CONTROL & COLLABORATION ──
  { canonical: 'Git', variants: ['github', 'gitlab', 'bitbucket', 'version control', 'git flow'], category: 'tool', basePriority: 5 },
  { canonical: 'Jira', variants: ['atlassian jira', 'jira software'], category: 'tool', basePriority: 3 },
  { canonical: 'Confluence', variants: ['atlassian confluence'], category: 'tool', basePriority: 2 },

  // ── SECURITY ──
  { canonical: 'Cybersecurity', variants: ['information security', 'infosec', 'security engineering'], category: 'concept', basePriority: 4 },
  { canonical: 'Penetration Testing', variants: ['pentesting', 'pen testing', 'ethical hacking', 'offensive security'], category: 'concept', basePriority: 4 },
  { canonical: 'OWASP', variants: ['owasp top 10', 'web security'], category: 'concept', basePriority: 3 },
  { canonical: 'Zero Trust', variants: ['zero trust architecture', 'zero trust security'], category: 'concept', basePriority: 3 },
  { canonical: 'IAM', variants: ['identity access management', 'oauth', 'sso', 'jwt', 'saml'], category: 'concept', basePriority: 3 },

  // ── MOBILE ──
  { canonical: 'React Native', variants: ['react-native', 'react native mobile'], category: 'framework', basePriority: 4 },
  { canonical: 'iOS Development', variants: ['xcode', 'uikit', 'swiftui', 'ios app development'], category: 'concept', basePriority: 4 },
  { canonical: 'Android Development', variants: ['android studio', 'android sdk', 'jetpack compose'], category: 'concept', basePriority: 4 },

  // ── DESIGN & UX ──
  { canonical: 'Figma', variants: ['figma design', 'figma prototyping'], category: 'tool', basePriority: 4 },
  { canonical: 'UI/UX Design', variants: ['user interface design', 'user experience design', 'ux research', 'wireframing', 'prototyping'], category: 'concept', basePriority: 4 },

  // ── SOFT SKILLS & CONCEPTS ──
  { canonical: 'System Design', variants: ['distributed systems', 'system architecture', 'high level design', 'low level design', 'hld', 'lld'], category: 'concept', basePriority: 5 },
  { canonical: 'Microservices', variants: ['microservice architecture', 'service mesh', 'event-driven architecture'], category: 'concept', basePriority: 4 },
  { canonical: 'Agile', variants: ['scrum', 'kanban', 'sprint planning', 'agile methodology'], category: 'concept', basePriority: 3 },
  { canonical: 'Machine Learning', variants: ['ml', 'supervised learning', 'unsupervised learning', 'reinforcement learning', 'ml pipeline'], category: 'concept', basePriority: 5 },
  { canonical: 'Data Structures', variants: ['algorithms', 'dsa', 'data structures and algorithms', 'leetcode', 'competitive programming'], category: 'concept', basePriority: 4 },
  { canonical: 'Object Oriented Programming', variants: ['oop', 'object oriented', 'design patterns', 'solid principles'], category: 'concept', basePriority: 4 },
  { canonical: 'Functional Programming', variants: ['fp', 'functional design'], category: 'concept', basePriority: 3 },
  { canonical: 'Technical Writing', variants: ['documentation', 'api documentation', 'technical documentation'], category: 'soft', basePriority: 2 },
  { canonical: 'Leadership', variants: ['team lead', 'engineering lead', 'tech lead', 'mentoring', 'mentorship'], category: 'soft', basePriority: 3 },
  { canonical: 'Communication', variants: ['stakeholder communication', 'cross-functional collaboration'], category: 'soft', basePriority: 2 },

  // ── BLOCKCHAIN ──
  { canonical: 'Web3', variants: ['web 3', 'decentralized apps', 'dapps', 'ethers.js', 'web3.js'], category: 'concept', basePriority: 3 },
  { canonical: 'Smart Contracts', variants: ['solidity contracts', 'evm', 'ethereum', 'hardhat', 'truffle'], category: 'concept', basePriority: 3 },
];

/**
 * Helper function to get all variant-to-canonical mappings
 */
export function buildVariantMap(): Map<string, string> {
  const map = new Map<string, string>();

  SKILL_ONTOLOGY.forEach((entry) => {
    // Map canonical to itself
    map.set(entry.canonical.toLowerCase(), entry.canonical);

    // Map all variants to canonical
    entry.variants.forEach((variant) => {
      map.set(variant.toLowerCase(), entry.canonical);
    });
  });

  return map;
}

/**
 * Helper function to get category for a canonical skill
 */
export function getSkillCategory(canonicalSkill: string): SkillCategory | undefined {
  const entry = SKILL_ONTOLOGY.find((s) => s.canonical === canonicalSkill);
  return entry?.category as SkillCategory;
}

/**
 * Helper function to get subcategory for a canonical skill
 * (Subcategory is no longer present in the new structure, returning undefined for compatibility)
 */
export function getSkillSubcategory(canonicalSkill: string): string | undefined {
  // const entry = SKILL_ONTOLOGY.find((s) => s.canonical === canonicalSkill);
  // return entry?.subcategory;
  return undefined;
}
