import React from "react";
import { Link } from "react-router-dom";
import { Activity, ShieldCheck, Heart, PhoneCall, Mail, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                Cura<span className="text-teal-600 dark:text-teal-400">Pulse</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Connecting patients with top-tier verified doctors and premier medical institutions. Empowering your wellness journey with expert clinical content and seamless booking.
            </p>
            <div className="flex items-center space-x-2 text-xs text-teal-600 dark:text-teal-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA Compliant & Verified Physicians</span>
            </div>
          </div>

          {/* Quick Specialties */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Top Specialties
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/doctors?specialty=Cardiology" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Cardiology & Heart Health
                </Link>
              </li>
              <li>
                <Link to="/doctors?specialty=Dermatology" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Dermatology & Skin Care
                </Link>
              </li>
              <li>
                <Link to="/doctors?specialty=Pediatrics" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Pediatrics & Child Wellness
                </Link>
              </li>
              <li>
                <Link to="/doctors?specialty=Neurology" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Neurology & Brain Health
                </Link>
              </li>
              <li>
                <Link to="/doctors?specialty=Orthopedics" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Orthopedics & Joint Surgery
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Explore CuraPulse
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/feed" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Doctor Health Feed & Reels
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Doctor Directory
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Partner Hospitals & Centers
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Doctor Portal Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Join as Medical Provider
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Helpline */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              24/7 Patient Helpline
            </h4>
            <div className="p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 space-y-2">
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold text-sm">
                <PhoneCall className="w-4 h-4" />
                <span>Emergency: 911 / 112</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                For life-threatening emergencies, contact emergency services immediately.
              </p>
            </div>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-600" />
                <span>support@curapulse-health.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>New York, NY 10017, USA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} CuraPulse Healthcare Inc. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for patients & doctors worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};