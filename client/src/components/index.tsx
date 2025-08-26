import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import AccountRoutes from "./Account";
import UserRoutes from "./User";
import FallbackRoutes from "./Fallback";
import AutoRedirect from "./Fallback/Redirect";

import Post from './User/Post';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import '@fortawesome/fontawesome-free/css/all.min.css';

import '../App.css';

function CompoundRoutes() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };

  return (
    <>
      <Routes location={state?.backgroundLocation || location}>
        <Route path="/" element={<AutoRedirect />} />
        <Route path="/post/:ownerId/:id" element={<Post modal={false} />} />
        {AccountRoutes()}
        {UserRoutes()}
        {FallbackRoutes()}
      </Routes>
      {state?.backgroundLocation && (
        <Routes>
          {/* Here you can render the same Post route, but styled as modal */}
          <Route path="/post/:ownerId/:id" element={<Post modal={true} />} />
        </Routes>
      )}
    </>
  );
}

export default function AllRoutes() {
  return (
    <Router>
      <CompoundRoutes />
    </Router>
  )
}