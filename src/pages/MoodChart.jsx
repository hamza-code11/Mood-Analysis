import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
  Filler,
} from "chart.js";
import { Link } from "react-router-dom";
import { 
  FiBarChart2, 
  FiPieChart, 
  FiTrendingUp, 
  FiHome,
  FiCalendar,
  FiSmile,
  FiFrown,
  FiMeh,
  FiZap,
  FiAward,
  FiClock,
  FiArrowLeft,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiSun,
  FiMoon,
  FiGrid,
  FiLayers
} from "react-icons/fi";
import { 
  RiEmotionHappyLine,
  RiEmotionNormalLine,
  RiEmotionUnhappyLine,
  RiEmotionSadLine,
  RiMentalHealthLine
} from "react-icons/ri";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
  Filler
);

export default function MoodChart() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activeChart, setActiveChart] = useState("all");
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('grouped'); // 'grouped' or 'stacked'

  // Apply dark mode to body
  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  const moodConfig = {
    happy: { 
      color: "#10B981", 
      icon: <RiEmotionHappyLine />,
      bgColor: "#10B98120",
      gradient: ["#10B981", "#34D399", "#6EE7B7"],
      value: 4
    },
    neutral: { 
      color: "#6B7280", 
      icon: <RiEmotionNormalLine />,
      bgColor: "#6B728020",
      gradient: ["#6B7280", "#9CA3AF", "#D1D5DB"],
      value: 3
    },
    sad: { 
      color: "#3B82F6", 
      icon: <RiEmotionSadLine />,
      bgColor: "#3B82F620",
      gradient: ["#3B82F6", "#60A5FA", "#93C5FD"],
      value: 2
    },
    angry: { 
      color: "#EF4444", 
      icon: <RiEmotionUnhappyLine />,
      bgColor: "#EF444420",
      gradient: ["#EF4444", "#F87171", "#FCA5A5"],
      value: 1
    },
    stressed: { 
      color: "#F59E0B", 
      icon: <RiMentalHealthLine />,
      bgColor: "#F59E0B20",
      gradient: ["#F59E0B", "#FBBF24", "#FCD34D"],
      value: 0
    },
  };

  useEffect(() => {
    const loadMoods = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(collection(db, "journalEntries"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        // Sort by date (newest first)
        data.sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });
        
        setEntries(data);
      } catch (error) {
        console.error("Error loading moods:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMoods();
  }, [user]);

  // Filter entries based on active chart
  const filteredEntries = activeChart === "all" 
    ? entries 
    : entries.filter(entry => entry.mood === activeChart);

  // Prepare mood counts
  const moodCounts = {};
  entries.forEach((e) => {
    const mood = e.mood || "neutral";
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  // Weekly trend data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
  };

  // Weekly mood frequency data
  const getWeeklyMoodFrequencyData = () => {
    const last7Days = getLast7Days();
    const weeklyMoodData = {};
    
    // Initialize with all moods for each day
    last7Days.forEach(day => {
      weeklyMoodData[day] = {};
      Object.keys(moodConfig).forEach(mood => {
        weeklyMoodData[day][mood] = 0;
      });
    });

    // Count moods for each day
    entries.forEach(entry => {
      if (entry.createdAt?.toDate) {
        const entryDate = entry.createdAt.toDate();
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        // Check if entry is from last 7 days
        if (entryDate >= sevenDaysAgo) {
          const dayName = entryDate.toLocaleDateString('en-US', { weekday: 'short' });
          const mood = entry.mood || 'neutral';
          
          if (weeklyMoodData[dayName] && weeklyMoodData[dayName][mood] !== undefined) {
            weeklyMoodData[dayName][mood]++;
          }
        }
      }
    });

    return weeklyMoodData;
  };

  // Prepare data for bar chart (grouped bars)
  const getWeeklyBarChartData = () => {
    const weeklyData = getWeeklyMoodFrequencyData();
    const days = getLast7Days();
    const moods = Object.keys(moodConfig);

    return {
      labels: days,
      datasets: moods.map((mood, index) => ({
        label: mood.charAt(0).toUpperCase() + mood.slice(1),
        data: days.map(day => weeklyData[day]?.[mood] || 0),
        backgroundColor: moodConfig[mood]?.color,
        borderColor: darkMode ? '#1A1B2E' : '#FFFFFF',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        categoryPercentage: 0.8,
        barPercentage: 0.7,
      }))
    };
  };

  // Stacked bar chart data (alternative view)
  const getWeeklyStackedBarData = () => {
    const weeklyData = getWeeklyMoodFrequencyData();
    const days = getLast7Days();
    const moods = Object.keys(moodConfig);

    return {
      labels: days,
      datasets: moods.map((mood, index) => ({
        label: mood.charAt(0).toUpperCase() + mood.slice(1),
        data: days.map(day => weeklyData[day]?.[mood] || 0),
        backgroundColor: moodConfig[mood]?.color,
        borderColor: darkMode ? '#1A1B2E' : '#FFFFFF',
        borderWidth: 1,
        borderRadius: 4,
      }))
    };
  };

  const getWeeklyMoodData = () => {
    const last7Days = getLast7Days();
    const weeklyData = {};
    
    last7Days.forEach(day => {
      weeklyData[day] = { count: 0, average: 0, moods: [] };
    });

    entries.forEach(entry => {
      if (entry.createdAt?.toDate) {
        const entryDate = entry.createdAt.toDate();
        const dayName = entryDate.toLocaleDateString('en-US', { weekday: 'short' });
        const moodValue = moodConfig[entry.mood]?.value || 2;
        
        if (weeklyData[dayName]) {
          weeklyData[dayName].moods.push(moodValue);
          weeklyData[dayName].count++;
          weeklyData[dayName].average = weeklyData[dayName].moods.reduce((a, b) => a + b, 0) / weeklyData[dayName].moods.length;
        }
      }
    });

    return weeklyData;
  };

  const weeklyData = getWeeklyMoodData();

  // Weekly bar chart options
  const weeklyBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'bottom',
        labels: {
          color: darkMode ? '#F1F5F9' : '#1E293B',
          font: { size: 11, weight: '600' },
          padding: 15,
          usePointStyle: true,
          boxWidth: 8,
        }
      },
      tooltip: { 
        backgroundColor: darkMode ? '#1A1B2E' : '#FFFFFF',
        titleColor: darkMode ? '#F1F5F9' : '#1E293B',
        bodyColor: darkMode ? '#F1F5F9' : '#1E293B',
        borderColor: darkMode ? '#2D3748' : '#E2E8F0',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} ${value === 1 ? 'entry' : 'entries'}`;
          }
        }
      },
      title: {
        display: true,
        text: 'Mood Distribution by Day',
        color: darkMode ? '#F1F5F9' : '#1E293B',
        font: { size: 14, weight: '600' }
      }
    },
    scales: {
      x: {
        grid: { 
          color: darkMode ? '#2D3748' : '#E2E8F0',
          drawBorder: false
        },
        ticks: { 
          color: darkMode ? '#94A3B8' : '#64748B',
          font: { size: 11, weight: '500' }
        },
        title: {
          display: true,
          text: 'Days of Week',
          color: darkMode ? '#94A3B8' : '#64748B',
          font: { size: 12, weight: '600' }
        }
      },
      y: {
        grid: { 
          color: darkMode ? '#2D3748' : '#E2E8F0',
          drawBorder: false
        },
        ticks: { 
          color: darkMode ? '#94A3B8' : '#64748B',
          font: { size: 11, weight: '500' },
          precision: 0
        },
        title: {
          display: true,
          text: 'Number of Entries',
          color: darkMode ? '#94A3B8' : '#64748B',
          font: { size: 12, weight: '600' }
        },
        beginAtZero: true
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  // Stacked bar chart options
  const stackedBarOptions = {
    ...weeklyBarOptions,
    scales: {
      ...weeklyBarOptions.scales,
      x: {
        ...weeklyBarOptions.scales.x,
        stacked: true
      },
      y: {
        ...weeklyBarOptions.scales.y,
        stacked: true
      }
    }
  };

  // Advanced Chart Data for other charts
  const lineData = {
    labels: getLast7Days(),
    datasets: [
      {
        label: "Mood Trend (Weekly)",
        data: getLast7Days().map(day => weeklyData[day]?.average || 0),
        borderColor: darkMode ? "#8B5FBF" : "#3B82F6",
        backgroundColor: darkMode 
          ? "rgba(139, 95, 191, 0.1)" 
          : "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: darkMode ? "#8B5FBF" : "#3B82F6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const pieData = {
    labels: Object.keys(moodCounts).map(mood => 
      `${mood.charAt(0).toUpperCase() + mood.slice(1)} (${moodCounts[mood]})`
    ),
    datasets: [
      {
        data: Object.values(moodCounts),
        backgroundColor: Object.keys(moodCounts).map(
          (m) => moodConfig[m]?.color || "#ccc"
        ),
        borderColor: darkMode ? '#1A1B2E' : '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 15,
      },
    ],
  };

  const doughnutData = {
    labels: Object.keys(moodCounts).map(mood => 
      `${mood.charAt(0).toUpperCase() + mood.slice(1)}`
    ),
    datasets: [
      {
        data: Object.values(moodCounts),
        backgroundColor: Object.keys(moodCounts).map(mood => 
          `linear-gradient(135deg, ${moodConfig[mood]?.gradient[0]}, ${moodConfig[mood]?.gradient[1]})`
        ),
        borderColor: darkMode ? '#1A1B2E' : '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 20,
        borderRadius: 10,
        spacing: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'bottom',
        labels: {
          color: darkMode ? '#F1F5F9' : '#1E293B',
          font: { size: 12, weight: '600' },
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: { 
        backgroundColor: darkMode ? '#1A1B2E' : '#FFFFFF',
        titleColor: darkMode ? '#F1F5F9' : '#1E293B',
        bodyColor: darkMode ? '#F1F5F9' : '#1E293B',
        borderColor: darkMode ? '#2D3748' : '#E2E8F0',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label || ''}: ${context.parsed.y || context.parsed}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: { color: darkMode ? '#2D3748' : '#E2E8F0' },
        ticks: { color: darkMode ? '#94A3B8' : '#64748B' }
      },
      y: {
        grid: { color: darkMode ? '#2D3748' : '#E2E8F0' },
        ticks: { color: darkMode ? '#94A3B8' : '#64748B' }
      },
    },
  };

  // Helper functions for weekly stats
  const getWeeklyEntriesCount = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    return entries.filter(entry => {
      if (!entry.createdAt?.toDate) return false;
      const entryDate = entry.createdAt.toDate();
      return entryDate >= sevenDaysAgo;
    }).length;
  };

  const getMostFrequentMoodThisWeek = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const weeklyMoods = entries
      .filter(entry => {
        if (!entry.createdAt?.toDate) return false;
        const entryDate = entry.createdAt.toDate();
        return entryDate >= sevenDaysAgo;
      })
      .map(entry => entry.mood || 'neutral');
    
    const moodCounts = weeklyMoods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, 'neutral'
    );
  };

  const getMostFrequentMoodColor = () => {
    const dominantMood = getMostFrequentMoodThisWeek();
    return moodConfig[dominantMood]?.color || '#6B7280';
  };

  const getAverageMoodThisWeek = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const weeklyEntries = entries.filter(entry => {
      if (!entry.createdAt?.toDate) return false;
      const entryDate = entry.createdAt.toDate();
      return entryDate >= sevenDaysAgo;
    });
    
    if (weeklyEntries.length === 0) return 0;
    
    const totalScore = weeklyEntries.reduce((sum, entry) => {
      return sum + (moodConfig[entry.mood]?.value || 2);
    }, 0);
    
    return (totalScore / weeklyEntries.length).toFixed(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <div className={`premium-dashboard ${darkMode ? "dark-mode" : "light-mode"}`}>
        <div className="loading-container">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FiRefreshCw size={40} />
          </motion.div>
          <p>Loading your mood analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`premium-dashboard ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* Header */}
      <motion.header 
        className="dashboard-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="header-content">
          <motion.div 
            className="title-container"
            whileHover={{ scale: 1.02 }}
          >
            <FiTrendingUp className="title-main-icon" />
            <h1 className="dashboard-title">
              Mood Analysis
              <span className="title-sub">Personal Journal with Mood Analysis</span>
            </h1>
          </motion.div>
          
          <div className="header-actions">
            <motion.button
              className="theme-toggle premium-toggle"
              onClick={() => setDarkMode(!darkMode)}
              whileTap={{ scale: 0.9 }}
              style={{
                background: darkMode 
                  ? "linear-gradient(135deg, #F59E0B, #D97706)" 
                  : "linear-gradient(135deg, #3B82F6, #1D4ED8)"
              }}
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
              <span className="theme-label">{darkMode ? "Light" : "Dark"}</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <motion.div 
        className="dashboard-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Weekly Summary Stats */}
        <motion.div 
          className="weekly-summary"
          variants={containerVariants}
        >
          <motion.div 
            className="weekly-stat-card premium-main-card"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <div className="weekly-stat-value">
              {getWeeklyEntriesCount()}
            </div>
            <div className="weekly-stat-label">
              Entries This Week
            </div>
          </motion.div>
          
          <motion.div 
            className="weekly-stat-card premium-main-card"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <div className="weekly-stat-value" style={{color: getMostFrequentMoodColor()}}>
              {getMostFrequentMoodThisWeek()}
            </div>
            <div className="weekly-stat-label">
              Dominant Mood
            </div>
          </motion.div>
          
          <motion.div 
            className="weekly-stat-card premium-main-card"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <div className="weekly-stat-value">
              {getAverageMoodThisWeek()}/5
            </div>
            <div className="weekly-stat-label">
              Average Mood Score
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div className="stats-grid" variants={containerVariants}>
          <motion.div 
            className="stat-card premium-stat-card"
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -8 }}
            style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 95, 191, 0.1))",
            }}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">
                <FiCalendar className="stat-icon" />
              </div>
            </div>
            <h3>Total Entries</h3>
            <p className="stat-value">{entries.length}</p>
            <div className="stat-trend">
              <span className="trend-text positive">+{Math.floor(entries.length * 0.15)} this week</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card premium-stat-card"
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -8 }}
            style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))",
            }}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">
                <RiEmotionHappyLine className="stat-icon" />
              </div>
            </div>
            <h3>Most Frequent Mood</h3>
            <p className="stat-value" style={{ fontSize: '1.8rem' }}>
              {Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, 'neutral')}
            </p>
            <div className="stat-trend">
              <span className="trend-text positive">Your dominant emotion</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card premium-stat-card"
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -8 }}
            style={{
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))",
            }}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">
                <FiAward className="stat-icon" />
              </div>
            </div>
            <h3>Consistency Score</h3>
            <p className="stat-value">{Math.round((entries.length / 30) * 100)}%</p>
            <div className="stat-trend">
              <span className="trend-text positive">Journaling habit</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Mood Filter */}
        <motion.div 
          className="filter-section premium-main-card"
          variants={itemVariants}
        >
          <div className="section-header">
            <h2>
              <FiFilter className="section-icon" />
              Filter by Mood
              <span className="section-subtitle">Analyze specific emotional patterns</span>
            </h2>
          </div>
          <div className="mood-filter-grid">
            <motion.button
              className={`mood-filter-btn ${activeChart === "all" ? "active" : ""}`}
              onClick={() => setActiveChart("all")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiBarChart2 />
              All Moods
            </motion.button>
            {Object.entries(moodConfig).map(([mood, config]) => (
              <motion.button
                key={mood}
                className={`mood-filter-btn ${activeChart === mood ? "active" : ""}`}
                onClick={() => setActiveChart(mood)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: activeChart === mood ? config.bgColor : "var(--card-bg)",
                  borderColor: activeChart === mood ? config.color : "var(--border-color)",
                }}
              >
                {config.icon}
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
                <span className="mood-count">({moodCounts[mood] || 0})</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Weekly Mood Frequency - Grouped Bars */}
          <motion.div 
            className="chart-container premium-main-card"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="chart-header">
              <h3>
                <FiBarChart2 className="chart-icon" />
                Weekly Mood Frequency
                <span className="chart-subtitle">Mood distribution across last 7 days</span>
              </h3>
              <div className="chart-actions">
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setChartView('grouped')}
                  className={chartView === 'grouped' ? 'active' : ''}
                >
                  <FiGrid />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setChartView('stacked')}
                  className={chartView === 'stacked' ? 'active' : ''}
                >
                  <FiLayers />
                </motion.button>
              </div>
            </div>
            <div className="chart-wrapper">
              <Bar 
                data={chartView === 'stacked' ? getWeeklyStackedBarData() : getWeeklyBarChartData()} 
                options={chartView === 'stacked' ? stackedBarOptions : weeklyBarOptions} 
              />
            </div>
            <div className="chart-footer">
              <p>Viewing {chartView === 'stacked' ? 'stacked' : 'grouped'} bar chart</p>
            </div>
          </motion.div>

          {/* Line Chart */}
          <motion.div 
            className="chart-container premium-main-card"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="chart-header">
              <h3>
                <FiTrendingUp className="chart-icon" />
                Weekly Mood Trend
                <span className="chart-subtitle">Average mood score over time</span>
              </h3>
              <div className="chart-actions">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <FiDownload />
                </motion.button>
              </div>
            </div>
            <div className="chart-wrapper">
              <Line data={lineData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div 
            className="chart-container premium-main-card"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="chart-header">
              <h3>
                <FiPieChart className="chart-icon" />
                Mood Distribution
                <span className="chart-subtitle">Overall mood frequency</span>
              </h3>
            </div>
            <div className="chart-wrapper">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </motion.div>

        </div>

        {/* Back Button */}
        <motion.div 
          className="action-section"
          variants={itemVariants}
        >
          <Link to="/dashboard" className="premium-back-btn">
            <FiArrowLeft />
            Back to Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}