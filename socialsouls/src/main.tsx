import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Landing from './Landing';
import Chat from './Chat';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { ChatProvider } from './context/ChatContext';
import { SidebarProvider } from './context/SidebarContext';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SidebarProvider>
   <Router>
  <Routes>
   
    <Route path="/" element={<Landing/>} />
    <Route path="/chat" element={<ChatProvider><ProtectedRoute><Chat/></ProtectedRoute></ChatProvider>}/>
   
  </Routes>
</Router>
</SidebarProvider>
  </StrictMode>,
)
