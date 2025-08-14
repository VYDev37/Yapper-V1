import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { UserProvider } from './context/UserContext.tsx';
import { PostProvider } from './context/PostContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </PostProvider>
  </StrictMode>,
)
