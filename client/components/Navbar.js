"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X, User, LogOut, Settings, Home, Plus } from "lucide-react";

const Navbar = () => {
    const { user, userProfile, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setIsProfileOpen(false);
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                🧘‍♀️
                            </span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            Meditation MVP
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
                        >
                            Home
                        </Link>
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/create"
                                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <Plus size={16} />
                                    <span>Create Meditation</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* User Profile Dropdown */}
                    {user && (
                        <div className="hidden md:block relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
                            >
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <User
                                        size={16}
                                        className="text-primary-600"
                                    />
                                </div>
                                <span className="text-sm font-medium">
                                    {userProfile?.name ||
                                        user.displayName ||
                                        "User"}
                                </span>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <Link
                                        href="/profile"
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Settings size={16} />
                                        <span>Settings</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                    >
                                        <LogOut size={16} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 flex items-center space-x-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Home size={16} />
                                <span>Home</span>
                            </Link>

                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/create"
                                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Plus size={16} />
                                        <span>Create Meditation</span>
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="text-gray-700 hover:text-primary-600 transition-colors duration-200 flex items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Settings size={16} />
                                        <span>Settings</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-700 hover:text-primary-600 transition-colors duration-200 flex items-center space-x-2 text-left"
                                    >
                                        <LogOut size={16} />
                                        <span>Sign Out</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
