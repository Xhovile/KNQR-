import React, { useState, useRef, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  updateProfile
} from "firebase/auth";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  Chrome, 
  Apple, 
  ArrowRight, 
  HelpCircle, 
  Database, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  RefreshCw
} from "lucide-react";
import { auth } from "../lib/firebase";

interface AuthFormProps {
  onSuccess?: (user: any) => void;
  initialIsSignUp?: boolean;
}

const SANDBOX_CONFIG = `{
  "projectId": "caramel-impulse-p3t6m",
  "appId": "1:15701095090:web:267880beb74c0e22d94fab",
  "apiKey": "AIzaSyCmDwvSDRWE5ydTxSOmNoIDm6nInXVUAs8",
  "authDomain": "caramel-impulse-p3t6m.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-knqronline-41a85d60-4c43-4c9d-a21c-798d67f4ef9f",
  "storageBucket": "caramel-impulse-p3t6m.firebasestorage.app",
  "messagingSenderId": "15701095090",
  "measurementId": ""
}`;

export default function AuthForm({ onSuccess, initialIsSignUp = false }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);

  useEffect(() => {
    setIsSignUp(initialIsSignUp);
  }, [initialIsSignUp]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(true);

  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const handleCopySandbox = async () => {
    try {
      await navigator.clipboard.writeText(SANDBOX_CONFIG);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err: any) {
      console.error("Failed to copy configuration", err?.message || String(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, emailTrimmed, password);
        if (name.trim() && userCredential.user) {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        }
        if (onSuccessRef.current) {
          onSuccessRef.current(userCredential.user);
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, emailTrimmed, password);
        if (onSuccessRef.current) {
          onSuccessRef.current(userCredential.user);
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err?.message || String(err));
      
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        setError(
          <div className="space-y-2">
            <p className="font-semibold text-red-800">Sign-In Provider is Disabled in your Firebase Console</p>
            <p className="text-[11px] text-red-700 leading-normal">
              To resolve this, please log in to your <strong>Firebase Console</strong> for project <strong>knqr-online</strong>, then:
            </p>
            <ol className="list-decimal pl-4 text-[11px] text-red-700 space-y-1">
              <li>Navigate to <strong>Authentication</strong> &gt; <strong>Sign-in method</strong>.</li>
              <li>Click <strong>Add new provider</strong> and choose <strong>Email/Password</strong>, then click <strong>Enable</strong>.</li>
              <li>If you want to use Apple or Google sign in, enable them under the same tab.</li>
            </ol>
          </div>
        );
      } else {
        switch (err.code) {
          case "auth/invalid-email":
            setError("Invalid email address format.");
            break;
          case "auth/user-disabled":
            setError("This account has been disabled.");
            break;
          case "auth/user-not-found":
            setError("No account found with this email.");
            break;
          case "auth/wrong-password":
            setError("Incorrect password. Please try again.");
            break;
          case "auth/email-already-in-use":
            setError("An account with this email already exists.");
            break;
          case "auth/weak-password":
            setError("Password should be at least 6 characters.");
            break;
          case "auth/invalid-credential":
            setError("Invalid credentials. Please verify your email and password.");
            break;
          case "auth/admin-restricted-operation":
            setError("Signup is restricted for this project. Check your Firebase Authentication Settings.");
            break;
          default:
            setError(err.message || "An authentication error occurred.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (onSuccessRef.current && result.user) {
        onSuccessRef.current(result.user);
      }
    } catch (err: any) {
      console.error("Google auth error:", err?.message || String(err));
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        setError(
          <div className="space-y-1 text-left">
            <p className="font-semibold text-red-800">Google Auth Disabled</p>
            <p className="text-[10px] text-red-700 leading-normal">
              Go to <strong>Firebase Console &gt; Authentication &gt; Sign-in method</strong> and enable the <strong>Google</strong> provider for project <strong>knqr-online</strong>.
            </p>
          </div>
        );
      } else if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new OAuthProvider("apple.com");
    try {
      const result = await signInWithPopup(auth, provider);
      if (onSuccessRef.current && result.user) {
        onSuccessRef.current(result.user);
      }
    } catch (err: any) {
      console.error("Apple auth error:", err?.message || String(err));
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        setError(
          <div className="space-y-1 text-left">
            <p className="font-semibold text-red-800">Apple Auth Disabled</p>
            <p className="text-[10px] text-red-700 leading-normal">
              Go to <strong>Firebase Console &gt; Authentication &gt; Sign-in method</strong> and enable the <strong>Apple</strong> provider for project <strong>knqr-online</strong>.
            </p>
          </div>
        );
      } else if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Failed to sign in with Apple.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 space-y-6">
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-white border border-gray-100 rounded-2xl shadow-xl w-full" id="knqr-auth-form-container">
        <div className="text-center mb-6">
          <h2 className="font-serif text-3xl text-chocolate mb-2 uppercase tracking-widest">KNQR</h2>
          <p className="text-xs text-chocolate/60 tracking-[0.2em] font-mono uppercase">Bespoke Apparel & Accessories</p>
        </div>

        {/* Modern Tabs */}
        <div className="flex w-full border-b border-gray-100 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`flex-1 pb-3 text-xs font-mono uppercase tracking-wider font-semibold transition-all border-b-2 cursor-pointer ${
              !isSignUp 
                ? "border-gold text-chocolate" 
                : "border-transparent text-chocolate/40 hover:text-chocolate/70"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            className={`flex-1 pb-3 text-xs font-mono uppercase tracking-wider font-semibold transition-all border-b-2 cursor-pointer ${
              isSignUp 
                ? "border-gold text-chocolate" 
                : "border-transparent text-chocolate/40 hover:text-chocolate/70"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[10px] font-mono tracking-wider uppercase text-chocolate/60">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-chocolate/30" />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-chocolate/20 rounded-lg pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-gold text-chocolate placeholder-chocolate/30"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-mono tracking-wider uppercase text-chocolate/60">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-chocolate/30" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-chocolate/20 rounded-lg pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-gold text-chocolate placeholder-chocolate/30"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono tracking-wider uppercase text-chocolate/60">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-chocolate/30" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-chocolate/20 rounded-lg pl-9 pr-10 py-2 text-xs font-mono focus:outline-none focus:border-gold text-chocolate placeholder-chocolate/30"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-chocolate/30 hover:text-chocolate/70 focus:outline-none cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[10px] font-mono tracking-wider uppercase text-chocolate/60">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-chocolate/30" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-chocolate/20 rounded-lg pl-9 pr-10 py-2 text-xs font-mono focus:outline-none focus:border-gold text-chocolate placeholder-chocolate/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2 text-chocolate/30 hover:text-chocolate/70 focus:outline-none cursor-pointer p-1"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-[11px] font-mono leading-relaxed border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 text-left">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-chocolate text-cream hover:bg-gold hover:text-chocolate py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all font-medium disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                Logging In...
              </>
            ) : (
              <span className="flex items-center gap-1">
                {isSignUp ? "Create Account" : "Log In"}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-5 items-center w-full">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-[10px] font-mono text-chocolate/40 uppercase tracking-widest">or continue with</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        {/* Federated Identity Providers */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-chocolate rounded-xl text-xs font-mono uppercase shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-chocolate rounded-xl text-xs font-mono uppercase shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Apple className="w-4 h-4 text-black fill-black shrink-0" />
            Apple
          </button>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-4 w-full text-center">
          <p className="text-[10px] text-chocolate/40 leading-relaxed font-mono">
            Note: Authenticators are securely hosted. Make sure Identity Providers (Google/Apple/Email) are enabled in your console settings.
          </p>
        </div>
      </div>

    </div>
  );
}
