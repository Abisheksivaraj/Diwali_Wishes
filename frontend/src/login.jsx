import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Server } from "lucide-react";

const EmailLogin = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    smtpHost: "",
    smtpPort: "587",
    smtpSecure: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("emailUser");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    }
  }, [onLoginSuccess]);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      if (!credentials.email || !credentials.password) {
        throw new Error("Email and password are required");
      }

      // Auto-detect SMTP settings
      const domain = credentials.email.split("@")[1];
      let smtpHost = credentials.smtpHost;
      let smtpPort = credentials.smtpPort;

      if (!smtpHost) {
        const smtpMap = {
          "gmail.com": { host: "smtp.gmail.com", port: 587 },
          "outlook.com": { host: "smtp-mail.outlook.com", port: 587 },
          "yahoo.com": { host: "smtp.mail.yahoo.com", port: 587 },
          "hotmail.com": { host: "smtp-mail.outlook.com", port: 587 },
          "atplgroup.com": { host: "smtp.rediffmailpro.com", port: 587 },
        };

        if (smtpMap[domain]) {
          smtpHost = smtpMap[domain].host;
          smtpPort = smtpMap[domain].port;
        } else {
          smtpHost = `smtp.${domain}`;
        }
      }

      // Verify SMTP credentials with backend
      const response = await fetch("/api/verify-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpSecure: credentials.smtpSecure,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Invalid credentials or SMTP configuration"
        );
      }

      const result = await response.json();

      const userData = {
        email: credentials.email,
        name: credentials.email.split("@")[0],
        smtpHost,
        smtpPort,
        smtpSecure: credentials.smtpSecure,
        sessionToken: result.sessionToken,
        loginTime: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem("emailUser", JSON.stringify(userData));

      // Clear form
      setCredentials({
        email: "",
        password: "",
        smtpHost: "",
        smtpPort: "587",
        smtpSecure: false,
      });

      // Navigate to main app
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Bulk Mail Sender</h1>
          <p className="text-gray-600 mt-2">Login with your SMTP credentials</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your email password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <details className="border rounded-lg">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
              Advanced SMTP Settings (Optional)
            </summary>

            <div className="p-4 pt-2 space-y-3 bg-gray-50">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  SMTP Host
                </label>
                <div className="relative">
                  <Server className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={credentials.smtpHost}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        smtpHost: e.target.value,
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Auto-detected from email"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={credentials.smtpPort}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        smtpPort: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    SSL/TLS
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={credentials.smtpSecure}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          smtpSecure: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Secure</span>
                  </label>
                </div>
              </div>
            </div>
          </details>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              "Login & Continue"
            )}
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Security Note:</strong> Your credentials are verified with
            your SMTP server and used only for sending emails.
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need help? Check your email provider's SMTP settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailLogin;
