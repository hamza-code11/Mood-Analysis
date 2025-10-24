import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import { 
  FiMail, 
  FiLock, 
  FiLogIn, 
  FiUserPlus,
  FiEye,
  FiEyeOff,
  FiSun,
  FiMoon,
  FiHeart,
  FiTrendingUp, 
} from "react-icons/fi";
import { RiMentalHealthLine, RiLeafLine } from "react-icons/ri";
import './auth.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const navigate = useNavigate();

  // Apply dark mode to body
  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (e) {
      alert("Invalid login: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`premium-auth-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* Animated Background */}
      <div className="auth-background">
        <motion.div 
          className="floating-shape shape-1"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div 
          className="floating-shape shape-2"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
        <motion.div 
          className="floating-shape shape-3"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        />
      </div>

      {/* Main Content Container */}
      <div className="auth-main-container">
        {/* Header */}
        <motion.header 
          className="auth-header-main"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        >
          <div className="header-content">
            <motion.div 
              className="title-container"
            >
              <FiTrendingUp className="title-main-icon" />
              <h1 className="dashboard-title">
                Mood Analysis
                <span className="title-sub">Personal Journal with Mood Analysis</span>
              </h1>
            </motion.div>
            
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
        </motion.header>

        {/* Center Card Container */}
        <div className="auth-center-wrapper">
          <motion.div 
            className="auth-card premium-auth-card"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Decorative Header */}
            <div className="auth-card-header">
              <motion.div 
                className="auth-icon-container"
                variants={itemVariants}
              >
                <div className="auth-icon-circle">
                  <FiTrendingUp size={28} />
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="auth-content"
              variants={containerVariants}
            >
              <motion.div 
                className="auth-header"
                variants={itemVariants}
              >
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Continue your journey of self-reflection and growth</p>
              </motion.div>

              <motion.div 
                className="auth-form"
                variants={containerVariants}
              >
                <motion.div 
                  className="input-group"
                  variants={itemVariants}
                >
                  <div className={`input-container ${isFocused.email ? 'focused' : ''}`}>
                    <FiMail className="input-icon-left" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                      onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                      onKeyPress={handleKeyPress}
                      className="premium-input"
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="input-group"
                  variants={itemVariants}
                >
                  <div className={`input-container ${isFocused.password ? 'focused' : ''}`}>
                    <FiLock className="input-icon-left" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                      onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                      onKeyPress={handleKeyPress}
                      className="premium-input"
                    />
                    <motion.button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </motion.button>
                  </div>
                </motion.div>

                <motion.button
                  onClick={handleLogin}
                  disabled={loading || !email || !password}
                  className="auth-btn premium-auth-btn"
                  variants={itemVariants}
                  whileHover={{ 
                    boxShadow: loading ? "var(--shadow)" : "0 5px 10px rgba(59, 130, 246, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: loading || !email || !password
                      ? "var(--border-color)" 
                      : "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
                    cursor: loading || !email || !password ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner-small" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <FiLogIn size={20} />
                      Sign In to Your Journal
                    </>
                  )}
                </motion.button>

                <motion.div 
                  className="auth-divider"
                  variants={itemVariants}
                >
                  <span>New to Personal Journal</span>
                </motion.div>

                <motion.div 
                  className="auth-footer"
                  variants={itemVariants}
                >
                  <Link to="/signup" className="auth-link signup-link">
                    <FiUserPlus size={18} />
                    Create Your Account
                    <div className="link-arrow">→</div>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}