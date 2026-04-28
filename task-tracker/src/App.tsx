import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Finances from './pages/Finances';
import Habits from './pages/Habits';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/finances" element={<Finances />} />
      <Route path="/habits" element={<Habits />} />
    </Routes>
  );
}

export default App;
