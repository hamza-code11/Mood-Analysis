import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeMoodLocally } from "../utils/moodAnalyzer";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  FiSun, 
  FiMoon, 
  FiPlus, 
  FiTrendingUp, 
  FiBook, 
  FiBarChart2,
  FiEdit,
  FiSave,
  FiRefreshCw,
  FiClock,
  FiLogOut,
  FiUser,
  FiTrash2,
  FiFeather,
} from "react-icons/fi";
import { RiBrainLine } from "react-icons/ri";
import './Dashboard.css';
import { FiEye, FiEyeOff } from "react-icons/fi";



export default function Dashboard() {
  const { user, logout, updateEmailAuth, updatePasswordAuth, deleteUserAuth } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const moodConfig = {
    happy: { 
      color: "#10B981", 
      icon: "😊",
      bgColor: "#10B98120",
      gradient: "linear-gradient(135deg, #10B981, #047857)"
    },
    neutral: { 
      color: "#6B7280", 
      icon: "😐",
      bgColor: "#6B728020",
      gradient: "linear-gradient(135deg, #6B7280, #4B5563)"
    },
    sad: { 
      color: "#3B82F6", 
      icon: "😔",
      bgColor: "#3B82F620",
      gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)"
    },
    angry: { 
      color: "#EF4444", 
      icon: "😡",
      bgColor: "#EF444420",
      gradient: "linear-gradient(135deg, #EF4444, #DC2626)"
    },
    stressed: { 
      color: "#F59E0B", 
      icon: "😩",
      bgColor: "#F59E0B20",
      gradient: "linear-gradient(135deg, #F59E0B, #D97706)"
    },
  };

  // Apply dark mode to body
  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  // 🔹 Fetch journal entries (latest first)
  const fetchEntries = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "journalEntries"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort by createdAt (descending) so latest entry comes first
      fetched.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime; // descending
      });

      setEntries(fetched);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
    }
  };

const analyzeMoodAI = (text) => {
  const { mood } = analyzeMoodLocally(text); // ya { mood, emoji } agar emoji bhi chahiye
  return mood;
};


  // 🔹 Save or update entry
  const saveEntry = async () => {
  if (!newEntry.trim()) return;
  setIsSaving(true);

  try {
    // 🔹 Local mood analysis
    const { mood, emoji } = analyzeMoodLocally(newEntry);

    if (editId) {
      // 🔹 Update existing entry
      const ref = doc(db, "journalEntries", editId);
      await updateDoc(ref, {
        text: newEntry,
        mood,
        emoji,
        updatedAt: serverTimestamp(),
      });
      setEditId(null);
    } else {
      // 🔹 Add new entry
      await addDoc(collection(db, "journalEntries"), {
        text: newEntry,
        userId: user.uid,
        mood,
        emoji,
        createdAt: serverTimestamp(),
      });
    }

    setNewEntry("");
    await fetchEntries(); // refresh entries
  } catch (err) {
    console.error("Error saving entry:", err);
  }

  setIsSaving(false);
};



  // 🔹 Delete entry
  const deleteEntry = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This entry will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: darkMode ? '#1A1B2E' : '#FFFFFF',
      color: darkMode ? '#F1F5F9' : '#1E293B',
    });

    if (confirm.isConfirmed) {
      await deleteDoc(doc(db, "journalEntries", id));
      await fetchEntries();
      Swal.fire({
        title: "Deleted!",
        text: "Your entry has been removed successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: darkMode ? '#1A1B2E' : '#FFFFFF',
        color: darkMode ? '#F1F5F9' : '#1E293B',
      });
    }
  };

  // 🔹 Edit entry
  const startEditing = (entry) => {
    setNewEntry(entry.text);
    setEditId(entry.id);
  };

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Profile Modal using SweetAlert2

