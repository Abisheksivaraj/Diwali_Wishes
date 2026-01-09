import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Send,
  X,
  AlertCircle,
  FileSpreadsheet,
  Paperclip,
  Trash2,
  Image as ImageIcon,
  Mail,
  Edit3,
  Save,
  Layers,
  Eye,
  EyeOff,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ChevronDown,
  Link as LinkIcon,
  ListOrdered,
  Table,
  Type,
  Palette,
  Menu,
  Users,
  Settings,
  Target,
  LogOut,
  Home,
} from "lucide-react";
import * as XLSX from "xlsx";

import logo from "./assets/logo.jpg";

import api from "../src/apiConfig";

// Rich Text Editor Component with Enhanced Features
// ENHANCED Rich Text Editor Component - FIXED LINE BREAK HANDLING
// Replace your existing RichTextEditor component with this one

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  height = "200px",
  showVariables = false,
  onVariableInsert,
}) => {
  const editorRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized && value) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // CRITICAL FIX: Force paragraph mode in contentEditable
  useEffect(() => {
    if (editorRef.current) {
      // Set default paragraph separator to create <p> tags on Enter
      try {
        document.execCommand("defaultParagraphSeparator", false, "p");
      } catch (e) {
        console.log("Could not set paragraph separator");
      }
    }
  }, []);

  const fonts = [
    "Arial",
    "Times New Roman",
    "Georgia",
    "Courier New",
    "Verdana",
    "Tahoma",
    "Trebuchet MS",
    "Palatino Linotype",
    "Garamond",
    "Comic Sans MS",
    "Impact",
    "Lucida Console",
    "Calibri",
    "Cambria",
    "Segoe UI",
  ];

  const colors = [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#B7B7B7",
    "#CCCCCC",
    "#D9D9D9",
    "#EFEFEF",
    "#F3F3F3",
    "#FFFFFF",
    "#980000",
    "#FF0000",
    "#FF9900",
    "#FFFF00",
    "#00FF00",
    "#00FFFF",
    "#4A86E8",
    "#0000FF",
    "#9900FF",
    "#FF00FF",
    "#E6B8AF",
    "#F4CCCC",
    "#FCE5CD",
    "#FFF2CC",
    "#D9EAD3",
    "#D0E0E3",
    "#C9DAF8",
    "#CFE2F3",
    "#D9D2E9",
    "#EAD1DC",
  ];

  const fontSizes = [
    8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72,
  ];

  const lineHeights = [
    { label: "Single", value: "1" },
    { label: "1.15", value: "1.15" },
    { label: "1.5", value: "1.5" },
    { label: "Double", value: "2" },
    { label: "2.5", value: "2.5" },
    { label: "3.0", value: "3" },
  ];

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // ENHANCED: Handle input with proper formatting preservation
  const handleInput = (e) => {
    let html = e.currentTarget.innerHTML;

    // Ensure proper spacing between elements
    html = html.replace(/<\/div><div>/g, "</div>\n<div>");
    html = html.replace(/<\/p><p>/g, "</p>\n<p>");

    onChange(html);
  };

  // ENHANCED: Handle keyboard events to ensure proper line breaks
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Let the browser handle Enter normally (will create <p> or <div>)
      // But ensure it's creating proper block elements
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        // The browser will handle this, just make sure we update the content
        setTimeout(() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }, 0);
      }
    }
  };

  const applyLineHeight = (height) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.style.lineHeight = height;
      range.surroundContents(span);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const insertTable = () => {
    const rows = prompt("Number of rows:", "3");
    const cols = prompt("Number of columns:", "3");

    if (rows && cols) {
      let tableHTML =
        '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += "<tr>";
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML +=
            '<td style="border: 1px solid #ddd; padding: 8px;">&nbsp;</td>';
        }
        tableHTML += "</tr>";
      }
      tableHTML += "</table><p>&nbsp;</p>";

      document.execCommand("insertHTML", false, tableHTML);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = `<img src="${event.target.result}" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
      document.execCommand("insertHTML", false, img);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };
    reader.readAsDataURL(file);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const insertVariable = (variable) => {
    const varSpan = `<span style="background-color: #D4EAF7; padding: 2px 8px; border-radius: 4px; color: #39A3DD; font-weight: 600;">{{${variable}}}</span>&nbsp;`;
    document.execCommand("insertHTML", false, varSpan);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyFont = (fontName) => {
    execCommand("fontName", fontName);
    setShowFontPicker(false);
  };

  const applyColor = (color) => {
    execCommand("foreColor", color);
    setShowColorPicker(false);
  };

  const applyBgColor = (color) => {
    execCommand("hiliteColor", color);
    setShowBgColorPicker(false);
  };

  const applyFontSize = (size) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = size + "px";
      range.surroundContents(span);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  return (
    <div className="border rounded-lg" style={{ borderColor: "#E0E4E7" }}>
      <style>
        {`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #8A9BA5;
            cursor: text;
          }
          [contenteditable]:focus {
            outline: none;
          }
          /* Ensure proper spacing for block elements in editor */
          [contenteditable] p {
            margin: 0 0 1em 0;
          }
          [contenteditable] div {
            min-height: 1em;
          }
        `}
      </style>
      <div
        className="flex items-center gap-1 p-2 border-b flex-wrap"
        style={{ backgroundColor: "#F5F7F9", borderColor: "#E0E4E7" }}
      >
        {showVariables && (
          <div
            className="flex items-center gap-1 pr-2 mr-2 border-r"
            style={{ borderColor: "#E0E4E7" }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: "#8A9BA5" }}
            >
              Variables:
            </span>
            <button
              type="button"
              onClick={() => insertVariable("firstName")}
              className="px-2 py-1 text-xs rounded"
              style={{ backgroundColor: "#D4EAF7", color: "#39A3DD" }}
            >
              firstName
            </button>
            <button
              type="button"
              onClick={() => insertVariable("lastName")}
              className="px-2 py-1 text-xs rounded"
              style={{ backgroundColor: "#D4EAF7", color: "#39A3DD" }}
            >
              lastName
            </button>
            <button
              type="button"
              onClick={() => insertVariable("email")}
              className="px-2 py-1 text-xs rounded"
              style={{ backgroundColor: "#D4EAF7", color: "#39A3DD" }}
            >
              email
            </button>
          </div>
        )}

        {/* Font Family Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontPicker(!showFontPicker)}
            className="px-3 py-2 rounded hover:bg-gray-200 flex items-center gap-1 text-sm border"
            style={{ borderColor: "#E0E4E7" }}
            title="Font Family"
          >
            <Type size={16} />
            <ChevronDown size={12} />
          </button>
          {showFontPicker && (
            <div
              className="absolute top-full left-0 mt-1 bg-white border-2 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
              style={{ borderColor: "#E0E4E7", minWidth: "180px" }}
            >
              {fonts.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => applyFont(font)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm"
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <select
          onChange={(e) => applyFontSize(e.target.value)}
          className="px-2 py-2 text-sm rounded border"
          style={{ borderColor: "#E0E4E7" }}
          title="Font Size"
          defaultValue=""
        >
          <option value="" disabled>
            Size
          </option>
          {fontSizes.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-200 flex items-center gap-1"
            title="Text Color"
          >
            <Palette size={16} />
            <ChevronDown size={12} />
          </button>
          {showColorPicker && (
            <div
              className="absolute top-full left-0 mt-1 bg-white border-2 rounded-lg shadow-lg z-50 p-2"
              style={{ borderColor: "#E0E4E7", width: "240px" }}
            >
              <div className="grid grid-cols-10 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyColor(color)}
                    className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color, borderColor: "#ccc" }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            className="p-2 rounded hover:bg-gray-200 flex items-center gap-1"
            title="Background Color"
          >
            <div
              className="w-4 h-4 rounded"
              style={{
                background: "linear-gradient(135deg, #FFD700 50%, #FF69B4 50%)",
                border: "1px solid #ccc",
              }}
            ></div>
            <ChevronDown size={12} />
          </button>
          {showBgColorPicker && (
            <div
              className="absolute top-full left-0 mt-1 bg-white border-2 rounded-lg shadow-lg z-50 p-2"
              style={{ borderColor: "#E0E4E7", width: "240px" }}
            >
              <div
                className="text-xs font-semibold mb-2"
                style={{ color: "#38474F" }}
              >
                Background Color
              </div>
              <div className="grid grid-cols-10 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyBgColor(color)}
                    className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color, borderColor: "#ccc" }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="p-2 rounded hover:bg-gray-200"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="p-2 rounded hover:bg-gray-200"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="p-2 rounded hover:bg-gray-200"
          title="Underline"
        >
          <Underline size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => execCommand("justifyLeft")}
          className="p-2 rounded hover:bg-gray-200"
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyCenter")}
          className="p-2 rounded hover:bg-gray-200"
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyRight")}
          className="p-2 rounded hover:bg-gray-200"
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="p-2 rounded hover:bg-gray-200"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="p-2 rounded hover:bg-gray-200"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Line Spacing */}
        <select
          onChange={(e) => applyLineHeight(e.target.value)}
          className="px-2 py-2 text-sm rounded border"
          style={{ borderColor: "#E0E4E7" }}
          title="Line Spacing"
          defaultValue=""
        >
          <option value="" disabled>
            Spacing
          </option>
          {lineHeights.map((lh) => (
            <option key={lh.value} value={lh.value}>
              {lh.label}
            </option>
          ))}
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Insert Tools */}
        <button
          type="button"
          onClick={insertTable}
          className="p-2 rounded hover:bg-gray-200"
          title="Insert Table"
        >
          <Table size={16} />
        </button>
        <button
          type="button"
          onClick={insertLink}
          className="p-2 rounded hover:bg-gray-200"
          title="Insert Link"
        >
          <LinkIcon size={16} />
        </button>

        <label
          className="p-2 rounded hover:bg-gray-200 cursor-pointer"
          title="Insert Image"
        >
          <ImageIcon size={16} />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* ENHANCED: Editable area with proper event handlers */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (!isInitialized) setIsInitialized(true);
        }}
        className="p-4 outline-none overflow-y-auto"
        data-placeholder={placeholder}
        style={{
          minHeight: height,
          maxHeight: height,
          backgroundColor: "white",
          direction: "ltr",
          textAlign: "left",
          unicodeBidi: "embed",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      />
    </div>
  );
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("bulk-sender");

  const [templates, setTemplates] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingSignature, setEditingSignature] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [signatureContent, setSignatureContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [sendingStatus, setSendingStatus] = useState([]);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [failedEmails, setFailedEmails] = useState([]);
  const [showFailedTable, setShowFailedTable] = useState(false);
  const [emailImages, setEmailImages] = useState([]);
  const [mailAccounts, setMailAccounts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");

  // Mail Accounts Panel States
  const [username, setUsername] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    loadTemplates();
    loadSignatures();
    loadMailAccounts();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await api.get("/templates");
      if (response.data.success) {
        setTemplates(response.data.templates);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const saveTemplate = async () => {
    if (!templateName || !templateSubject || !templateBody) {
      alert("Please fill in all template fields");
      return;
    }

    try {
      if (editingTemplate) {
        const response = await api.put(`/templates/${editingTemplate._id}`, {
          name: templateName,
          subject: templateSubject,
          body: templateBody,
        });

        if (response.data.success) {
          setTemplates(
            templates.map((t) =>
              t._id === editingTemplate._id ? response.data.template : t
            )
          );
          alert("✅ Template updated!");
        }
      } else {
        const response = await api.post("/templates", {
          name: templateName,
          subject: templateSubject,
          body: templateBody,
        });

        if (response.data.success) {
          setTemplates([...templates, response.data.template]);
          alert("✅ Template saved!");
        }
      }

      setTemplateName("");
      setTemplateSubject("");
      setTemplateBody("");
      setEditingTemplate(null);
    } catch (error) {
      console.error("Error saving template:", error);
      alert(
        "❌ Error saving template: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await api.delete(`/templates/${id}`);
      if (response.data.success) {
        setTemplates(templates.filter((t) => t._id !== id));
        alert("✅ Template deleted!");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert(
        "❌ Error deleting template: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const editTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
  };

  const loadSignatures = async () => {
    try {
      const response = await api.get("/signatures");
      setSignatures(response.data.signatures);
    } catch (error) {
      console.error("Error loading signatures:", error);
    }
  };

  const saveSignature = async () => {
    if (!signatureName || !signatureContent) {
      alert("Please fill in all signature fields");
      return;
    }

    try {
      if (editingSignature) {
        const response = await api.put(`/signatures/${editingSignature._id}`, {
          name: signatureName,
          content: signatureContent,
        });

        setSignatures(
          signatures.map((s) =>
            s._id === editingSignature._id ? response.data.signature : s
          )
        );
        alert("✅ Signature updated!");
      } else {
        const response = await api.post("/signatures", {
          name: signatureName,
          content: signatureContent,
        });

        setSignatures([...signatures, response.data.signature]);
        alert("✅ Signature saved!");
      }

      setSignatureName("");
      setSignatureContent("");
      setEditingSignature(null);
    } catch (error) {
      console.error("Error saving signature:", error);
      alert(
        "❌ Error saving signature: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const deleteSignature = async (id) => {
    if (!confirm("Are you sure you want to delete this signature?")) return;

    try {
      const response = await api.delete(`/signatures/${id}`);
      if (response.data.success) {
        setSignatures(signatures.filter((s) => s._id !== id));
        alert("✅ Signature deleted!");
      }
    } catch (error) {
      console.error("Error deleting signature:", error);
      alert(
        "❌ Error deleting signature: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const editSignature = (signature) => {
    setEditingSignature(signature);
    setSignatureName(signature.name);
    setSignatureContent(signature.content);
  };

  const loadMailAccounts = async () => {
    try {
      const response = await api.get("/mail-accounts");
      setMailAccounts(response.data.accounts || []);
    } catch (error) {
      console.error("Error loading mail accounts:", error);
    }
  };

  const handleAddAccount = async () => {
    if (!username || !accountEmail || !accountPassword) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await api.post("/mail-accounts", {
        username,
        email: accountEmail,
        password: accountPassword,
      });

      const newAccount = response.data.account;
      setMailAccounts([...mailAccounts, newAccount]);

      setUsername("");
      setAccountEmail("");
      setAccountPassword("");
      alert("✅ Mail account added successfully!");
    } catch (error) {
      console.error("Error adding account:", error);
      alert(
        "❌ Error adding account: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleDeleteAccount = async (id) => {
    setDeleteAccountId(id);
    setShowPasswordModal(true);
  };

  // Add this new function for confirming deletion:
  const confirmDeleteAccount = async () => {
    if (!deletePassword) {
      alert("Please enter the account password");
      return;
    }

    try {
      const response = await api.delete(`/mail-accounts/${deleteAccountId}`, {
        data: { password: deletePassword },
      });

      if (response.data.success) {
        setMailAccounts(
          mailAccounts.filter((acc) => acc._id !== deleteAccountId)
        );
        alert("✅ Account deleted successfully!");
        setShowPasswordModal(false);
        setDeletePassword("");
        setDeleteAccountId(null);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error.response?.status === 403) {
        alert("❌ Incorrect password! Please try again.");
      } else {
        alert(
          "❌ Error deleting account: " +
            (error.response?.data?.error || error.message)
        );
      }
    }
  };

  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    setFirstName(contact.username);
    setEmail(contact.email);
    setLastName("");
    setOpenDropdown(false);

    try {
      const response = await api.get(`/mail-accounts/${contact._id}`);
      if (response.data.account) {
        setSelectedContact({
          ...contact,
          password: response.data.account.password,
        });
      }
    } catch (error) {
      console.error("Error fetching account details:", error);
      alert("⚠️ Could not load account credentials");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push({
          file,
          name: file.name,
          dataUrl: event.target.result,
          width: 600,
        });
        if (newImages.length === files.length) {
          setEmailImages([...emailImages, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setEmailImages(emailImages.filter((_, i) => i !== index));
  };

  const updateImageWidth = (index, width) => {
    const updatedImages = [...emailImages];
    updatedImages[index].width = width;
    setEmailImages(updatedImages);
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file) => ({
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const convertAttachmentsToBase64 = async () => {
    const base64Attachments = [];
    for (const attachment of attachments) {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        };
        reader.readAsDataURL(attachment.file);
      });
      base64Attachments.push({
        filename: attachment.name,
        content: base64,
        contentType: attachment.file.type,
      });
    }
    return base64Attachments;
  };

  const convertImagesToBase64 = async () => {
    const base64Images = [];
    for (const image of emailImages) {
      const base64String = image.dataUrl.split(",")[1];
      base64Images.push({
        filename: image.name,
        dataUrl: image.dataUrl,
        width: image.width,
        content: base64String,
      });
    }
    return base64Images;
  };

  const sendEmailViaAPI = async (
    recipientEmail,
    fName,
    lName,
    attachmentsData,
    imagesData,
    senderCredentials = null
  ) => {
    try {
      const response = await api.post("/api/send-email", {
        email: recipientEmail,
        firstName: fName,
        lastName: lName,
        subject: selectedTemplate?.subject || "No Subject",
        body: selectedTemplate?.body || "",
        signature: selectedSignature?.content || "",
        attachments: attachmentsData,
        images: imagesData,
        senderEmail: senderCredentials?.email || null,
        senderPassword: senderCredentials?.password || null,
        senderName: senderCredentials?.username || null,
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Email send failed");
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
          setFailedEmails([]);
          setShowFailedTable(false);
          alert(`✅ Loaded ${formattedData.length} contacts`);
        }
      } catch (error) {
        alert("❌ Error reading Excel file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const sendBulkEmails = async () => {
    if (!selectedTemplate) {
      alert("Please select an email template first.");
      return;
    }

    if (excelData.length === 0) {
      alert("Please upload an Excel file first.");
      return;
    }

    setIsProcessing(true);
    setCancelRequested(false);
    setSendingStatus([]);
    setFailedEmails([]);
    setSuccessCount(0);
    setFailCount(0);
    let tempSuccessCount = 0;
    let tempFailCount = 0;
    let failedList = [];

    const attachmentsData = await convertAttachmentsToBase64();
    const imagesData = await convertImagesToBase64();

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
        await sendEmailViaAPI(
          contact.email,
          contact.firstName,
          contact.lastName,
          attachmentsData,
          imagesData,
          selectedContact
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

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to send to ${contact.email}:`, error);
        tempFailCount++;
        setFailCount(tempFailCount);

        const failedEntry = {
          email: contact.email,
          name: `${contact.firstName} ${contact.lastName}`,
          status: "failed",
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
          reason: error.message.includes("timeout")
            ? "SMTP Timeout"
            : error.message.includes("Invalid")
            ? "Invalid Email Format"
            : error.message.includes("550")
            ? "Mailbox Not Found"
            : error.message.includes("553")
            ? "Invalid Recipient"
            : "Delivery Failed",
        };

        failedList.push(failedEntry);
        setFailedEmails([...failedList]);
        setSendingStatus((prev) => [...prev, failedEntry]);
      }
    }

    setIsProcessing(false);
    setCurrentIndex(-1);
    setCancelRequested(false);
    setShowFailedTable(failedList.length > 0);
    alert(
      `✅ Bulk send complete!\n${tempSuccessCount} sent\n${tempFailCount} failed`
    );
  };

  const cancelBulkSend = () => {
    setCancelRequested(true);
  };

  const sendEmail = async () => {
    if (!selectedTemplate) {
      alert("Please select an email template first.");
      return;
    }

    if (!email || !firstName) {
      alert("Please enter both email and first name.");
      return;
    }

    setIsProcessing(true);

    try {
      const attachmentsData = await convertAttachmentsToBase64();
      const imagesData = await convertImagesToBase64();
      await sendEmailViaAPI(
        email,
        firstName,
        lastName,
        attachmentsData,
        imagesData,
        selectedContact
      );
      alert(`✅ Email sent successfully to ${email}`);
    } catch (error) {
      console.error("Error sending email:", error);
      alert(`❌ Error sending email: ${error.message}`);
    }

    setIsProcessing(false);
  };

  const downloadFailedEmailsAsExcel = () => {
    if (failedEmails.length === 0) {
      alert("No failed emails to download");
      return;
    }

    const exportData = failedEmails.map((item) => ({
      "Email Address": item.email,
      "Recipient Name": item.name,
      "Failure Reason": item.reason,
      "Error Details": item.error,
      Timestamp: item.timestamp,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Emails");
    XLSX.writeFile(workbook, `failed-emails-${new Date().getTime()}.xlsx`);
  };

  const applyVariables = (html, data) => {
    return html
      .replace(/\{\{firstName\}\}/g, data.firstName || "")
      .replace(/\{\{lastName\}\}/g, data.lastName || "")
      .replace(/\{\{email\}\}/g, data.email || "");
  };

  const generatePreviewHTML = () => {
    const bodyHTML = applyVariables(selectedTemplate?.body || "", {
      firstName,
      lastName,
      email,
    });

    const signatureHTML = applyVariables(selectedSignature?.content || "", {
      firstName,
      lastName,
      email,
    });

    return `
    <html>
      <body>
        <table width="100%" style="background:#f5f5f5">
          <tr>
            <td align="center">
              <table width="600" style="background:#fff">
                <tr>
                  <td style="padding:30px">
                    
                    <div>${bodyHTML}</div>
                    <div style="margin-top:30px">${signatureHTML}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
  };

  return (
    <div
      className="flex h-screen"
      style={{
        backgroundColor: "#F5F7F9",
        fontFamily: "'Open Sans', sans-serif",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;700&family=Open+Sans:wght@400;600;700&display=swap');
          
          * {
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
        `}
      </style>

      {/* ========== SIDEBAR ========== */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-20"
        }`}
        style={{
          backgroundColor: "#38474F",
          boxShadow: "4px 0 16px rgba(0,0,0,0.1)",
        }}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div
            className={`p-4 border-b transition-all ${
              sidebarOpen ? "px-6" : "px-4"
            }`}
            style={{ borderColor: "rgba(255,255,255,0.1)", height: "80px" }}
          >
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                  <img src={logo} alt="" className="rounded-md" />
                </div>
                <div>
                  <h1
                    className="text-white font-bold text-lg"
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Archery Technocrats®
                  </h1>
                  <p className="text-xs" style={{ color: "#8A9BA5" }}>
                    Target Perfection
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <img src={logo} alt="" className="rounded-full" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3">
            <div className="space-y-2">
              <button
                onClick={() => setCurrentPage("bulk-sender")}
                className={`w-full flex items-center ${
                  sidebarOpen ? "gap-3 px-4" : "justify-center"
                } py-3 rounded-lg transition-all ${
                  currentPage === "bulk-sender"
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-opacity-50"
                }`}
                style={{
                  backgroundColor:
                    currentPage === "bulk-sender" ? "#E85874" : "transparent",
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                }}
                title={!sidebarOpen ? "Bulk Sender" : ""}
              >
                <Home size={20} />
                {sidebarOpen && <span>BULK SENDER</span>}
              </button>

              <button
                onClick={() => setCurrentPage("templates")}
                className={`w-full flex items-center ${
                  sidebarOpen ? "gap-3 px-4" : "justify-center"
                } py-3 rounded-lg transition-all ${
                  currentPage === "templates"
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-opacity-50"
                }`}
                style={{
                  backgroundColor:
                    currentPage === "templates" ? "#E85874" : "transparent",
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                }}
                title={!sidebarOpen ? "Templates" : ""}
              >
                <Layers size={20} />
                {sidebarOpen && <span>TEMPLATES</span>}
              </button>

              <button
                onClick={() => setCurrentPage("signatures")}
                className={`w-full flex items-center ${
                  sidebarOpen ? "gap-3 px-4" : "justify-center"
                } py-3 rounded-lg transition-all ${
                  currentPage === "signatures"
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-opacity-50"
                }`}
                style={{
                  backgroundColor:
                    currentPage === "signatures" ? "#E85874" : "transparent",
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                }}
                title={!sidebarOpen ? "Signatures" : ""}
              >
                <Edit3 size={20} />
                {sidebarOpen && <span>SIGNATURES</span>}
              </button>

              <button
                onClick={() => setCurrentPage("mail-accounts")}
                className={`w-full flex items-center ${
                  sidebarOpen ? "gap-3 px-4" : "justify-center"
                } py-3 rounded-lg transition-all ${
                  currentPage === "mail-accounts"
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-opacity-50"
                }`}
                style={{
                  backgroundColor:
                    currentPage === "mail-accounts" ? "#E85874" : "transparent",
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                }}
                title={!sidebarOpen ? "Mail Accounts" : ""}
              >
                <Users size={20} />
                {sidebarOpen && <span>MAIL ACCOUNTS</span>}
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div
            className="p-3 border-t"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            {sidebarOpen && (
              <div
                className="mt-3 text-center text-xs"
                style={{ color: "#8A9BA5" }}
              >
                Powered by{" "}
                <span className="text-white font-semibold">
                  Archery Technocrats®
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ========== NAVBAR ========== */}
        <div
          className="h-16 flex items-center justify-between px-6"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 2px 8px rgba(56, 71, 79, 0.1)",
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
              style={{ color: "#38474F" }}
            >
              <Menu size={24} />
            </button>
            <h2
              className="text-2xl font-bold"
              style={{
                color: "#38474F",
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              {currentPage === "bulk-sender" && "BULK EMAIL SENDER"}
              {currentPage === "templates" && "TEMPLATE MANAGER"}
              {currentPage === "signatures" && "SIGNATURE MANAGER"}
              {currentPage === "mail-accounts" && "MAIL ACCOUNTS"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {currentPage === "bulk-sender" && (
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-all"
                  style={{
                    backgroundColor: "#E85874",
                    color: "#FFFFFF",
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: "14px",
                    letterSpacing: "0.5px",
                  }}
                >
                  <Mail size={18} />
                  {selectedContact ? selectedContact.username : "SELECT SENDER"}
                  <ChevronDown size={16} />
                </button>

                {openDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto"
                    style={{ borderColor: "#E0E4E7" }}
                  >
                    {mailAccounts.length === 0 ? (
                      <div
                        className="px-4 py-6 text-center"
                        style={{ color: "#8A9BA5" }}
                      >
                        <p className="text-sm">No contacts available</p>
                        <p className="text-xs mt-1">Add mail accounts first</p>
                      </div>
                    ) : (
                      mailAccounts.map((contact, index) => (
                        <div
                          key={contact._id || index}
                          onClick={() => handleSelectContact(contact)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                          style={{ borderColor: "#E0E4E7" }}
                        >
                          <p
                            className="font-semibold text-sm"
                            style={{ color: "#38474F" }}
                          >
                            {contact.username}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#8A9BA5" }}
                          >
                            {contact.email}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========== PAGE CONTENT ========== */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* BULK SENDER PAGE */}
          {currentPage === "bulk-sender" && (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div
                  className="bg-white rounded-lg p-6"
                  style={{ boxShadow: "0 2px 8px rgba(56, 71, 79, 0.1)" }}
                >
                  <h3
                    className="text-xl font-bold mb-6"
                    style={{
                      color: "#38474F",
                      fontFamily: "'Oswald', sans-serif",
                    }}
                  >
                    EMAIL SETUP
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#38474F" }}
                      >
                        SELECT TEMPLATE *
                      </label>
                      <select
                        value={selectedTemplate?._id || ""}
                        onChange={(e) => {
                          const template = templates.find(
                            (t) => t._id === e.target.value
                          );
                          setSelectedTemplate(template || null);
                        }}
                        className="w-full border-2 px-4 py-3 rounded-lg"
                        style={{
                          borderColor: selectedTemplate ? "#39A3DD" : "#E0E4E7",
                          backgroundColor: selectedTemplate
                            ? "#D4EAF7"
                            : "#FFFFFF",
                        }}
                      >
                        <option value="">-- Choose a template --</option>
                        {templates.map((template) => (
                          <option key={template._id} value={template._id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                      {selectedTemplate && (
                        <div
                          className="mt-2 p-3 rounded-lg"
                          style={{
                            backgroundColor: "#D4EAF7",
                            border: "1px solid #6BB9E5",
                          }}
                        >
                          <p
                            className="text-sm font-bold"
                            style={{ color: "#2A7FAF" }}
                          >
                            Subject: {selectedTemplate.subject}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#38474F" }}
                      >
                        SELECT SIGNATURE (OPTIONAL)
                      </label>
                      <select
                        value={selectedSignature?._id || ""}
                        onChange={(e) => {
                          const signature = signatures.find(
                            (s) => s._id === e.target.value
                          );
                          setSelectedSignature(signature || null);
                        }}
                        className="w-full border-2 px-4 py-3 rounded-lg"
                        style={{ borderColor: "#E0E4E7" }}
                      >
                        <option value="">-- No signature --</option>
                        {signatures.map((signature) => (
                          <option key={signature._id} value={signature._id}>
                            {signature.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label
                          className="block text-sm font-semibold mb-2"
                          style={{ color: "#38474F" }}
                        >
                          FIRST NAME
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full border-2 px-4 py-3 rounded-lg"
                          placeholder="John"
                          style={{ borderColor: "#E0E4E7" }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-semibold mb-2"
                          style={{ color: "#38474F" }}
                        >
                          LAST NAME
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full border-2 px-4 py-3 rounded-lg"
                          placeholder="Doe"
                          style={{ borderColor: "#E0E4E7" }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-semibold mb-2"
                          style={{ color: "#38474F" }}
                        >
                          EMAIL
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border-2 px-4 py-3 rounded-lg"
                          placeholder="john@example.com"
                          style={{ borderColor: "#E0E4E7" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#38474F" }}
                      >
                        IMAGES
                      </label>
                      <input
                        type="file"
                        ref={imageInputRef}
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full py-3 flex items-center justify-center gap-2 rounded-lg font-semibold border-2 border-dashed transition-all"
                        style={{
                          borderColor: "#39A3DD",
                          color: "#39A3DD",
                          backgroundColor: "#F5FAFD",
                        }}
                      >
                        <ImageIcon size={18} />
                        ADD IMAGES
                      </button>

                      {emailImages.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {emailImages.map((image, index) => (
                            <div
                              key={index}
                              className="p-3 rounded-lg"
                              style={{
                                backgroundColor: "#F5F7F9",
                                border: "1px solid #E0E4E7",
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className="text-sm"
                                  style={{ color: "#38474F" }}
                                >
                                  {image.name}
                                </span>
                                <button
                                  onClick={() => removeImage(index)}
                                  className="p-1 rounded hover:bg-red-100"
                                  style={{ color: "#E85874" }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className="text-xs"
                                  style={{ color: "#8A9BA5" }}
                                >
                                  Width:
                                </span>
                                <input
                                  type="range"
                                  min="200"
                                  max="600"
                                  value={image.width}
                                  onChange={(e) =>
                                    updateImageWidth(
                                      index,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="flex-1"
                                />
                                <span
                                  className="text-xs"
                                  style={{ color: "#8A9BA5" }}
                                >
                                  {image.width}px
                                </span>
                              </div>
                              <img
                                src={image.dataUrl}
                                alt={image.name}
                                style={{
                                  maxWidth: "100%",
                                  borderRadius: "4px",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#38474F" }}
                      >
                        ATTACHMENTS
                      </label>
                      <input
                        type="file"
                        ref={attachmentInputRef}
                        multiple
                        onChange={handleAttachmentUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => attachmentInputRef.current?.click()}
                        className="w-full py-3 flex items-center justify-center gap-2 rounded-lg font-semibold border-2 border-dashed transition-all"
                        style={{
                          borderColor: "#39A3DD",
                          color: "#39A3DD",
                          backgroundColor: "#F5FAFD",
                        }}
                      >
                        <Paperclip size={18} />
                        ADD ATTACHMENTS
                      </button>

                      {attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 rounded-lg"
                              style={{
                                backgroundColor: "#F5F7F9",
                                border: "1px solid #E0E4E7",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Paperclip
                                  size={16}
                                  style={{ color: "#39A3DD" }}
                                />
                                <span
                                  className="text-sm"
                                  style={{ color: "#38474F" }}
                                >
                                  {attachment.name}
                                </span>
                                <span
                                  className="text-xs"
                                  style={{ color: "#8A9BA5" }}
                                >
                                  ({attachment.size})
                                </span>
                              </div>
                              <button
                                onClick={() => removeAttachment(index)}
                                className="p-1 rounded hover:bg-red-100"
                                style={{ color: "#E85874" }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      className="pt-4 border-t"
                      style={{ borderColor: "#E0E4E7" }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".xlsx,.xls"
                        onChange={handleExcelUpload}
                        className="hidden"
                      />

                      {excelData.length > 0 && (
                        <div
                          className="mb-3 px-4 py-3 rounded-lg flex items-center gap-2"
                          style={{
                            backgroundColor: "#D4EAF7",
                            color: "#2A7FAF",
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
                          className="w-full py-4 flex items-center justify-center gap-3 text-white rounded-lg font-semibold mb-3"
                          style={{
                            backgroundColor: "#E85874",
                            boxShadow: "0 4px 12px rgba(232, 88, 116, 0.25)",
                            fontFamily: "'Oswald', sans-serif",
                          }}
                        >
                          <FileSpreadsheet size={20} />
                          SEND BULK ({excelData.length})
                        </button>
                      )}

                      {isProcessing && excelData.length > 0 && (
                        <>
                          <div
                            className="mb-3 p-5 rounded-lg border-2"
                            style={{
                              backgroundColor: "rgba(212, 234, 247, 0.5)",
                              borderColor: "#39A3DD",
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className="text-sm font-bold"
                                style={{ color: "#2A7FAF" }}
                              >
                                PROCESSING
                              </span>
                              <span
                                className="text-xs font-bold px-2 py-1 rounded"
                                style={{
                                  backgroundColor: "#39A3DD",
                                  color: "white",
                                }}
                              >
                                {currentIndex + 1} / {excelData.length}
                              </span>
                            </div>
                            <div className="w-full bg-white rounded-full h-2.5 mb-3">
                              <div
                                className="h-2.5 rounded-full"
                                style={{
                                  width: `${
                                    ((currentIndex + 1) / excelData.length) *
                                    100
                                  }%`,
                                  backgroundColor: "#39A3DD",
                                }}
                              ></div>
                            </div>
                            <div className="flex gap-3 text-sm">
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
                            className="w-full py-4 flex items-center justify-center gap-3 text-white rounded-lg font-semibold mb-3"
                            style={{
                              backgroundColor: "#8A9BA5",
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            <X size={20} />
                            CANCEL
                          </button>
                        </>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="py-4 flex items-center justify-center gap-2 text-white rounded-lg font-semibold"
                          style={{
                            backgroundColor: "#39A3DD",
                            fontFamily: "'Oswald', sans-serif",
                          }}
                        >
                          <Upload size={20} />
                          UPLOAD
                        </button>

                        <button
                          onClick={sendEmail}
                          disabled={isProcessing}
                          className="py-4 flex items-center justify-center gap-2 text-white rounded-lg font-semibold"
                          style={{
                            backgroundColor: isProcessing
                              ? "#8A9BA5"
                              : "#39A3DD",
                            cursor: isProcessing ? "not-allowed" : "pointer",
                            fontFamily: "'Oswald', sans-serif",
                          }}
                        >
                          <Send size={20} />
                          SEND SINGLE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Preview */}
                <div
                  className="bg-white rounded-lg p-6"
                  style={{ boxShadow: "0 2px 8px rgba(56, 71, 79, 0.1)" }}
                >
                  <h3
                    className="text-xl font-bold mb-6"
                    style={{
                      color: "#38474F",
                      fontFamily: "'Oswald', sans-serif",
                    }}
                  >
                    EMAIL PREVIEW
                  </h3>
                  <div
                    style={{
                      border: "1px solid #E0E4E7",
                      borderRadius: "8px",
                      padding: "20px",
                      backgroundColor: "#FAFBFC",
                      minHeight: "500px",
                    }}
                    dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }}
                  />
                </div>
              </div>

              {/* Failed Emails Table */}
              {showFailedTable && failedEmails.length > 0 && (
                <div
                  className="mt-6 bg-white rounded-lg p-6"
                  style={{
                    boxShadow: "0 2px 8px rgba(232, 88, 116, 0.15)",
                    border: "2px solid #FDD7E0",
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: "#FDD7E0" }}
                      >
                        <AlertCircle size={24} style={{ color: "#E85874" }} />
                      </div>
                      <div>
                        <h3
                          className="text-2xl font-bold"
                          style={{
                            color: "#38474F",
                            fontFamily: "'Oswald', sans-serif",
                          }}
                        >
                          FAILED EMAILS
                        </h3>
                        <p style={{ color: "#8A9BA5", fontSize: "14px" }}>
                          {failedEmails.length} email(s) failed
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={downloadFailedEmailsAsExcel}
                      className="py-3 px-6 flex items-center gap-2 text-white rounded-lg font-semibold"
                      style={{
                        backgroundColor: "#E85874",
                        fontFamily: "'Oswald', sans-serif",
                      }}
                    >
                      <FileSpreadsheet size={18} />
                      DOWNLOAD EXCEL
                    </button>
                  </div>

                  <div
                    className="overflow-x-auto rounded-lg"
                    style={{ border: "1px solid #E0E4E7" }}
                  >
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "#F5F7F9",
                            borderBottom: "2px solid #E0E4E7",
                          }}
                        >
                          <th
                            style={{
                              padding: "16px",
                              textAlign: "left",
                              fontSize: "13px",
                              color: "#38474F",
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            EMAIL
                          </th>
                          <th
                            style={{
                              padding: "16px",
                              textAlign: "left",
                              fontSize: "13px",
                              color: "#38474F",
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            NAME
                          </th>
                          <th
                            style={{
                              padding: "16px",
                              textAlign: "left",
                              fontSize: "13px",
                              color: "#38474F",
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            REASON
                          </th>
                          <th
                            style={{
                              padding: "16px",
                              textAlign: "left",
                              fontSize: "13px",
                              color: "#38474F",
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            TIME
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {failedEmails.map((item, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: "1px solid #E0E4E7",
                              backgroundColor:
                                idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                            }}
                          >
                            <td
                              style={{
                                padding: "14px 16px",
                                fontSize: "13px",
                                color: "#38474F",
                              }}
                            >
                              {item.email}
                            </td>
                            <td
                              style={{
                                padding: "14px 16px",
                                fontSize: "13px",
                                color: "#38474F",
                              }}
                            >
                              {item.name}
                            </td>
                            <td
                              style={{ padding: "14px 16px", fontSize: "12px" }}
                            >
                              <span
                                style={{
                                  backgroundColor: "#E85874",
                                  color: "white",
                                  padding: "4px 10px",
                                  borderRadius: "4px",
                                }}
                              >
                                {item.reason}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "14px 16px",
                                fontSize: "12px",
                                color: "#8A9BA5",
                              }}
                            >
                              {item.timestamp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATES PAGE */}
          {currentPage === "templates" && (
            <div className="max-w-7xl mx-auto">
              <div
                className="bg-white rounded-lg p-8 mb-6"
                style={{ boxShadow: "0 2px 8px rgba(56, 71, 79, 0.1)" }}
              >
                <h3
                  className="text-2xl font-bold mb-6"
                  style={{
                    color: "#38474F",
                    fontFamily: "'Oswald', sans-serif",
                  }}
                >
                  {editingTemplate ? "EDIT TEMPLATE" : "CREATE TEMPLATE"}
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#38474F" }}
                      >
                        TEMPLATE NAME
                      </label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full border-2 px-4 py-3 rounded-lg"
                        placeholder="e.g., Welcome Email"
                        style={{ borderColor: "#E0E4E7" }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#38474F" }}
                      >
                        EMAIL SUBJECT
                      </label>
                      <input
                        type="text"
                        value={templateSubject}
                        onChange={(e) => setTemplateSubject(e.target.value)}
                        className="w-full border-2 px-4 py-3 rounded-lg"
                        placeholder="Enter email subject"
                        style={{ borderColor: "#E0E4E7" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#38474F" }}
                    >
                      EMAIL BODY
                    </label>
                    <RichTextEditor
                      value={templateBody}
                      onChange={setTemplateBody}
                      placeholder="Enter email body..."
                      height="400px"
                      showVariables={true}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={saveTemplate}
                      className="flex-1 py-4 flex items-center justify-center gap-2 text-white rounded-lg font-semibold"
                      style={{
                        backgroundColor: "#E85874",
                        fontFamily: "'Oswald', sans-serif",
                      }}
                    >
                      <Save size={20} />
                      {editingTemplate ? "UPDATE TEMPLATE" : "SAVE TEMPLATE"}
                    </button>

                    {editingTemplate && (
                      <button
                        onClick={() => {
                          setEditingTemplate(null);
                          setTemplateName("");
                          setTemplateSubject("");
                          setTemplateBody("");
                        }}
                        className="px-8 py-4 text-center rounded-lg font-semibold"
                        style={{
                          backgroundColor: "#F5F7F9",
                          color: "#8A9BA5",
                          fontFamily: "'Oswald', sans-serif",
                        }}
                      >
                        CANCEL
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-lg p-8"
                style={{ boxShadow: "0 2px 8px rgba(56, 71, 79, 0.1)" }}
              >
                <h3
                  className="text-2xl font-bold mb-6"
                  style={{
                    color: "#38474F",
                    fontFamily: "'Oswald', sans-serif",
                  }}
                >
                  SAVED TEMPLATES ({templates.length})
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template._id}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: "#F5F7F9",
                        borderColor: "#E0E4E7",
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4
                            className="font-bold text-sm"
                            style={{
                              color: "#38474F",
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            {template.name}
                          </h4>
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#8A9BA5" }}
                          >
                            {template.subject}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => editTemplate(template)}
                          className="flex-1 py-2 rounded transition-all flex items-center justify-center gap-1"
                          style={{
                            backgroundColor: "#D4EAF7",
                            color: "#39A3DD",
                            fontSize: "12px",
                            fontFamily: "'Oswald', sans-serif",
                          }}
                        >
                          <Edit3 size={14} />
                          EDIT
                        </button>
                        <button
                          onClick={() => deleteTemplate(template._id)}
                          className="flex-1 py-2 rounded transition-all flex items-center justify-center gap-1"
                          style={{
                            backgroundColor: "#FDD7E0",
                            color: "#E85874",
                            fontSize: "12px",
                            fontFamily: "'Oswald', sans-serif",
                          }}
                        >
                          <Trash2 size={14} />
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div
                      className="col-span-3 text-center py-12"
                      style={{ color: "#8A9BA5" }}
                    >
                      <Layers size={48} className="mx-auto mb-3 opacity-30" />
                      <p>No templates saved yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SIGNATURES PAGE */}
          {currentPage === "signatures" && (
            <div className="max-w-7xl mx-auto">
              <div
                className="bg-white rounded-lg p-8 mb-6"
                style={{ boxShadow: "0 2px 8px rgba(56, 71, 79, 0.1)" }}
              >
                <h3
                  className="text-2xl font-bold mb-6"
                  style={{
                    color: "#38474F",
                    fontFamily: "'Oswald', sans-serif",
                  }}
                >
                  {editingSignature ? "EDIT SIGNATURE" : "CREATE SIGNATURE"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#38474F" }}
                    >
                      SIGNATURE NAME
                    </label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full border-2 px-4 py-3 rounded-lg"
                      placeholder="e.g., Professional Signature"
                      style={{ borderColor: "#E0E4E7" }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#38474F" }}
                    >
                      SIGNATURE CONTENT
                    </label>
                    <RichTextEditor
                      value={signatureContent}
                      onChange={setSignatureContent}
                      placeholder="Enter signature content..."
                      height="400px"
                      showVariables={true}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={saveSignature}
                      className="flex-1 py-4 flex items-center justify-center gap-2 text-white rounded-lg font-semibold"
                      style={{
                        backgroundColor: "#E85874",
                        fontFamily: "'Oswald', sans-serif",
                      }}
                    >
                      <Save size={20} />
                      {editingSignature ? "UPDATE SIGNATURE" : "SAVE SIGNATURE"}
                    </button>

                    {editingSignature && (
                      <button
                        onClick={() => {
                          setEditingSignature(null);
                          setSignatureName("");
                          setSignatureContent("");
                        }}
                        className="px-8 py-4 text-center rounded-lg font-semibold"
                        style={{
                          backgroundColor: "#F5F7F9",
                          color: "#8A9BA5",
                          fontFamily: "'Oswald', sans-serif",
                        }}
                      >
                        CANCEL
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-lg p-8"
                style={{ boxShadow: "0 2px 8px rgba(56, 71, 79, 0.1)" }}
              >
                <h3
                  className="text-2xl font-bold mb-6"
                  style={{
                    color: "#38474F",
                    fontFamily: "'Oswald', sans-serif",
                  }}
                >
                  SAVED SIGNATURES ({signatures.length})
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {signatures.map((signature) => (
                    <div
                      key={signature._id}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: "#F5F7F9",
                        borderColor: "#E0E4E7",
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4
                            className="font-bold text-sm"
                            style={{
                              color: "#38474F",
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            {signature.name}
                          </h4>
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#8A9BA5" }}
                          >
                            {new Date(signature.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => editSignature(signature)}
                          className="flex-1 py-2 rounded transition-all flex items-center justify-center gap-1"
                          style={{
                            backgroundColor: "#D4EAF7",
                            color: "#39A3DD",
                            fontSize: "12px",
                            fontFamily: "'Oswald', sans-serif",
                          }}
                        >
                          <Edit3 size={14} />
                          EDIT
                        </button>
                        <button
                          onClick={() => deleteSignature(signature._id)}
                          className="flex-1 py-2 rounded transition-all flex items-center justify-center gap-1"
                          style={{
                            backgroundColor: "#FDD7E0",
                            color: "#E85874",
                            fontSize: "12px",
                            fontFamily: "'Oswald', sans-serif",
                          }}
                        >
                          <Trash2 size={14} />
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                  {signatures.length === 0 && (
                    <div
                      className="col-span-3 text-center py-12"
                      style={{ color: "#8A9BA5" }}
                    >
                      <Edit3 size={48} className="mx-auto mb-3 opacity-30" />
                      <p>No signatures saved yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MAIL ACCOUNTS PAGE */}
          {currentPage === "mail-accounts" && (
            <div className="max-w-7xl mx-auto">
              <div
                className="bg-white rounded-lg p-8"
                style={{ boxShadow: "0 2px 8px rgba(56, 71, 79, 0.1)" }}
              >
                <div
                  className="mb-8 p-6 rounded-lg"
                  style={{ backgroundColor: "#D4EAF7" }}
                >
                  <h3
                    className="text-xl font-bold mb-4"
                    style={{
                      color: "#2A7FAF",
                      fontFamily: "'Oswald', sans-serif",
                    }}
                  >
                    ADD NEW ACCOUNT
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#38474F" }}
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-lg"
                        placeholder="John Doe"
                        style={{ borderColor: "#E0E4E7" }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#38474F" }}
                      >
                        Email ID
                      </label>
                      <input
                        type="email"
                        value={accountEmail}
                        onChange={(e) => setAccountEmail(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-lg"
                        placeholder="john@example.com"
                        style={{ borderColor: "#E0E4E7" }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#38474F" }}
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          className="w-full px-4 py-3 border-2 rounded-lg pr-12"
                          placeholder="Enter password"
                          style={{ borderColor: "#E0E4E7" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3"
                          style={{ color: "#8A9BA5" }}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleAddAccount}
                    className="w-full mt-4 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: "#E85874",
                      fontFamily: "'Oswald', sans-serif",
                    }}
                  >
                    <Save size={20} />
                    ADD ACCOUNT
                  </button>
                </div>

                <div>
                  <h3
                    className="text-xl font-bold mb-4"
                    style={{
                      color: "#38474F",
                      fontFamily: "'Oswald', sans-serif",
                    }}
                  >
                    SAVED ACCOUNTS ({mailAccounts.length})
                  </h3>

                  {mailAccounts.length === 0 ? (
                    <p
                      className="text-center py-8"
                      style={{ color: "#8A9BA5" }}
                    >
                      No accounts saved yet
                    </p>
                  ) : (
                    <div
                      className="overflow-x-auto rounded-lg"
                      style={{ border: "1px solid #E0E4E7" }}
                    >
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead style={{ backgroundColor: "#F5F7F9" }}>
                          <tr>
                            <th
                              style={{
                                padding: "16px",
                                textAlign: "left",
                                fontSize: "13px",
                                color: "#38474F",
                                fontFamily: "'Oswald', sans-serif",
                              }}
                            >
                              USERNAME
                            </th>
                            <th
                              style={{
                                padding: "16px",
                                textAlign: "left",
                                fontSize: "13px",
                                color: "#38474F",
                                fontFamily: "'Oswald', sans-serif",
                              }}
                            >
                              EMAIL ID
                            </th>
                            <th
                              style={{
                                padding: "16px",
                                textAlign: "left",
                                fontSize: "13px",
                                color: "#38474F",
                                fontFamily: "'Oswald', sans-serif",
                              }}
                            >
                              PASSWORD
                            </th>
                            <th
                              style={{
                                padding: "16px",
                                textAlign: "left",
                                fontSize: "13px",
                                color: "#38474F",
                                fontFamily: "'Oswald', sans-serif",
                              }}
                            >
                              ACTIONS
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {mailAccounts.map((account) => (
                            <tr
                              key={account._id}
                              className="hover:bg-gray-50"
                              style={{ borderBottom: "1px solid #E0E4E7" }}
                            >
                              <td
                                style={{
                                  padding: "16px",
                                  fontSize: "14px",
                                  color: "#38474F",
                                }}
                              >
                                {account.username}
                              </td>
                              <td
                                style={{
                                  padding: "16px",
                                  fontSize: "14px",
                                  color: "#38474F",
                                }}
                              >
                                {account.email}
                              </td>
                              <td
                                style={{
                                  padding: "16px",
                                  fontSize: "14px",
                                  color: "#38474F",
                                  fontFamily: "monospace",
                                }}
                              >
                                {"•".repeat(8)}
                              </td>
                              <td style={{ padding: "16px" }}>
                                <button
                                  onClick={() =>
                                    handleDeleteAccount(account._id)
                                  }
                                  className="p-2 rounded transition-all hover:scale-110"
                                  style={{
                                    backgroundColor: "#FDD7E0",
                                    color: "#E85874",
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#FDD7E0" }}
              >
                <AlertCircle size={24} style={{ color: "#E85874" }} />
              </div>
              <h3
                className="text-2xl font-bold"
                style={{
                  color: "#38474F",
                  fontFamily: "'Oswald', sans-serif",
                }}
              >
                CONFIRM DELETION
              </h3>
            </div>

            <p className="mb-6" style={{ color: "#8A9BA5", fontSize: "14px" }}>
              Please enter the account password to confirm deletion. This action
              cannot be undone.
            </p>

            <div className="mb-6">
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#38474F" }}
              >
                Account Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      confirmDeleteAccount();
                    }
                  }}
                  className="w-full border-2 px-4 py-3 rounded-lg pr-12"
                  placeholder="Enter account password"
                  style={{ borderColor: "#E0E4E7" }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                  style={{ color: "#8A9BA5" }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmDeleteAccount}
                disabled={!deletePassword}
                className="flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: deletePassword ? "#E85874" : "#E0E4E7",
                  cursor: deletePassword ? "pointer" : "not-allowed",
                  fontFamily: "'Oswald', sans-serif",
                }}
              >
                <Trash2 size={18} />
                DELETE ACCOUNT
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setDeletePassword("");
                  setDeleteAccountId(null);
                }}
                className="flex-1 py-3 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: "#F5F7F9",
                  color: "#8A9BA5",
                  fontFamily: "'Oswald', sans-serif",
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
