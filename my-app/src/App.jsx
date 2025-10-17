import React, { useState, useRef } from "react";
import { Download, Type, Upload, FileSpreadsheet, Send, X } from "lucide-react";
import * as XLSX from "xlsx";
import diwali from "../src/assets/Diwali.jpg";

const API_URL =
  window.location.hostname === "localhost"
    ? "https://boston-beholdable-jami.ngrok-free.dev"
    : "https://boston-beholdable-jami.ngrok-free.dev";

const App = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [fontFamily, setFontFamily] = useState("Verdana");
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#e85874");
  const [fontWeight, setFontWeight] = useState("900");
  const [textAlign, setTextAlign] = useState("center");
  const [excelData, setExcelData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [emailSubject, setEmailSubject] = useState(
    "Diwali Wishes from Archery Technocrats Pvt Ltd"
  );
  const [emailMessage, setEmailMessage] = useState(
    "As we celebrate the Festival of Lights, we extend our heartfelt gratitude for your continued trust and partnership. Your support and collaboration have been an integral part of our success.\n\nMay this Diwali bring joy, prosperity, and new opportunities to your business. Wishing you and your family a season filled with light, happiness, and togetherness."
  );

  const [sendingStatus, setSendingStatus] = useState([]);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const cardRef = useRef(null);
  const fileInputRef = useRef(null);

  const diwaliImage = diwali;

  const exportCardToBase64 = async (fName, lName) => {
    return new Promise((resolve) => {
      if (cardRef.current) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 800;
        canvas.height = 1200;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 800, 1200);
          ctx.fillStyle = fontColor;
          ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.textAlign = textAlign;
          ctx.textBaseline = "middle";

          const x =
            textAlign === "center" ? 400 : textAlign === "left" ? 50 : 750;
          const baseY = 1200 * 0.62;

          if (fName) {
            if (lName) {
              ctx.fillText(fName, x, baseY - fontSize / 2);
              ctx.fillText(lName, x, baseY + fontSize / 2);
            } else {
              ctx.fillText(fName, x, baseY);
            }
          }

          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
        };
        img.src = diwaliImage;
      } else {
        resolve(null);
      }
    });
  };

  // NEW: Function to send email via backend API
  const sendEmailViaAPI = async (recipientEmail, fName, lName, imageBase64) => {
    try {
      const response = await fetch(`${API_URL}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: recipientEmail,
          firstName: fName,
          lastName: lName,
          subject: emailSubject,
          message: emailMessage,
          imageBase64: imageBase64,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return { success: true, ...result };
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const formattedData = data
          .map((row) => {
            const firstName =
              row["First name"] ||
              row["First Name"] ||
              row["FIRST NAME"] ||
              row["first name"] ||
              row["FirstName"] ||
              row["firstname"] ||
              "";
            const lastName =
              row["Last name"] ||
              row["Last Name"] ||
              row["LAST NAME"] ||
              row["last name"] ||
              row["LastName"] ||
              row["lastname"] ||
              "";
            const emailAddr =
              row["Mail ID"] ||
              row["MAIL ID"] ||
              row["mail id"] ||
              row["Email"] ||
              row["EMAIL"] ||
              row["email"] ||
              row["MAIL_ID"] ||
              row["Mail Id"] ||
              "";

            return {
              firstName: firstName.toString().trim(),
              lastName: lastName.toString().trim(),
              email: emailAddr.toString().trim(),
            };
          })
          .filter((item) => {
            const hasEmail = item.email && item.email.length > 0;
            const hasFirstName = item.firstName && item.firstName.length > 0;
            return hasEmail && hasFirstName;
          });

        if (formattedData.length === 0) {
          alert("⚠️ No valid contacts found!");
        } else {
          setExcelData(formattedData);
          setCurrentIndex(-1);
          setSendingStatus([]);
          setSuccessCount(0);
          setFailCount(0);
          alert(`✅ Loaded ${formattedData.length} contacts`);
        }
      } catch (error) {
        alert("❌ Error reading Excel file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const sendBulkEmails = async () => {
    if (excelData.length === 0) {
      alert("Please upload an Excel file first.");
      return;
    }

    setIsProcessing(true);
    setCancelRequested(false);
    setSendingStatus([]);
    setSuccessCount(0);
    setFailCount(0);
    let tempSuccessCount = 0;
    let tempFailCount = 0;

    for (let i = 0; i < excelData.length; i++) {
      if (cancelRequested) {
        setIsProcessing(false);
        setCurrentIndex(-1);
        alert(
          `⚠️ Bulk send cancelled!\n${tempSuccessCount} sent\n${tempFailCount} failed\n${
            excelData.length - i
          } skipped`
        );
        return;
      }

      const contact = excelData[i];
      setCurrentIndex(i);
      setFirstName(contact.firstName);
      setLastName(contact.lastName);
      setEmail(contact.email);

      try {
        const imageBase64 = await exportCardToBase64(
          contact.firstName,
          contact.lastName
        );

        // FIXED: Actually send the email via API
        await sendEmailViaAPI(
          contact.email,
          contact.firstName,
          contact.lastName,
          imageBase64
        );

        tempSuccessCount++;
        setSuccessCount(tempSuccessCount);
        setSendingStatus((prev) => [
          ...prev,
          {
            email: contact.email,
            name: `${contact.firstName} ${contact.lastName}`,
            status: "success",
          },
        ]);

        // Delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to send to ${contact.email}:`, error);
        tempFailCount++;
        setFailCount(tempFailCount);
        setSendingStatus((prev) => [
          ...prev,
          {
            email: contact.email,
            name: `${contact.firstName} ${contact.lastName}`,
            status: "failed",
            error: error.message,
          },
        ]);
      }
    }

    setIsProcessing(false);
    setCurrentIndex(-1);
    setCancelRequested(false);
    alert(
      `✅ Bulk send complete!\n${tempSuccessCount} sent\n${tempFailCount} failed`
    );
  };

  const cancelBulkSend = () => {
    setCancelRequested(true);
  };

  const sendEmail = async () => {
    if (!email || !firstName) {
      alert("Please enter both email and first name.");
      return;
    }

    setIsProcessing(true);

    try {
      const imageBase64 = await exportCardToBase64(firstName, lastName);

      // FIXED: Actually send the email via API
      await sendEmailViaAPI(email, firstName, lastName, imageBase64);

      alert(`✅ Email sent successfully to ${email}`);
    } catch (error) {
      console.error("Error sending email:", error);
      alert(`❌ Error sending email: ${error.message}`);
    }

    setIsProcessing(false);
  };

  return (
    <div
      className="w-screen h-screen p-8 flex gap-8 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #F5F7F9 0%, #E8EDF1 100%)",
      }}
    >
      {/* Left Panel - Wider */}
      <div
        className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col overflow-hidden"
        style={{
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(56, 71, 79, 0.12)",
          border: "1px solid rgba(56, 71, 79, 0.08)",
          maxWidth: "900px",
        }}
      >
        <div className="mb-6">
          <h2
            className="text-4xl font-bold mb-2 flex items-center gap-3"
            style={{
              fontFamily: "Oswald, sans-serif",
              color: "#38474F",
              letterSpacing: "0.5px",
            }}
          >
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "#FDD7E0" }}
            >
              <Type size={32} style={{ color: "#E85874" }} />
            </div>
            GREETING CARD GENERATOR
          </h2>
          <p
            className="text-base"
            style={{
              color: "#8A9BA5",
              fontFamily: "system-ui, sans-serif",
              lineHeight: "1.6",
            }}
          >
            Create personalized Diwali greeting cards and send them via email
          </p>
        </div>

        <div
          className="flex-1 overflow-y-auto pr-4 grid grid-cols-2 gap-6"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#E85874 #F5F7F9" }}
        >
          {/* Left Column */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label
                className="block font-semibold text-sm"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  color: "#38474F",
                  fontSize: "13px",
                  letterSpacing: "0.3px",
                }}
              >
                FIRST NAME
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border-2 px-4 py-3 rounded-lg text-sm transition-all"
                placeholder="Enter first name"
                style={{
                  borderColor: "#E0E4E7",
                  fontFamily: "system-ui, sans-serif",
                  color: "#38474F",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#39A3DD";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(57, 163, 221, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E4E7";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="block font-semibold text-sm"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  color: "#38474F",
                  fontSize: "13px",
                  letterSpacing: "0.3px",
                }}
              >
                LAST NAME
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border-2 px-4 py-3 rounded-lg text-sm transition-all"
                placeholder="Enter last name"
                style={{
                  borderColor: "#E0E4E7",
                  fontFamily: "system-ui, sans-serif",
                  color: "#38474F",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#39A3DD";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(57, 163, 221, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E4E7";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="block font-semibold text-sm"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  color: "#38474F",
                  fontSize: "13px",
                  letterSpacing: "0.3px",
                }}
              >
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 px-4 py-3 rounded-lg text-sm transition-all"
                placeholder="Enter email address"
                style={{
                  borderColor: "#E0E4E7",
                  fontFamily: "system-ui, sans-serif",
                  color: "#38474F",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#39A3DD";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(57, 163, 221, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E4E7";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label
                  className="block text-sm font-semibold"
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    color: "#38474F",
                    fontSize: "13px",
                    letterSpacing: "0.3px",
                  }}
                >
                  FONT
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full border-2 px-3 py-3 rounded-lg text-sm"
                  style={{
                    borderColor: "#E0E4E7",
                    fontFamily: "system-ui, sans-serif",
                    color: "#38474F",
                    outline: "none",
                  }}
                >
                  <option>Verdana</option>
                  <option>Oswald</option>
                  <option>Arial</option>
                  <option>Georgia</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label
                  className="block text-sm font-semibold"
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    color: "#38474F",
                    fontSize: "13px",
                    letterSpacing: "0.3px",
                  }}
                >
                  SIZE
                </label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full border-2 px-3 py-3 rounded-lg text-sm"
                  style={{
                    borderColor: "#E0E4E7",
                    fontFamily: "system-ui, sans-serif",
                    color: "#38474F",
                    outline: "none",
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className="block text-sm font-semibold"
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    color: "#38474F",
                    fontSize: "13px",
                    letterSpacing: "0.3px",
                  }}
                >
                  COLOR
                </label>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer"
                  style={{ border: "2px solid #E0E4E7" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-sm font-semibold"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  color: "#38474F",
                  fontSize: "13px",
                  letterSpacing: "0.3px",
                }}
              >
                EMAIL SUBJECT
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full border-2 px-4 py-3 rounded-lg text-sm"
                style={{
                  borderColor: "#E0E4E7",
                  fontFamily: "system-ui, sans-serif",
                  color: "#38474F",
                  outline: "none",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-sm font-semibold"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  color: "#38474F",
                  fontSize: "13px",
                  letterSpacing: "0.3px",
                }}
              >
                EMAIL MESSAGE
              </label>
              <textarea
                rows={6}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="w-full border-2 px-4 py-3 rounded-lg text-sm resize-none"
                style={{
                  borderColor: "#E0E4E7",
                  fontFamily: "system-ui, sans-serif",
                  color: "#38474F",
                  lineHeight: "1.6",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="hidden"
              />

              {excelData.length > 0 && (
                <div
                  className="text-sm px-4 py-3 rounded-lg flex items-center gap-2"
                  style={{
                    backgroundColor: "#D4EAF7",
                    color: "#2A7FAF",
                    fontFamily: "Oswald, sans-serif",
                    border: "1px solid #6BB9E5",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#39A3DD" }}
                  ></div>
                  {excelData.length} CONTACTS LOADED
                </div>
              )}

              {excelData.length > 0 && !isProcessing && (
                <button
                  onClick={sendBulkEmails}
                  className="w-full py-3.5 flex items-center justify-center gap-3 text-white rounded-lg font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: "#E85874",
                    fontFamily: "Oswald, sans-serif",
                    borderRadius: "10px",
                    letterSpacing: "0.5px",
                    boxShadow: "0 4px 12px rgba(232, 88, 116, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#C4455D";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(232, 88, 116, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#E85874";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(232, 88, 116, 0.25)";
                  }}
                >
                  <FileSpreadsheet size={18} />
                  SEND BULK ({excelData.length})
                </button>
              )}

              {isProcessing && excelData.length > 0 && (
                <>
                  <div
                    className="p-5 rounded-xl border-2"
                    style={{
                      backgroundColor: "rgba(212, 234, 247, 0.5)",
                      borderColor: "#39A3DD",
                      borderRadius: "12px",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: "#2A7FAF",
                          fontFamily: "Oswald, sans-serif",
                          letterSpacing: "0.5px",
                        }}
                      >
                        PROCESSING
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{ backgroundColor: "#39A3DD", color: "white" }}
                      >
                        {currentIndex + 1} / {excelData.length}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2.5 mb-3 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all"
                        style={{
                          width: `${
                            ((currentIndex + 1) / excelData.length) * 100
                          }%`,
                          backgroundColor: "#39A3DD",
                        }}
                      ></div>
                    </div>
                    <div
                      className="flex gap-3 text-sm"
                      style={{ fontFamily: "system-ui, sans-serif" }}
                    >
                      <span style={{ color: "#4CAF50" }}>
                        ✓ Sent: {successCount}
                      </span>
                      <span style={{ color: "#E85874" }}>
                        ✗ Failed: {failCount}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={cancelBulkSend}
                    className="w-full py-3.5 flex items-center justify-center gap-3 text-white rounded-lg font-semibold text-sm transition-all"
                    style={{
                      backgroundColor: "#8A9BA5",
                      fontFamily: "Oswald, sans-serif",
                      borderRadius: "10px",
                      letterSpacing: "0.5px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#38474F";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#8A9BA5";
                    }}
                  >
                    <X size={18} />
                    CANCEL BULK SEND
                  </button>
                </>
              )}

              {sendingStatus.length > 0 && (
                <div
                  className="max-h-32 overflow-y-auto rounded-lg p-2 border text-sm space-y-1"
                  style={{
                    backgroundColor: "#F5F7F9",
                    borderColor: "#E0E4E7",
                    borderRadius: "8px",
                  }}
                >
                  {sendingStatus.slice(-8).map((status, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded"
                      style={{
                        backgroundColor:
                          status.status === "success" ? "#D4EAF7" : "#FDD7E0",
                        color:
                          status.status === "success" ? "#2A7FAF" : "#C4455D",
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "13px",
                      }}
                    >
                      {status.status === "success" ? "✓" : "✗"} {status.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div
          className="grid grid-cols-3 gap-4 mt-6 pt-6"
          style={{ borderTop: "2px solid #E0E4E7" }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-4 flex items-center justify-center gap-3 text-white rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: "#39A3DD",
              fontFamily: "Oswald, sans-serif",
              borderRadius: "10px",
              letterSpacing: "0.5px",
              boxShadow: "0 4px 12px rgba(57, 163, 221, 0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2A7FAF";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(57, 163, 221, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#39A3DD";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(57, 163, 221, 0.25)";
            }}
          >
            <Upload size={20} />
            UPLOAD
          </button>

          <button
            onClick={sendEmail}
            disabled={isProcessing}
            className="py-4 flex items-center justify-center gap-3 text-white rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: isProcessing ? "#8A9BA5" : "#E85874",
              fontFamily: "Oswald, sans-serif",
              borderRadius: "10px",
              letterSpacing: "0.5px",
              boxShadow: isProcessing
                ? "none"
                : "0 4px 12px rgba(232, 88, 116, 0.25)",
              cursor: isProcessing ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) =>
              !isProcessing &&
              ((e.currentTarget.style.backgroundColor = "#C4455D"),
              (e.currentTarget.style.transform = "translateY(-2px)"),
              (e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(232, 88, 116, 0.35)"))
            }
            onMouseLeave={(e) =>
              !isProcessing &&
              ((e.currentTarget.style.backgroundColor = "#E85874"),
              (e.currentTarget.style.transform = "translateY(0)"),
              (e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(232, 88, 116, 0.25)"))
            }
          >
            <Send size={20} />
            SEND SINGLE
          </button>

          <button
            onClick={async () => {
              const img = await exportCardToBase64(firstName, lastName);
              const link = document.createElement("a");
              link.download = `diwali-card-${firstName || "greeting"}.png`;
              link.href = img;
              link.click();
            }}
            className="py-4 flex items-center justify-center gap-3 text-white rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: "#39A3DD",
              fontFamily: "Oswald, sans-serif",
              borderRadius: "10px",
              letterSpacing: "0.5px",
              boxShadow: "0 4px 12px rgba(57, 163, 221, 0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2A7FAF";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(57, 163, 221, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#39A3DD";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(57, 163, 221, 0.25)";
            }}
          >
            <Download size={20} />
            DOWNLOAD
          </button>
        </div>
      </div>

      {/* Right Panel - Card Preview */}
      <div
        className="flex flex-col items-center justify-center gap-6"
        style={{ width: "400px" }}
      >
        <h3
          className="text-2xl font-bold"
          style={{
            fontFamily: "Oswald, sans-serif",
            color: "#38474F",
            letterSpacing: "0.5px",
          }}
        >
          CARD PREVIEW
        </h3>
        <div
          ref={cardRef}
          className="relative bg-white rounded-xl overflow-hidden"
          style={{
            width: "360px",
            height: "540px",
            boxShadow: "0 12px 40px rgba(56, 71, 79, 0.2)",
            borderRadius: "16px",
            border: "2px solid rgba(56, 71, 79, 0.08)",
          }}
        >
          <img
            src={diwaliImage}
            alt="Diwali"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute"
            style={{
              top: "62%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              textAlign,
              padding: "0 30px",
            }}
          >
            <p
              style={{
                fontFamily,
                fontSize: `${fontSize * 0.7}px`,
                color: fontColor,
                fontWeight,
                textShadow: "2px 2px 6px rgba(0,0,0,0.4)",
                margin: 0,
              }}
            >
              {firstName || "First Name"}
            </p>
            {lastName && (
              <p
                style={{
                  fontFamily,
                  fontSize: `${fontSize * 0.7}px`,
                  color: fontColor,
                  fontWeight,
                  textShadow: "2px 2px 6px rgba(0,0,0,0.4)",
                  margin: 0,
                  marginTop: "6px",
                }}
              >
                {lastName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
