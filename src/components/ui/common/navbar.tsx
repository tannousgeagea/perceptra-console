import { FC, useState, useEffect, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import { Folder, Database, Upload, Brain, Rocket, Eye, X, Menu, LogOut, View } from "lucide-react";
import './navbar.css';

interface NavbarItem {
  item: string;
  ref: string;
  icon: ReactNode;
}

const Navbar: FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const location = useLocation();
  const navigate = useNavigate();


  const items: NavbarItem[] = [
    { item: "Projects", ref: "/projects", icon: <Folder size={20} color='#ccc'/> },
    { item: "Datalake", ref: "/datalake", icon: <Database size={20} color='#ccc'/> },
    { item: "Upload", ref: "/upload", icon: <Upload size={20} color='#ccc'/> },
    { item: "Models", ref: "/models", icon: <Brain size={20} color='#ccc'/> },
    { item: "Deploy", ref: "/deploy", icon: <Rocket size={20} color='#ccc'/> },
  ];

  const toggleNavbar = (): void => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  useEffect(() => {
    if (location.pathname.includes('/projects/')) {
      setIsExpanded(false);
    }
  }, [location.pathname]);

  return (
    <div className={`navbar ${isExpanded ? 'expand' : 'collapsed'}`}>
      <div>
        <div className="navbar-header">
          <button className="toggle-button" onClick={toggleNavbar}>
            {isExpanded ? <X size={24} color='#ccc'/> : <Menu size={24} color='#ccc' />}
          </button>
          <div className='navbar-title'>
            {<View size={24} color='#ccc'/>}
            {isExpanded && <h2>VisionNest</h2>}
          </div>
        </div>

        <div className="navbar-content">
          {items.map((item, index) => (
            <div className={`navbar-item ${isExpanded ? 'expand' : 'collapsed'}`} key={index}>
              <Link to={item.ref}>
                {item.icon}
                {isExpanded && <span>{item.item}</span>}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="navbar-bottom">
          <button className="logout-button" onClick={handleLogout}>
            {/* <FaUser className="icon" /> */}
            <LogOut size={20} color='#ccc'/>
            {isExpanded && <p>Logout</p>}
          </button>
        </div>
    </div>
  );
};

export default Navbar;