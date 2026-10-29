import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const FEATURES = [
  { id: "dashboard", label: "Dashboard", icon: "⌂", description: "Your placement preparation overview" },
  { id: "practice", label: "Practice", icon: "✎", description: "Practice aptitude and programming questions" },
  { id: "tests", label: "Tests", icon: "▤", description: "Take timed placement tests" },
  { id: "resume", label: "Resume Analysis", icon: "▧", description: "Review and improve your resume" },
  { id: "interview", label: "Mock Interview", icon: "◉", description: "Prepare for interview questions" },
  { id: "results", label: "Results", icon: "▥", description: "Review your scores and progress" },
];

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(
    Boolean(sessionStorage.getItem("access_token"))
  );
  const [activePage, setActivePage] = useState("dashboard");

  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [checking, setChecking] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState("");
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const userName = sessionStorage.getItem("user_name") || "Student";
  const activeFeature = FEATURES.find((feature) => feature.id === activePage);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setLoginMessage(data.detail || "Login failed. Please try again.");
        return;
      }

      sessionStorage.setItem("access_token", data.access_token);
      sessionStorage.setItem("user_name", data.name);
      sessionStorage.setItem("user_id", data.user_id);
      setLoggedIn(true);
      setActivePage("dashboard");
    } catch {
      setLoginMessage(
        "Cannot connect to backend. Check whether FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadQuestions() {
    setQuestionsLoading(true);
    setQuestionsError("");
    setFeedback("");
    setSelectedAnswer("");

    try {
      const response = await fetch(`${API_URL}/api/questions`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load questions.");
      }

      setQuestions(data);
      setQuestionIndex(0);
    } catch (error) {
      setQuestionsError(
        error.message || "Unable to load questions. Please try again."
      );
    } finally {
      setQuestionsLoading(false);
    }
  }

  async function openPractice() {
    setActivePage("practice");
    await loadQuestions();
  }

  async function submitAnswer(event) {
    event.preventDefault();
    if (!selectedAnswer.trim() || checking) return;

    const question = questions[questionIndex];
    if (!question) return;

    setChecking(true);
    setFeedback("");

    try {
      const response = await fetch(
        `${API_URL}/api/questions/${question.ques_id}/check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer: selectedAnswer }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setFeedback(data.detail || "Unable to check your answer.");
        setFeedbackCorrect(false);
        return;
      }

      setFeedback(data.message);
      setFeedbackCorrect(Boolean(data.is_correct));
      setAnsweredCount((count) => count + 1);
      if (data.is_correct) setCorrectCount((count) => count + 1);
    } catch {
      setFeedback("Cannot connect to the backend.");
      setFeedbackCorrect(false);
    } finally {
      setChecking(false);
    }
  }

  function nextQuestion() {
    setQuestionIndex((index) => index + 1);
    setSelectedAnswer("");
    setFeedback("");
  }

  function logout() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user_name");
    sessionStorage.removeItem("user_id");
    setLoggedIn(false);
    setActivePage("dashboard");
    setEmail("");
    setPassword("");
    setLoginMessage("");
    setQuestions([]);
    setQuestionIndex(0);
    setSelectedAnswer("");
    setFeedback("");
    setAnsweredCount(0);
    setCorrectCount(0);
  }

  if (!loggedIn) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="brand-mark">AI</div>
          <p className="login-subtitle">
            AI Interview &amp; Placement Preparation Portal
          </p>

          <form onSubmit={handleLogin} className="login-form">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              className="primary-button full-width"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            {loginMessage && (
              <p className="login-message" role="alert">
                {loginMessage}
              </p>
            )}
          </form>
          <p className="login-footer">Prepare. Practice. Get Placed.</p>
        </section>
      </main>
    );
  }

  const currentQuestion = questions[questionIndex];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">AI</div>
          <div>
            <strong>Placement Prep</strong>
            <span>Student Portal</span>
          </div>
        </div>

        <p className="nav-caption">WORKSPACE</p>
        <nav className="main-nav" aria-label="Main navigation">
          {FEATURES.map((feature) => (
            <button
              key={feature.id}
              type="button"
              className={`nav-item ${activePage === feature.id ? "active" : ""}`}
              onClick={() => {
                if (feature.id === "practice") {
                  openPractice();
                } else {
                  setActivePage(feature.id);
                }
              }}
            >
              <span className="nav-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <span>{feature.label}</span>
              {activePage === feature.id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-icon">?</span>
            <div>
              <strong>Keep learning!</strong>
              <p>Small steps lead to big results.</p>
            </div>
          </div>
          <button type="button" className="logout-link" onClick={logout}>
            <span aria-hidden="true">↪</span> Log out
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{activeFeature?.label || "Dashboard"}</strong>
          </div>
          <div className="profile-area">
            <div className="profile-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-copy">
              <strong>{userName}</strong>
              <span>Student</span>
            </div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "dashboard" && (
            <>
              <section className="welcome-banner">
                <div className="welcome-copy">
                  <span className="eyebrow">YOUR PLACEMENT JOURNEY</span>
                  <h1>Welcome back, {userName}!</h1>
                  <p>
                    Build your skills, practise consistently, and get ready for
                    your next opportunity.
                  </p>
                  <button
                    className="banner-button"
                    onClick={openPractice}
                    type="button"
                  >
                    Start practising <span aria-hidden="true">→</span>
                  </button>
                </div>
                <div className="welcome-illustration" aria-hidden="true">
                  <div className="illustration-circle">
                    <span className="illustration-cap">◆</span>
                    <span className="illustration-book">▰</span>
                    <span className="illustration-spark">✦</span>
                  </div>
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <h2>Your workspace</h2>
                    <p>Choose what you want to work on today.</p>
                  </div>
                </div>
                <div className="feature-grid">
                  {FEATURES.filter((feature) => feature.id !== "dashboard").map(
                    (feature) => (
                      <button
                        className={`feature-card feature-${feature.id}`}
                        type="button"
                        key={feature.id}
                        onClick={() =>
                          feature.id === "practice"
                            ? openPractice()
                            : setActivePage(feature.id)
                        }
                      >
                        <span className="feature-icon" aria-hidden="true">
                          {feature.icon}
                        </span>
                        <span className="feature-card-title">
                          {feature.label}
                        </span>
                        <span className="feature-description">
                          {feature.description}
                        </span>
                        <span className="feature-arrow" aria-hidden="true">
                          ↗
                        </span>
                      </button>
                    )
                  )}
                </div>
              </section>

              <section className="section-block progress-section">
                <div className="section-heading">
                  <div>
                    <h2>Your practice snapshot</h2>
                    <p>Activity from this browser session.</p>
                  </div>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-label">Answers submitted</span>
                    <strong>{answeredCount}</strong>
                    <span className="stat-note">This session</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Correct answers</span>
                    <strong>{correctCount}</strong>
                    <span className="stat-note">This session</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Accuracy</span>
                    <strong>
                      {answeredCount
                        ? Math.round((correctCount / answeredCount) * 100)
                        : 0}
                      %
                    </strong>
                    <span className="stat-note">Based on checked answers</span>
                  </div>
                </div>
              </section>
            </>
          )}

          {activePage === "practice" && (
            <section className="section-block">
              <div className="section-heading practice-title-row">
                <div>
                  <span className="eyebrow">LEARN BY DOING</span>
                  <h1>Practice questions</h1>
                  <p>
                    Answer each question and get feedback from the backend.
                  </p>
                </div>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={loadQuestions}
                  disabled={questionsLoading}
                >
                  {questionsLoading ? "Loading..." : "↻ Refresh"}
                </button>
              </div>

              {questionsLoading ? (
                <div className="empty-state">
                  <div className="loader" />
                  <p>Loading questions from your database...</p>
                </div>
              ) : questionsError ? (
                <div className="empty-state">
                  <span className="empty-icon">!</span>
                  <h2>Could not load questions</h2>
                  <p>{questionsError}</p>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={loadQuestions}
                  >
                    Try again
                  </button>
                </div>
              ) : questions.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">▤</span>
                  <h2>No questions yet</h2>
                  <p>Add questions to your database and try again.</p>
                </div>
              ) : questionIndex >= questions.length ? (
                <div className="empty-state">
                  <span className="completion-icon">✓</span>
                  <h2>Practice set completed!</h2>
                  <p>
                    You have reached the end of {questions.length} questions in
                    this set.
                  </p>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={loadQuestions}
                  >
                    Practise again
                  </button>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setActivePage("dashboard")}
                  >
                    Back to dashboard
                  </button>
                </div>
              ) : (
                <article className="question-card">
                  <div className="question-topline">
                    <span className="question-count">
                      QUESTION {questionIndex + 1}{" "}
                      <span>/ {questions.length}</span>
                    </span>
                    <span
                      className={`difficulty-badge ${(currentQuestion.difficulty || "general").toLowerCase()}`}
                    >
                      {currentQuestion.difficulty || "General"}
                    </span>
                  </div>
                  <div className="question-progress">
                    <span
                      style={{
                        width: `${((questionIndex + 1) / questions.length) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="category-label">
                    CATEGORY {currentQuestion.category_id ?? "N/A"}
                  </p>
                  <h2>{currentQuestion.ques_txt}</h2>
                  <form onSubmit={submitAnswer} className="answer-form">
                    <label htmlFor="answer">Your answer</label>
                    <input
                      id="answer"
                      type="text"
                      placeholder="Type your answer here..."
                      value={selectedAnswer}
                      onChange={(event) => {
                        setSelectedAnswer(event.target.value);
                        if (feedback) setFeedback("");
                      }}
                      disabled={checking || Boolean(feedback)}
                      required
                    />
                    <button
                      className="primary-button"
                      type="submit"
                      disabled={
                        !selectedAnswer.trim() || checking || Boolean(feedback)
                      }
                    >
                      {checking ? "Checking answer..." : "Submit answer"}{" "}
                      {!checking && <span aria-hidden="true">→</span>}
                    </button>
                  </form>
                  {feedback && (
                    <div
                      className={`feedback-panel ${feedbackCorrect ? "feedback-success" : "feedback-error"}`}
                      role="status"
                    >
                      <span className="feedback-symbol">
                        {feedbackCorrect ? "✓" : "!"}
                      </span>
                      <div>
                        <strong>{feedback}</strong>
                        <p>
                          {feedbackCorrect
                            ? "Nice work! Keep going."
                            : "Review your answer, then continue practising."}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="question-footer">
                    <span>
                      {questions.length - questionIndex - 1} question(s)
                      remaining after this one
                    </span>
                    {feedback && (
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={nextQuestion}
                      >
                        Next question →
                      </button>
                    )}
                  </div>
                </article>
              )}
            </section>
          )}

          {activePage === "tests" && <McqTest />}

          {activePage === "resume" && (
            <PlaceholderPage
              eyebrow="CAREER TOOLKIT"
              title="Resume analysis"
              description="Get ready to review your resume and identify areas to improve."
              icon="▧"
              items={[
                "Upload a resume",
                "Review skills and project descriptions",
                "Get improvement suggestions",
              ]}
              note="Resume upload and AI analysis are not connected yet."
            />
          )}

          {activePage === "interview" && (
            <PlaceholderPage
              eyebrow="INTERVIEW PRACTICE"
              title="Mock interview"
              description="Prepare to answer common interview questions with confidence."
              icon="◉"
              items={[
                "Technical questions",
                "HR interview practice",
                "Feedback on your answers",
              ]}
              note="Interview sessions and AI feedback are not connected yet."
            />
          )}

          {activePage === "results" && (
            <section className="section-block">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR PERFORMANCE</span>
                  <h1>Results &amp; progress</h1>
                  <p>
                    Here is the activity recorded during this browser session.
                  </p>
                </div>
              </div>
              <div className="stats-grid results-stats">
                <div className="stat-card">
                  <span className="stat-label">Answers submitted</span>
                  <strong>{answeredCount}</strong>
                  <span className="stat-note">Current session only</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Correct answers</span>
                  <strong>{correctCount}</strong>
                  <span className="stat-note">Current session only</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Accuracy</span>
                  <strong>
                    {answeredCount
                      ? Math.round((correctCount / answeredCount) * 100)
                      : 0}
                    %
                  </strong>
                  <span className="stat-note">Not saved to database yet</span>
                </div>
              </div>
              <div className="notice-card">
                <span className="notice-icon">i</span>
                <p>
                  These figures reset when you log out and are not permanent
                  placement results. We can connect them to your existing{" "}
                  <code>result</code> table in a later step.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function McqTest() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(20 * 60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTestQuestions() {
      try {
        const response = await fetch(`${API_URL}/api/test-questions`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load questions.");
        }
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the test API.");
        }
        if (!cancelled) setQuestions(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Backend connection failed.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTestQuestions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || error || submitted || questions.length === 0) return;

    if (seconds <= 0) {
      setSubmitted(true);
      return;
    }

    const timerId = setTimeout(() => {
      setSeconds((remaining) => remaining - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [seconds, loading, error, submitted, questions.length]);

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[index];

  function submitTest() {
    setSubmitted(true);
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <section className="section-block">
        <h1>Loading MCQ test...</h1>
        <p>Fetching questions from your database.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-block">
        <h1>Unable to load the test</h1>
        <p>{error}</p>
        <button
          className="secondary-button"
          type="button"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section className="section-block">
        <h1>No MCQ questions available</h1>
        <p>
          Check that the questions in your database have all four options
          filled in.
        </p>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="section-block">
        <span className="eyebrow">TEST SUMMARY</span>
        <h1>Test submitted</h1>
        <p>
          You answered {answeredCount} out of {questions.length} questions.
        </p>
        <p>
          Your selected answers are currently held only in this browser. The
          score is not calculated or saved yet because a secure backend
          submission endpoint still needs to be added.
        </p>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total questions</span>
            <strong>{questions.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Answered</span>
            <strong>{answeredCount}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Unanswered</span>
            <strong>{questions.length - answeredCount}</strong>
          </div>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            setAnswers({});
            setIndex(0);
            setSeconds(20 * 60);
            setSubmitted(false);
          }}
        >
          Start a new attempt
        </button>
      </section>
    );
  }

  return (
    <section className="section-block">
      <div className="section-heading practice-title-row">
        <div>
          <span className="eyebrow">ASSESS YOUR SKILLS</span>
          <h1>MCQ Placement Test</h1>
          <p>Select one answer for each question. You have 20 minutes.</p>
        </div>
        <div className={`test-timer ${seconds <= 60 ? "timer-warning" : ""}`}>
          <span aria-hidden="true">⏱</span>
          <span>{formatTime(seconds)}</span>
        </div>
      </div>

      <article className="question-card">
        <div className="question-topline">
          <span className="question-count">
            QUESTION {index + 1} <span>/ {questions.length}</span>
          </span>
          <span className="difficulty-badge">
            {currentQuestion.difficulty || "General"}
          </span>
        </div>

        <div className="question-progress">
          <span
            style={{
              width: `${((index + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <p className="category-label">
          CATEGORY {currentQuestion.category_id ?? "N/A"}
        </p>
        <h2>{currentQuestion.ques_txt}</h2>

        <div className="answer-form mcq-answer-form">
          {currentQuestion.options.map((option, optionIndex) => (
            <label className="mcq-option" key={`${currentQuestion.ques_id}-${optionIndex}`}>
              <input
                type="radio"
                name={`question-${currentQuestion.ques_id}`}
                value={option}
                checked={answers[currentQuestion.ques_id] === option}
                onChange={() =>
                  setAnswers((previous) => ({
                    ...previous,
                    [currentQuestion.ques_id]: option,
                  }))
                }
              />
              <span className="mcq-option-letter">
                {String.fromCharCode(65 + optionIndex)}.
              </span>
              <span>{option}</span>
            </label>
          ))}
        </div>

        <div className="question-footer mcq-footer">
          <button
            className="secondary-button"
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((previous) => previous - 1)}
          >
            ← Previous
          </button>

          <span>
            {answeredCount} of {questions.length} answered
          </span>

          {index < questions.length - 1 ? (
            <button
              className="primary-button"
              type="button"
              onClick={() => setIndex((previous) => previous + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              className="primary-button"
              type="button"
              onClick={submitTest}
            >
              Submit Test
            </button>
          )}
        </div>

        <div className="mcq-question-nav" aria-label="Question navigation">
          {questions.map((question, questionIndex) => (
            <button
              key={question.ques_id}
              type="button"
              className={`secondary-button ${index === questionIndex ? "current-question-button" : ""}`}
              onClick={() => setIndex(questionIndex)}
              aria-label={`Go to question ${questionIndex + 1}`}
            >
              {questionIndex + 1}
              {answers[question.ques_id] !== undefined ? " ✓" : ""}
            </button>
          ))}
        </div>

        <p className="test-note">
          The timer submits the test automatically when it reaches 00:00.
        </p>
      </article>
    </section>
  );
}

function PlaceholderPage({ eyebrow, title, description, icon, items, note }) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon">{icon}</div>
        <h2>Coming up next</h2>
        <p className="placeholder-intro">This area is ready for us to build.</p>
        <ul>
          {items.map((item) => (
            <li key={item}>
              <span>✓</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="notice-card">
          <span className="notice-icon">i</span>
          <p>{note}</p>
        </div>
      </div>
    </section>
  );
}

export default App;
