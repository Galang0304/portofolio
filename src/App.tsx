import { motion, useScroll, useTransform } from 'framer-motion';
import styled from '@emotion/styled';
import { useState, useRef, useEffect } from 'react';
import { fetchGithubProjects } from './utils/github';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(125deg, #02001f, #1e0054, #001242);
  color: white;
  overflow-x: hidden;
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(103, 232, 249, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(49, 196, 141, 0.15) 0%, transparent 50%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.1;
    pointer-events: none;
  }
`;

const FloatingShape = styled(motion.div)`
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
`;

const GlassOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(125deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  pointer-events: none;
`;

const Section = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  position: relative;
  z-index: 1;
  scroll-margin-top: 2rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    min-height: auto;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    z-index: -1;
  }
`;

const Hero = styled(Section)`
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Title = styled(motion.h1)`
  font-size: clamp(2rem, 8vw, 4rem);
  margin-bottom: 1rem;
  background: linear-gradient(to right, #60a5fa, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 0 1rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: clamp(1.5rem, 6vw, 2.5rem);
  }
`;

const Subtitle = styled(motion.p)`
  font-size: clamp(1rem, 4vw, 1.5rem);
  margin-bottom: 2rem;
  max-width: 600px;
  color: #e0e0e0;
  padding: 0 1rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const TechStack = styled(motion.div)`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin: 2rem 0;
  padding: 0 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin: 1rem 0;
  }
`;

const TechBadge = styled(motion.span)`
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
  padding: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
`;

const ProjectCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  overflow: hidden;
  position: relative;

  .project-image {
    width: 100%;
    height: 200px;
    background-size: cover;
    background-position: center;
    border-radius: 10px;
    margin-bottom: 1.5rem;
  }

  .tech-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .tech-tag {
    padding: 0.25rem 0.75rem;
    background: rgba(96, 165, 250, 0.2);
    border-radius: 20px;
    font-size: 0.8rem;
  }
`;

const ExperienceTimeline = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem 0;
`;

const TimelineItem = styled(motion.div)`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 30px;
    bottom: -30px;
    width: 2px;
    background: rgba(255, 255, 255, 0.1);
  }

  &:last-child::before {
    display: none;
  }

  .timeline-dot {
    width: 32px;
    height: 32px;
    background: #60a5fa;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .timeline-content {
    flex-grow: 1;
  }
`;

const ContactForm = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
  width: 100%;
  padding: 0 1rem;
  
  input, textarea {
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    width: 100%;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    @media (max-width: 768px) {
      padding: 0.8rem;
    }
  }
`;

const Button = styled(motion.button)`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: linear-gradient(45deg, #60a5fa, #34d399);
  border: none;
  border-radius: 50px;
  color: white;
  cursor: pointer;
  margin: 0.5rem;
  
  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    width: 100%;
    max-width: 300px;
    margin: 0.5rem auto;
  }

  &:hover {
    background: linear-gradient(45deg, #3b82f6, #10b981);
  }
`;

const NameHighlight = styled(motion.span)`
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 800;
  background: linear-gradient(to right, #60a5fa, #34d399, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
  margin-bottom: 1rem;
  letter-spacing: -2px;
`;

const RoleTag = styled(motion.div)`
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  font-size: 1.1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 800px;
  width: 100%;
  margin: 3rem 0;
  padding: 0 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin: 2rem 0;
  }
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .number {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(to right, #60a5fa, #34d399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
  }

  .label {
    color: #e0e0e0;
    font-size: 0.9rem;
  }
`;

const SkillProgress = styled(motion.div)`
  width: 100%;
  max-width: 800px;
  margin: 2rem 0;

  .skill-item {
    margin-bottom: 1.5rem;
  }

  .skill-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background: linear-gradient(to right, #60a5fa, #34d399);
    border-radius: 4px;
  }
`;

