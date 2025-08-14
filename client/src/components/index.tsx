import AccountRoutes from "./Account";
import UserRoutes from "./User";
import FallbackRoutes from "./Fallback";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import '@fortawesome/fontawesome-free/css/all.min.css';

import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import AutoRedirect from "./Fallback/Redirect";

import '../App.css';

export default function AllRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AutoRedirect />} />
        {AccountRoutes()}
        {UserRoutes()}
        {FallbackRoutes()}
      </Routes>
    </Router>
  );
}