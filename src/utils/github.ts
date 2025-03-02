import axios from 'axios';

const GITHUB_USERNAME = 'Galang0304';
const GITHUB_API_BASE = 'https://api.github.com';

// Gambar default untuk setiap jenis proyek
const PROJECT_IMAGES = {
  mobile: {
    flutter: "https://images.unsplash.com/photo-1617040619263-41c5a9ca7521?w=600&auto=format&fit=crop&q=60",
    kotlin: "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&auto=format&fit=crop&q=60",
    default: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60"
  },
  web: {
    react: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=60",
    javascript: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&auto=format&fit=crop&q=60",
    php: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=600&auto=format&fit=crop&q=60",
    default: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&auto=format&fit=crop&q=60"
  }
};

interface GithubRepo {
  name: string;
  description: string;
  html_url: string;
  topics: string[];
  language: string;
}

const getProjectImage = (language: string, topics: string[]) => {
  // Cek apakah proyek mobile atau web
  const isMobile = ['Kotlin', 'Java', 'Swift', 'Dart', 'Flutter'].some(
    tech => language?.includes(tech) || topics?.includes(tech.toLowerCase())
  );

  if (isMobile) {
    if (topics?.includes('flutter')) return PROJECT_IMAGES.mobile.flutter;
    if (language === 'Kotlin') return PROJECT_IMAGES.mobile.kotlin;
    return PROJECT_IMAGES.mobile.default;
  }

  // Web project
  if (topics?.includes('react')) return PROJECT_IMAGES.web.react;
  if (language === 'JavaScript') return PROJECT_IMAGES.web.javascript;
  if (language === 'PHP') return PROJECT_IMAGES.web.php;
  return PROJECT_IMAGES.web.default;
};

export const fetchGithubProjects = async () => {
  try {
    console.log('Fetching GitHub projects...');
    const response = await axios.get(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    console.log('GitHub Response:', response.data);
    const repos: GithubRepo[] = response.data;

    const projects = repos.map(repo => {
      // Default type based on common web technologies
      const isWebApp = ['HTML', 'JavaScript', 'PHP', 'TypeScript'].includes(repo.language || '');
      const isMobileApp = ['Kotlin', 'Java', 'Swift', 'Dart'].includes(repo.language || '');
      
      const type = isMobileApp ? 'Mobile App' : (isWebApp ? 'Web App' : 'Other');

      return {
        title: repo.name.split('-').join(' ').replace(/_/g, ' '),
        description: repo.description || 'Project description not available.',
        image: getProjectImage(repo.language, repo.topics),
        tech: [repo.language].filter(Boolean).concat(repo.topics || []),
        type,
        github: repo.html_url
      };
    });

    console.log('Processed projects:', projects);
    return projects;

  } catch (error) {
    console.error('Error details:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error Response:', error.response?.data);
    }
    return [];
  }
}; 