const LearningJourney = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 2rem 0;

  .journey-item {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
    border-radius: 20px;
    margin-bottom: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .journey-date {
    color: #60a5fa;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
`;

const AchievementCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  
  .icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #60a5fa;
  }
`;

const TestimonialCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  
  .quote {
    font-size: 1.2rem;
    font-style: italic;
    margin: 1rem 0;
    color: #e0e0e0;
  }
  
  .author {
    font-weight: 600;
    color: #60a5fa;
  }
  
  .role {
    font-size: 0.9rem;
    color: #a0aec0;
  }
`;

const FilterButton = styled(motion.button)`
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  
  &.active {
    background: linear-gradient(45deg, #60a5fa, #34d399);
    border: none;
  }
`;

const BlogCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  
  .blog-image {
    width: 100%;
    height: 200px;
    background-size: cover;
    background-position: center;
  }
  
  .blog-content {
    padding: 1.5rem;
  }
  
  .blog-date {
    color: #60a5fa;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .blog-title {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  .read-more {
    display: inline-flex;
    align-items: center;
    color: #60a5fa;
    gap: 0.5rem;
    margin-top: 1rem;
    font-weight: 500;
  }
`;

const AboutMeSection = styled(Section)`
  text-align: center;
`;

const ProfileImage = styled(motion.div)`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 2rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    padding: 3px;
    background: linear-gradient(45deg, #60a5fa, #34d399);
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Navbar = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 1rem;
  display: none;

  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 99;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
`;

const scrollToProjects = () => {
  const projectsSection = document.querySelector('#projects');
  projectsSection?.scrollIntoView({ behavior: 'smooth' });
};

const scrollToContact = () => {
  const contactSection = document.querySelector('#contact');
  contactSection?.scrollIntoView({ behavior: 'smooth' });
};

function App() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const fallbackProjects = [
    {
      title: "Template Pesan Makanan Mobile",
      description: "Aplikasi mobile untuk pemesanan makanan menggunakan Flutter dan Dart. Implementasi UI modern dan fitur pemesanan yang lengkap.",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=60",
      tech: ["Flutter", "Dart"],
      type: "Mobile App",
      github: "https://github.com/Galang0304/tamplate_pesanmakanan_mobile"
    },
    {
      title: "Login Mobile App",
      description: "Aplikasi Android dengan sistem autentikasi. Menggunakan Kotlin dan implementasi UI yang user-friendly.",
      image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=600&auto=format&fit=crop&q=60",
      tech: ["Kotlin", "Android"],
      type: "Mobile App",
      github: "https://github.com/Galang0304/login_mobile"
    }
  ];

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const githubProjects = await fetchGithubProjects();
        if (githubProjects.length === 0) {
          console.log('No projects found, using fallback data');
          setProjects(fallbackProjects);
        } else {
          setProjects(githubProjects);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        setError('Failed to load projects');
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const techStack = {
    frontend: ["HTML", "CSS", "JavaScript"],
    mobile: ["Kotlin", "Flutter", "Dart"],
    backend: ["PHP", "MySQL"],
    tools: ["Git", "VS Code", "Android Studio"]
  };

  const filteredProjects = projects.filter(project => 
    selectedFilter === 'all' || project.type.toLowerCase() === selectedFilter.toLowerCase()
  );

  const stats = [
    { number: `${projects.length}+`, label: "GitHub Projects" },
    { 
      number: `${projects.filter(p => p.type === 'Mobile App').length}+`, 
      label: "Mobile Apps" 
    },
    { 
      number: `${projects.filter(p => p.type === 'Web App').length}+`, 
      label: "Web Projects" 
    },
    { number: "2+", label: "Years Coding" }
  ];

  const experience = [
    {
      role: "Frontend Developer",
      company: "Freelance",
      period: "2023 - Present",
      description: "Mengembangkan berbagai aplikasi web menggunakan React, Next.js, dan TypeScript."
    },
    {
      role: "Junior Mobile Developer",
      company: "Self-employed",
      period: "2023 - Present",
      description: "Belajar dan mengembangkan aplikasi mobile dengan Flutter dan Kotlin."
    }
  ];

  const skills = [
    { name: "Android Development (Kotlin)", progress: 80 },
    { name: "Flutter & Dart", progress: 70 },
    { name: "Frontend Web Dev", progress: 75 },
    { name: "PHP & MySQL", progress: 70 },
    { name: "Version Control (Git)", progress: 75 }
  ];

  const learningJourney = [
    {
      date: "2024",
      title: "Flutter Development",
      description: "Memulai pengembangan aplikasi mobile dengan Flutter dan Dart. Berhasil membuat aplikasi e-wallet sebagai proyek pertama dengan fitur transfer dan manajemen saldo."
    },
    {
      date: "2023",
      title: "Android Development",
      description: "Belajar pengembangan aplikasi Android native dengan Kotlin. Membuat berbagai aplikasi dasar termasuk sistem login dan aplikasi pembelajaran."
    },
    {
      date: "2022",
      title: "Web Development",
      description: "Mempelajari pengembangan web dengan HTML, CSS, JavaScript, PHP, dan MySQL. Membuat sistem informasi data mahasiswa."
    }
  ];

  const achievements = [
    {
      icon: "💳",
      title: "First Flutter App: E-Wallet",
      description: "Berhasil membuat aplikasi e-wallet dengan Flutter, mengimplementasikan fitur transfer dan manajemen saldo"
    },
    {
      icon: "💻",
      title: "Web Development",
      description: "Menguasai dasar-dasar pengembangan web modern dengan React dan TypeScript"
    },
    {
      icon: "📱",
      title: "Mobile Development Journey",
      description: "Mengembangkan kemampuan mobile development dari Kotlin hingga Flutter"
    }
  ];

  const blogPosts = [
    {
      title: "Membuat E-Wallet dengan Flutter",
      date: "15 Maret 2024",
      image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&auto=format&fit=crop&q=60",
      excerpt: "Pengalaman dan pembelajaran dari pembuatan aplikasi e-wallet pertama saya menggunakan Flutter."
    },
    {
      title: "Best Practices dalam React Development",
      date: "10 Maret 2024",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=60",
      excerpt: "Kumpulan praktik terbaik yang saya terapkan dalam development React."
    },
    {
      title: "Optimasi Performa Aplikasi Web",
      date: "5 Maret 2024",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=60",
      excerpt: "Teknik dan strategi untuk meningkatkan performa aplikasi web."
    }
  ];

  const aboutPhotos = [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    // Simulasi pengiriman form
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form submitted:', formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container ref={ref}>
      <Navbar
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          {isMenuOpen ? '✕' : '☰'}
        </motion.button>
      </Navbar>

      {isMenuOpen && (
        <MobileMenu
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.a
            href="#projects"
            onClick={() => {
              scrollToProjects();
              setIsMenuOpen(false);
            }}
            whileHover={{ scale: 1.1 }}
            style={{ color: 'white', fontSize: '1.2rem' }}
          >
            Proyek
          </motion.a>
          <motion.a
            href="#contact"
            onClick={() => {
              scrollToContact();
              setIsMenuOpen(false);
            }}
            whileHover={{ scale: 1.1 }}
            style={{ color: 'white', fontSize: '1.2rem' }}
          >
            Kontak
          </motion.a>
        </MobileMenu>
      )}

      <FloatingShape
        style={{
          background: 'linear-gradient(45deg, #0091EA, #00B0FF)',
          width: '400px',
          height: '400px',
          top: '10%',
          left: '0%',
          opacity: 0.15,
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <FloatingShape
        style={{
          background: 'linear-gradient(45deg, #00BFA5, #1DE9B6)',
          width: '300px',
          height: '300px',
          top: '60%',
          right: '10%',
          opacity: 0.15,
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <FloatingShape
        style={{
          background: 'linear-gradient(45deg, #304FFE, #536DFE)',
          width: '250px',
          height: '250px',
          bottom: '10%',
          left: '30%',
          opacity: 0.15,
        }}
        animate={{
          x: [0, 70, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <GlassOverlay />
      
      <Hero>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <RoleTag>Frontend & Mobile Developer</RoleTag>
        </motion.div>

        <ProfileImage
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/images/profile.jpg" alt="Andi Arya Galang" />
        </ProfileImage>
        
        <NameHighlight
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Andi Arya Galang
        </NameHighlight>

        <Subtitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Crafting beautiful web experiences & exploring the world of mobile development
        </Subtitle>

        <StatsGrid
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="number">{stat.number}</div>
              <div className="label">{stat.label}</div>
            </StatCard>
          ))}
        </StatsGrid>

        <TechStack
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h3 style={{ 
              color: '#60a5fa', 
              marginBottom: '0.5rem',
              fontSize: '1.2rem',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>Frontend Expertise</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {techStack.frontend.map((tech, index) => (
                <TechBadge
                  key={index}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tech}
                </TechBadge>
              ))}
            </div>
          </motion.div>

          <motion.div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h3 style={{ 
              color: '#34d399', 
              marginBottom: '0.5rem',
              fontSize: '1.2rem',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>Mobile Journey</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {techStack.mobile.map((tech, index) => (
                <TechBadge
                  key={index}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ background: 'rgba(52, 211, 153, 0.1)' }}
                >
                  {tech}
                </TechBadge>
              ))}
            </div>
          </motion.div>

          <motion.div style={{ textAlign: 'center' }}>
            <h3 style={{ 
              color: '#818cf8', 
              marginBottom: '0.5rem',
              fontSize: '1.2rem',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>Tools & Skills</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {techStack.tools.map((tech, index) => (
                <TechBadge
                  key={index}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ background: 'rgba(129, 140, 248, 0.1)' }}
                >
                  {tech}
                </TechBadge>
              ))}
            </div>
          </motion.div>
        </TechStack>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{ marginTop: '2rem' }}
        >
          <Button 
            onClick={scrollToProjects}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(96, 165, 250, 0.5)' }} 
            whileTap={{ scale: 0.95 }}
          >
            Lihat Proyek
          </Button>
          <Button 
            onClick={scrollToContact}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)' }} 
            whileTap={{ scale: 0.95 }}
            style={{ 
              background: 'transparent', 
              border: '2px solid white',
              backdropFilter: 'blur(10px)'
            }}
          >
            Hubungi Saya
          </Button>
        </motion.div>
      </Hero>

      <AboutMeSection>
        <Title style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
          Tentang Saya
        </Title>
        <Subtitle style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
          Seorang mahasiswa Teknik Informatika semester 6 di Universitas Muhammadiyah Makassar yang passionate 
          dalam pengembangan aplikasi mobile dan web. Aktif mengembangkan diri melalui proyek-proyek teknologi 
          dan organisasi IT.
        </Subtitle>

        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ 
            color: '#60a5fa', 
            marginBottom: '1rem',
            fontSize: '1.2rem',
            letterSpacing: '1px'
          }}>Pendidikan & Organisasi</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Universitas Muhammadiyah Makassar</h4>
            <p style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
              Teknik Informatika • Semester 6 • 2021 - Sekarang
        </p>
      </div>

          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>COCONUT Research Group</h4>
            <p style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
              Anggota aktif di Computer Club Oriented Network, Utility & Technology, 
              sebuah kelompok riset yang berfokus pada pengembangan teknologi dan 
              inovasi di bidang IT.
            </p>
          </div>
        </div>
      </AboutMeSection>

      <Section id="projects">
        <Title style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
          Project Terbaru
        </Title>
        
        <motion.div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '3rem'
          }}
        >
          {['All', 'Web App', 'Mobile App'].map((filter) => (
            <FilterButton
              key={filter}
              className={selectedFilter === filter.toLowerCase() ? 'active' : ''}
              onClick={() => setSelectedFilter(filter.toLowerCase())}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter}
            </FilterButton>
          ))}
        </motion.div>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(96, 165, 250, 0.2)',
                borderTop: '3px solid #60a5fa',
                borderRadius: '50%',
                margin: '0 auto 1rem'
              }}
            />
            Loading projects...
          </div>
        ) : error ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: '#ef4444',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            {error}
          </div>
        ) : (
          <ProjectGrid>
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.github}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div 
                  className="project-image"
                  style={{ backgroundImage: `url(${project.image})` }}
                />
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tech-tags">
                  {project.tech.filter(Boolean).map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))}
                </div>
                <motion.a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '1rem',
                    color: '#60a5fa',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                  whileHover={{ x: 5 }}
                >
                  Lihat di GitHub →
                </motion.a>
              </ProjectCard>
            ))}
          </ProjectGrid>
        )}
      </Section>

      <Section style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
        <Title style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>
          Pengalaman
        </Title>
        <ExperienceTimeline>
          {experience.map((exp, index) => (
            <TimelineItem
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="timeline-dot"
                whileHover={{ scale: 1.2 }}
              />
              <div className="timeline-content">
                <h3>{exp.role}</h3>
                <h4>{exp.company} • {exp.period}</h4>
                <p>{exp.description}</p>
              </div>
            </TimelineItem>
          ))}
        </ExperienceTimeline>
      </Section>

      <Section id="contact">
        <Title style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>
          Hubungi Saya
        </Title>
        <ContactForm
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="name"
            placeholder="Nama Lengkap"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="message"
            placeholder="Pesan"
            rows={5}
            value={formData.message}
            onChange={handleInputChange}
            required
          ></textarea>
          <Button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
          </Button>
          {submitStatus === 'success' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: '#34d399', marginTop: '1rem' }}
            >
              Pesan berhasil terkirim! Terima kasih telah menghubungi saya.
            </motion.p>
          )}
          {submitStatus === 'error' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: '#ef4444', marginTop: '1rem' }}
            >
              Gagal mengirim pesan. Silakan coba lagi.
            </motion.p>
          )}
        </ContactForm>
      </Section>

      <Section>
        <Title style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>
          Skills Progress
        </Title>
        <SkillProgress>
          {skills.map((skill, index) => (
            <motion.div
              className="skill-item"
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="skill-header">
                <span>{skill.name}</span>
                <span>{skill.progress}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  viewport={{ once: true }}
                />
              </div>
            </motion.div>
          ))}
        </SkillProgress>
      </Section>

      <Section style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
        <Title style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>
          Learning Journey
        </Title>
        <LearningJourney>
          {learningJourney.map((item, index) => (
            <motion.div
              className="journey-item"
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="journey-date">{item.date}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </motion.div>
          ))}
        </LearningJourney>
      </Section>

      <Section>
        <Title style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>
          Achievements
        </Title>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          width: '100%',
          maxWidth: '1200px'
        }}>
          {achievements.map((achievement, index) => (
            <AchievementCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="icon">{achievement.icon}</div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
            </AchievementCard>
          ))}
        </div>
      </Section>

      <Section>
        <Title style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>
          Blog & Artikel
        </Title>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          width: '100%',
          maxWidth: '1200px'
        }}>
          {blogPosts.map((post, index) => (
            <BlogCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div 
                className="blog-image"
                style={{ backgroundImage: `url(${post.image})` }}
              />
              <div className="blog-content">
                <div className="blog-date">{post.date}</div>
                <h3 className="blog-title">{post.title}</h3>
                <p>{post.excerpt}</p>
                <motion.a
                  href="#"
                  className="read-more"
                  whileHover={{ x: 5 }}
                >
                  Baca Selengkapnya →
                </motion.a>
              </div>
            </BlogCard>
          ))}
        </div>
      </Section>

      <Section style={{ 
        minHeight: 'auto', 
        paddingTop: '2rem',
        paddingBottom: '2rem',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        <motion.div
          style={{ 
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            maxWidth: '800px'
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {['GitHub', 'LinkedIn', 'Twitter', 'Instagram'].map((social, index) => (
            <motion.a
              key={social}
              href="#"
              style={{
                color: '#e0e0e0',
                textDecoration: 'none',
                fontSize: '1rem',
                position: 'relative',
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              whileHover={{ 
                scale: 1.05, 
                color: '#60a5fa',
                background: 'rgba(255, 255, 255, 0.1)' 
              }}
            >
              {social}
            </motion.a>
          ))}
        </motion.div>
      </Section>
    </Container>
  );
}

export default App;