const openProfileModal = async () => {
  const { value: result } = await Swal.fire({
    title: "My Profile",
    html: `
      <p style="margin-bottom: 20px;">Email: <strong>${user.email}</strong></p>
      <div style="position:relative; display:flex; align-items:center;">
        <input id="swal-password" type="password" class="swal2-input" placeholder="New Password" 
               style="padding-right:40px; width:100%;">
        <span id="toggle-password" style="position:absolute; right:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; height:100%;">
          <svg id="eye-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </span>
      </div>
      <button id="delete-account-btn" class="swal2-styled" 
        style="background-color:#d33; color:white; margin-top:10px; padding:8px 16px; border-radius:5px; font-weight:bold;">
        Delete Account
      </button>
    `,
    showCancelButton: true,
    focusConfirm: false,
    preConfirm: () => {
      const passwordInput = document.getElementById("swal-password");
      return passwordInput.value.trim();
    },
    didOpen: () => {
      const toggle = document.getElementById("toggle-password");
      const input = document.getElementById("swal-password");
      const eyeIcon = document.getElementById("eye-icon");

      let isPasswordVisible = false;

      toggle.addEventListener("click", () => {
        isPasswordVisible = !isPasswordVisible;
        input.type = isPasswordVisible ? "text" : "password";

        // toggle eye icon 
        eyeIcon.innerHTML = isPasswordVisible
          ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`
          : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
      });

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") Swal.clickConfirm();
      });

      document.getElementById("delete-account-btn").addEventListener("click", handleDeleteAccount);
    },
  });

  if (result) {
    try {
      await updatePasswordAuth(result); 
      Swal.fire("Success", "Password updated successfully!", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  }
};

const handleDeleteAccount = async () => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "Your account will be permanently deleted! This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
  });

  if (confirm.isConfirmed) {
    try {
      await deleteUserAuth(); 
      Swal.fire("Deleted!", "Your account has been deleted.", "success");
      navigate("/");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  }
};





  useEffect(() => {
    fetchEntries();
  }, [user]);

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
            <FiTrendingUp  className="title-main-icon" />
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
        {/* Stats Section */}
        <motion.div className="stats-grid" variants={containerVariants}>
          <motion.div 
            className="stat-card premium-stat-card"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03, 
              y: -8,
              transition: { type: "spring", stiffness: 300 }
            }}
            style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 95, 191, 0.1))",
              border: "1px solid rgba(59, 130, 246, 0.2)"
            }}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">
                <FiBook className="stat-icon" />
              </div>
              <FiTrendingUp className="trend-icon positive" />
            </div>
            <h3>Total Entries</h3>
            <p className="stat-value">{entries.length}</p>
            <div className="stat-trend">
              <span className="trend-text positive">+{Math.floor(entries.length * 0.12)} this week</span>
            </div>
            <div className="stat-decoration"></div>
          </motion.div>

          <motion.div 
            className="stat-card premium-stat-card"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03, 
              y: -8,
              transition: { type: "spring", stiffness: 300 }
            }}
            style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))",
              border: "1px solid rgba(16, 185, 129, 0.2)"
            }}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">
                <RiBrainLine className="stat-icon" />
              </div>
            </div>
            <h3>Current Session</h3>
            <p className="stat-value" style={{ 
              background: "linear-gradient(135deg, #3B82F6, #8B5FBF)",
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Active
            </p>
            <div className="mood-indicator" style={{ 
              background: "linear-gradient(135deg, #3B82F6, #8B5FBF)" 
            }}></div>
            <div className="stat-decoration"></div>
          </motion.div>

          <motion.div 
            className="stat-card premium-stat-card"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03, 
              y: -8,
              transition: { type: "spring", stiffness: 300 }
            }}
            style={{
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))",
              border: "1px solid rgba(245, 158, 11, 0.2)"
            }}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">
                <FiUser className="stat-icon" />
              </div>
            </div>
            <h3>Welcome Back</h3>
            <p className="stat-value" style={{ fontSize: '1.8rem' }}>
              {user?.email?.split('@')[0]}
            </p>
            <div className="stat-trend">
              <span className="trend-text positive">Ready to reflect</span>
            </div>
            <div className="stat-decoration"></div>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="main-grid">
          {/* Add Entry Section */}
          <motion.div 
            className="add-entry-section premium-main-card"
            variants={itemVariants}
          >
            <div className="section-header">
              <h2>
                <FiEdit className="section-icon" />
                {editId ? "Edit Reflection" : "New Reflection"}
                <span className="section-subtitle">
                  {editId ? "Update your thoughts" : "Share your thoughts and feelings"}
                </span>
              </h2>
            </div>
            
            <motion.textarea
              className="entry-textarea premium-textarea"
              placeholder="What's on your mind today? Share your thoughts, feelings, and reflections... "
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              whileFocus={{ scale: 1.01 }}
            ></motion.textarea>

            <div className="action-buttons">
              <motion.button
                className="save-btn premium-save-btn"
                onClick={saveEntry}
                disabled={isSaving || !newEntry.trim()}
                whileHover={{ 
                  scale: isSaving ? 1 : 1.05,
                  boxShadow: "0 12px 40px rgba(59, 130, 246, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: isSaving 
                    ? "var(--border-color)" 
                    : "linear-gradient(135deg, var(--primary-color), var(--accent-color))"
                }}
              >
                {isSaving ? (
                  <>
                    <FiRefreshCw className="loading-spinner" />
                    Analyzing Mood...
                  </>
                ) : editId ? (
                  <>
                    <FiSave />
                    Update Entry
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Add Entry
                  </>
                )}
              </motion.button>

              <motion.button
                className="profile-btn premium-profile-btn"
                onClick={openProfileModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiUser />
                Profile
              </motion.button>

              <motion.button
                className="logout-btn premium-logout-btn"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiLogOut />
                Logout
              </motion.button>
            </div>

            <div className="chart-link-container">
              <Link to="/chart" className="premium-chart-link">
                <FiBarChart2 />
                View Mood Analytics
              </Link>
            </div>
          </motion.div>

          {/* Entries Section */}
          <motion.div 
            className="entries-section premium-main-card"
            variants={itemVariants}
          >
            <div className="section-header">
              <h2>
                <FiBook className="section-icon" />
                Recent Reflections
                <span className="section-subtitle">Your journey in words</span>
              </h2>
              <div className="entries-count-badge">
                <span className="entries-count">{entries.length} entries</span>
                <FiTrendingUp className="count-trend" />
              </div>
            </div>

            <div className="entries-scroll-container">
              <AnimatePresence>
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className="entry-card premium-entry-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      borderColor: moodConfig[entry.mood]?.color,
                      boxShadow: `0 8px 32px ${moodConfig[entry.mood]?.color}20`
                    }}
                    style={{
                      borderLeft: `4px solid ${moodConfig[entry.mood]?.color}`
                    }}
                  >
                    <div className="entry-header">
                      <div className="mood-badge" style={{ 
                        background: moodConfig[entry.mood]?.bgColor,
                        color: moodConfig[entry.mood]?.color
                      }}>
                        <span className="mood-emoji">{moodConfig[entry.mood]?.icon}</span>
                        <span className="mood-text">{entry.mood}</span>
                      </div>
                      <div className="entry-time">
                        <FiClock className="time-icon" />
                        <span className="entry-date">
                          {entry.createdAt?.toDate
                            ? entry.createdAt.toDate().toLocaleString()
                            : "—"}
                        </span>
                      </div>
                    </div>
                    <p className="entry-content">{entry.text}</p>
                    
                    {entry.updatedAt && (
                      <div className="entry-updated">
                        <small>
                          ✏️ Updated: {entry.updatedAt?.toDate ? entry.updatedAt.toDate().toLocaleString() : "—"}
                        </small>
                      </div>
                    )}

                    <div className="entry-actions">
                      <motion.button 
                        className="entry-action-btn edit-btn"
                        onClick={() => startEditing(entry)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiEdit />
                        Edit
                      </motion.button>
                      <motion.button 
                        className="entry-action-btn delete-btn"
                        onClick={() => deleteEntry(entry.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiTrash2 />
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {entries.length === 0 && (
                <motion.div 
                  className="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FiTrendingUp className="empty-icon" />
                  <h3>No entries yet</h3>
                  <p>Start your journaling journey by writing your first reflection!</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}