import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams
} from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './index.css';

// Supabase inicializálása a környezeti változók alapján
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Bejelentkezés komponens
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        <h1 className="text-2xl font-bold mb-4">Bejelentkezés</h1>
        <input
          type="email"
          placeholder="Email cím"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 w-full mb-2"
        />
        <button type="submit" disabled={loading} className="bg-orange-500 text-white p-2 rounded w-full mb-2">
          {loading ? "Bejelentkezés..." : "Bejelentkezés"}
        </button>
        <div className="text-center">
          <span className="text-blue-500 cursor-pointer" onClick={() => navigate('/register')}>
            Nincs még fiókod? Regisztráció
          </span>
        </div>
      </form>
    </div>
  );
}

// Regisztráció komponens
function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("A jelszavak nem egyeznek!");
      return;
    }
    if (!acceptedTerms) {
      alert("Az ÁSZF elfogadása kötelező!");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Regisztráció sikeres! Kérjük, igazold az email címed.");
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-80">
        <h1 className="text-2xl font-bold mb-4">Regisztráció</h1>
        <input
          type="text"
          placeholder="Teljes név"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="border p-2 w-full mb-2"
        />
        <input
          type="email"
          placeholder="Email cím"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          placeholder="Jelszó ismét"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="border p-2 w-full mb-2"
        />
        <div className="mb-2">
          <label>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
              className="mr-2"
            />
            Elfogadom az ÁSZF-et
          </label>
        </div>
        <button type="submit" disabled={loading} className="bg-orange-500 text-white p-2 rounded w-full mb-2">
          {loading ? "Regisztráció..." : "Regisztráció"}
        </button>
        <div className="text-center">
          <span className="text-blue-500 cursor-pointer" onClick={() => navigate('/login')}>
            Már van fiókod? Bejelentkezés
          </span>
        </div>
      </form>
    </div>
  );
}

// Dashboard komponens – itt jelennek meg az aktuális felhasználó témái, és itt lehet új téma hozzáadása.
function Dashboard() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    // A bejelentkezett felhasználó adatai a Supabase auth API segítségével
    const {
      data: { user }
    } = await supabase.auth.getUser();
    let { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setTopics(data);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (newTopic.trim() === "") return;
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('topics')
      .insert([{ name: newTopic, user_id: user.id }]);
    if (error) {
      alert(error.message);
    } else {
      setNewTopic("");
      fetchTopics();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
          Kijelentkezés
        </button>
      </div>
      <form onSubmit={handleAddTopic} className="mb-4">
        <input
          type="text"
          placeholder="Új téma neve"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          required
          className="border p-2 mr-2"
        />
        <button className="bg-orange-500 text-white p-2 rounded" type="submit">
          Új téma
        </button>
      </form>
      <div>
        {topics.length === 0 && <p>Nincs még téma létrehozva.</p>}
        <ul>
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="bg-white p-4 mb-2 rounded shadow cursor-pointer"
              onClick={() => navigate(`/topic/${topic.id}`)}
            >
              {topic.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// TopicView komponens – itt látod az adott téma adatait, és itt lehet flashkártyákat hozzáadni és megtekinteni.
function TopicView() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [cards, setCards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    fetchTopic();
    fetchCards();
  }, [topicId]);

  const fetchTopic = async () => {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .single();
    if (error) {
      alert(error.message);
    } else {
      setTopic(data);
    }
  };

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false });
    if (error) {
      alert(error.message);
    } else {
      setCards(data);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (question.trim() === "" || answer.trim() === "") return;
    const { error } = await supabase
      .from('cards')
      .insert([{ topic_id: topicId, question, answer }]);
    if (error) {
      alert(error.message);
    } else {
      setQuestion("");
      setAnswer("");
      fetchCards();
    }
  };

  return (
    <div className="p-4">
      <button onClick={() => navigate('/dashboard')} className="bg-blue-500 text-white p-2 rounded mb-4">
        Vissza
      </button>
      {topic && <h1 className="text-2xl font-bold mb-4">{topic.name}</h1>}
      <form onSubmit={handleAddCard} className="mb-4">
        <input
          type="text"
          placeholder="Kérdés"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Válasz"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          className="border p-2 w-full mb-2"
        />
        <button className="bg-orange-500 text-white p-2 rounded w-full" type="submit">
          Új kártya
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.length === 0 && <p>Nincs még kártya hozzáadva.</p>}
        {cards.map((card) => (
          <Flashcard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

// Flashcard komponens – flip animációval jeleníti meg a kártya kérdését és válaszát.
function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flashcard w-64 h-40 m-auto cursor-pointer" onClick={() => setFlipped(!flipped)}>
      <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
        <div className="flashcard-front flex items-center justify-center bg-white border rounded shadow p-4">
          {card.question}
        </div>
        <div className="flashcard-back flex items-center justify-center bg-white border rounded shadow p-4">
          {card.answer}
        </div>
      </div>
    </div>
  );
}

// Az alkalmazás fő komponense: a Supabase authentikációt figyeli, és a React Router segítségével váltogatja a nézeteket.
function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Aktuális session lekérése
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    // Auth állapotváltozás figyelése
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/topic/:topicId" element={<TopicView />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
