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

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
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
                Securing Session...
              </>
            ) : (
              <span className="flex items-center gap-1">
                {isSignUp ? "Create Account" : "Access Session"}
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
            className="flex items-center justify-center gap-2 px-3 py-2.5 border border-chocolate/10 bg-gray-50/50 rounded-xl text-xs font-mono uppercase hover:bg-chocolate hover:text-cream transition-all cursor-pointer disabled:opacity-50"
          >
            <Chrome className="w-3.5 h-3.5 text-chocolate/70" />
            Google
          </button>
          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 py-2.5 border border-chocolate/10 bg-gray-50/50 rounded-xl text-xs font-mono uppercase hover:bg-chocolate hover:text-cream transition-all cursor-pointer disabled:opacity-50"
          >
            <Apple className="w-3.5 h-3.5 text-chocolate/70" />
            Apple
          </button>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-4 w-full text-center">
          <p className="text-[10px] text-chocolate/40 leading-relaxed font-mono">
            Note: Authenticators are securely hosted. Make sure Identity Providers (Google/Apple/Email) are enabled in your console settings.
          </p>
        </div>
      </div>

      {/* Troubleshooting & Database Recovery Panel */}
      <div className="bg-amber-50/35 border border-amber-500/10 rounded-2xl p-5 shadow-sm text-chocolate space-y-4">
        <button
          onClick={() => setShowTroubleshoot(!showTroubleshoot)}
          className="flex items-center justify-between w-full font-mono text-xs uppercase tracking-wider font-semibold hover:text-amber-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 animate-pulse" />
            Active Project & Data Diagnostics
          </span>
          {showTroubleshoot ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTroubleshoot && (
          <div className="space-y-4 text-xs font-mono leading-relaxed divide-y divide-amber-500/10">
            <div className="pt-2">
              <span className="font-semibold text-amber-800 uppercase text-[10px] block mb-1">🔍 Why are Sign-In / Sign-Up failing?</span>
              <p className="text-[11px] text-chocolate/80">
                You recently switched your Firebase configuration to <strong>knqr-online</strong>. In empty/new Firebase projects, authentication providers are disabled by default. 
                Please go to your <strong className="text-amber-800">Firebase Console &gt; Authentication &gt; Sign-in method</strong> and enable the <strong>Email/Password</strong> provider.
              </p>
            </div>

            <div className="pt-3">
              <span className="font-semibold text-amber-800 uppercase text-[10px] block mb-1 flex items-center gap-1">
                <Database className="w-3 h-3 text-amber-600" /> 
                Why are my previous listings gone?
              </span>
              <p className="text-[11px] text-chocolate/80">
                Your custom listings were stored in the original AI Studio Sandbox project. By switching to your own project (<strong>knqr-online</strong>), the app looks at a fresh, empty database.
              </p>
            </div>

            <div className="pt-3 space-y-2">
              <span className="font-semibold text-amber-800 uppercase text-[10px] block">💡 How to restore original sandbox data & sign in immediately?</span>
              <p className="text-[11px] text-chocolate/80">
                You can switch back to the sandbox database at any time. Simply copy the JSON configuration block below, open <strong>/firebase-applet-config.json</strong> in your code editor, paste it, and save.
              </p>
              
              <div className="relative bg-white/85 border border-chocolate/15 rounded-lg p-2 text-[10px] overflow-x-auto max-h-36">
                <button
                  onClick={handleCopySandbox}
                  className="absolute right-2 top-2 bg-chocolate text-cream hover:bg-gold hover:text-chocolate px-2 py-1 rounded text-[9px] font-mono transition-all flex items-center gap-1 uppercase"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy Config"}
                </button>
                <pre>{SANDBOX_CONFIG}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
