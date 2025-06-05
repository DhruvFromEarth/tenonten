import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
// import Home from "./pages/Home";
// import Settings from "./pages/Settings";
import TaskManager from "./pages/TaskManagerPage/Taskmanager";
import Whiteboard from "./pages/WhiteboardPage/Whiteboard";
import Chats from "./pages/ChatsPage/Chats";
import { ThemeProvider } from "./context/ThemeContext";
import AdminPage from "./pages/AdminPage/AdminPage";
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import "./styles/theme.css";
import "./App.css";
function App() {
  // const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <div className="content-container">
            <Sidebar />
            {/* <main className={`main-container ${isCollapsed ? "" : "expanded"}`}> */}
            <main className="main-container">
              <Routes>
                <Route path="/" element={<TaskManager />} />
                <Route path="/home" element={<TaskManager />} />
                <Route path="/whiteboard" element={<Whiteboard />} />
                <Route path="/Chats" element={<Chats />} />
                <Route path="/admin" element={
                    <ProtectedAdminRoute>
                        <AdminPage />
                    </ProtectedAdminRoute>
                } />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;