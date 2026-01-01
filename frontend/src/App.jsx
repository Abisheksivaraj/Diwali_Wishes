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
} from "lucide-react";
import * as XLSX from "xlsx";

import api from "../src/apiConfig";

// Rich Text Editor Component
const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  height = "200px",
  showVariables = false,
  onVariableInsert,
}) => {
  const editorRef = useRef(null);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = `<img src="${event.target.result}" style="max-width: 100%; height: auto;" />`;
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

  return (
    <div className="border-2 rounded-lg" style={{ borderColor: "#E0E4E7" }}>
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
          onClick={insertLink}
          className="p-2 rounded hover:bg-gray-200"
          title="Insert Link"
        >
          <LinkIcon size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

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

        <select
          onChange={(e) => execCommand("fontSize", e.target.value)}
          className="px-2 py-1 text-sm rounded border"
          style={{ borderColor: "#E0E4E7" }}
        >
          <option value="3">Normal</option>
          <option value="1">Small</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="p-4 outline-none overflow-y-auto"
        style={{
          minHeight: height,
          maxHeight: height,
          backgroundColor: "white",
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
};

const MailAccountsPanel = ({ isOpen, onClose, savedAccounts, onSave }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accounts, setAccounts] = useState(savedAccounts || []);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  const loadAccounts = async () => {
    try {
      const response = await api.get("/mail-accounts");
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error("Error loading accounts:", error);
      if (error.code === "ECONNABORTED") {
        console.warn("MongoDB connection timeout - server may be starting up");
      }
    }
  };

  const handleAddAccount = async () => {
    if (!username || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await api.post("/mail-accounts", {
        username,
        email,
        password,
      });

      const newAccount = response.data.account;
      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      onSave(updatedAccounts);

      setUsername("");
      setEmail("");
      setPassword("");
      alert("✅ Mail account added successfully!");
    } catch (error) {
      console.error("Error adding account:", error);

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        alert(
          "❌ Server timeout. Please check if the backend server is running and MongoDB is connected."
        );
      } else {
        alert(
          "❌ Error adding account: " +
            (error.response?.data?.error || error.message)
        );
      }
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      const response = await api.delete(`/mail-accounts/${id}`);
      if (response.data.success) {
        const updatedAccounts = accounts.filter((acc) => acc._id !== id);
        setAccounts(updatedAccounts);
        onSave(updatedAccounts);
        alert("✅ Account deleted!");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(
        "❌ Error deleting account: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Mail Accounts
              </h2>
              <p className="text-sm text-gray-600">
                Manage your email accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Add New Account
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter password"
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
          </div>

          <button
            onClick={handleAddAccount}
            className="w-full mt-4 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: "#39A3DD" }}
          >
            <Save size={20} />
            Add Account
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Saved Accounts ({accounts.length})
          </h3>

          {accounts.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No accounts saved yet
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Email ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Password
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accounts.map((account) => (
                    <tr key={account._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {account.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {account.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {"•".repeat(8)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeleteAccount(account._id)}
                          className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
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
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState("sender");

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

  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [failedEmails, setFailedEmails] = useState([]);
  const [showFailedTable, setShowFailedTable] = useState(false);
  const [emailImages, setEmailImages] = useState([]);
  const [showMailAccounts, setShowMailAccounts] = useState(false);
  const [mailAccounts, setMailAccounts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    setFirstName(contact.username);
    setEmail(contact.email);
    setLastName("");
    setOpenDropdown(false);

    // ✅ Fetch the full account details including password
    try {
      const response = await api.get(`/mail-accounts/${contact._id}`);
      if (response.data.account) {
        // Store the complete credentials for sending emails
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

  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    loadTemplates();
    loadSignatures();
    loadMailAccounts();
  }, []);

  // ========== TEMPLATE FUNCTIONS ==========
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

  // ========== SIGNATURE FUNCTIONS ==========
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

  // ========== MAIL ACCOUNTS FUNCTIONS ==========
  const loadMailAccounts = async () => {
    try {
      const response = await api.get("/mail-accounts");
      setMailAccounts(response.data.accounts || []);
    } catch (error) {
      console.error("Error loading mail accounts:", error);
    }
  };

  // ========== IMAGE FUNCTIONS ==========
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

  // ========== ATTACHMENT FUNCTIONS ==========
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

  // ========== EMAIL SENDING FUNCTIONS ==========
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
        // ✅ Send sender credentials if a contact is selected
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
          selectedContact // ✅ Pass sender credentials
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
        selectedContact // ✅ Pass sender credentials
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
                    <h2>Dear ${firstName || "Customer"},</h2>
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

  if (currentPage === "templates") {
    return (
      <div
        className="w-screen min-h-screen p-8"
        style={{
          background: "linear-gradient(135deg, #F5F7F9 0%, #E8EDF1 100%)",
        }}
      >
        <MailAccountsPanel
          isOpen={showMailAccounts}
          onClose={() => setShowMailAccounts(false)}
          savedAccounts={mailAccounts}
          onSave={setMailAccounts}
        />

        <div className="mb-6 flex gap-4 justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPage("templates")}
              className="px-6 py-3 rounded-lg font-semibold"
              style={{ backgroundColor: "#39A3DD", color: "white" }}
            >
              <Layers size={18} className="inline mr-2" />
              TEMPLATE MANAGER
            </button>
            <button
              onClick={() => setCurrentPage("sender")}
              className="px-6 py-3 rounded-lg font-semibold"
              style={{ backgroundColor: "#8A9BA5", color: "white" }}
            >
              <Send size={18} className="inline mr-2" />
              BULK SENDER
            </button>
          </div>

          <button
            onClick={() => setShowMailAccounts(true)}
            className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            style={{ backgroundColor: "#39A3DD", color: "white" }}
          >
            <Mail size={18} />
            MAIL ACCOUNTS
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2
              className="text-3xl font-bold mb-6 flex items-center gap-3"
              style={{ color: "#38474F" }}
            >
              <Mail size={28} style={{ color: "#39A3DD" }} />
              EMAIL TEMPLATES
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  TEMPLATE NAME
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full border-2 px-4 py-3 rounded-lg"
                  placeholder="e.g., Welcome Email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  EMAIL SUBJECT
                </label>
                <input
                  type="text"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  className="w-full border-2 px-4 py-3 rounded-lg"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  EMAIL BODY
                </label>
                <RichTextEditor
                  value={templateBody}
                  onChange={setTemplateBody}
                  placeholder="Enter email body..."
                  height="300px"
                  showVariables={true}
                />
              </div>

              <button
                onClick={saveTemplate}
                className="w-full py-3 flex items-center justify-center gap-2 text-white rounded-lg font-semibold"
                style={{ backgroundColor: "#39A3DD" }}
              >
                <Save size={18} />
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
                  className="w-full py-3 text-center rounded-lg font-semibold"
                  style={{ backgroundColor: "#F5F7F9", color: "#8A9BA5" }}
                >
                  CANCEL EDITING
                </button>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">
                SAVED TEMPLATES ({templates.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template._id}
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: "#F5F7F9" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{template.name}</h4>
                        <p className="text-sm mt-1 text-gray-600">
                          {template.subject}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editTemplate(template)}
                          className="p-2 rounded"
                          style={{
                            backgroundColor: "#D4EAF7",
                            color: "#39A3DD",
                          }}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template._id)}
                          className="p-2 rounded bg-red-100 text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="text-center py-8 text-gray-500">
                    No templates saved yet
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2
              className="text-3xl font-bold mb-6 flex items-center gap-3"
              style={{ color: "#38474F" }}
            >
              <Edit3 size={28} style={{ color: "#39A3DD" }} />
              EMAIL SIGNATURES
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  SIGNATURE NAME
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full border-2 px-4 py-3 rounded-lg"
                  placeholder="e.g., Professional Signature"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
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

              <button
                onClick={saveSignature}
                className="w-full py-3 flex items-center justify-center gap-2 text-white rounded-lg font-semibold"
                style={{ backgroundColor: "#39A3DD" }}
              >
                <Save size={18} />
                {editingSignature ? "UPDATE SIGNATURE" : "SAVE SIGNATURE"}
              </button>

              {editingSignature && (
                <button
                  onClick={() => {
                    setEditingSignature(null);
                    setSignatureName("");
                    setSignatureContent("");
                  }}
                  className="w-full py-3 text-center rounded-lg font-semibold"
                  style={{ backgroundColor: "#F5F7F9", color: "#8A9BA5" }}
                >
                  CANCEL EDITING
                </button>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">
                SAVED SIGNATURES ({signatures.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {signatures.map((signature) => (
                  <div
                    key={signature._id}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: "#F5F7F9",
                      borderColor: "#E0E4E7",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4
                          className="font-bold"
                          style={{ color: "#38474F", fontSize: "14px" }}
                        >
                          {signature.name}
                        </h4>
                        <p
                          className="text-xs mt-2"
                          style={{ color: "#8A9BA5" }}
                        >
                          {new Date(signature.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editSignature(signature)}
                          className="p-2 rounded"
                          style={{
                            backgroundColor: "#D4EAF7",
                            color: "#39A3DD",
                          }}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteSignature(signature._id)}
                          className="p-2 rounded"
                          style={{
                            backgroundColor: "#FDD7E0",
                            color: "#E85874",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {signatures.length === 0 && (
                  <p className="text-center py-8" style={{ color: "#8A9BA5" }}>
                    No signatures saved yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-screen min-h-screen p-8 flex flex-col gap-8"
      style={{
        background: "linear-gradient(135deg, #F5F7F9 0%, #E8EDF1 100%)",
      }}
    >
      <div className="flex gap-4">
        <button
          onClick={() => setCurrentPage("templates")}
          className="px-6 py-3 rounded-lg font-semibold"
          style={{ backgroundColor: "#8A9BA5", color: "white" }}
        >
          <Layers size={18} className="inline mr-2" />
          TEMPLATE MANAGER
        </button>
        <button
          onClick={() => setCurrentPage("sender")}
          className="px-6 py-3 rounded-lg font-semibold"
          style={{ backgroundColor: "#39A3DD", color: "white" }}
        >
          <Send size={18} className="inline mr-2" />
          BULK SENDER
        </button>

        {/* ✅ SELECT CONTACT DROPDOWN - NOW IN BULK SENDER PAGE */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="px-5 py-3 rounded-lg font-semibold flex items-center gap-2"
            style={{ backgroundColor: "#475569", color: "white" }}
          >
            <Mail size={18} />
            {selectedContact ? selectedContact.username : "Select Contact"}
            <ChevronDown size={16} />
          </button>

          {openDropdown && (
            <div className="absolute mt-2 w-72 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50 max-h-96 overflow-y-auto">
              {mailAccounts.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500">
                  <p className="text-sm">No contacts available</p>
                  <p className="text-xs mt-1">Add mail accounts first</p>
                </div>
              ) : (
                mailAccounts.map((contact, index) => (
                  <div
                    key={contact._id || index}
                    onClick={() => handleSelectContact(contact)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <p className="font-semibold text-slate-800 text-sm">
                      {contact.username}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {contact.email}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        <div
          className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col"
          style={{
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(56, 71, 79, 0.12)",
            border: "1px solid rgba(56, 71, 79, 0.08)",
            maxHeight: "90vh",
            overflowY: "auto",
            maxWidth: "50%",
          }}
        >
          <div className="mb-6">
            <h2
              className="text-4xl font-bold mb-2 flex items-center gap-3"
              style={{ color: "#38474F", letterSpacing: "0.5px" }}
            >
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: "#D4EAF7" }}
              >
                <Send size={32} style={{ color: "#39A3DD" }} />
              </div>
              EMAIL SENDER
            </h2>
            <p style={{ color: "#8A9BA5", lineHeight: "1.6" }}>
              Select template and send professional bulk emails
            </p>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto pr-4">
            <div className="space-y-3">
              <label
                className="block text-sm font-semibold"
                style={{ color: "#38474F" }}
              >
                SELECT EMAIL TEMPLATE *
              </label>
              <select
                value={selectedTemplate?._id || ""}
                onChange={(e) => {
                  const template = templates.find(
                    (t) => t._id === e.target.value
                  );
                  setSelectedTemplate(template || null);
                }}
                className="w-full border-2 px-4 py-3 rounded-lg text-sm"
                style={{
                  borderColor: selectedTemplate ? "#39A3DD" : "#E0E4E7",
                  color: "#38474F",
                  backgroundColor: selectedTemplate ? "#F5FAFD" : "white",
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
                  className="p-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: "#D4EAF7",
                    border: "1px solid #6BB9E5",
                  }}
                >
                  <p style={{ color: "#2A7FAF", fontWeight: "bold" }}>
                    Subject: {selectedTemplate.subject}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label
                className="block text-sm font-semibold"
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
                className="w-full border-2 px-4 py-3 rounded-lg text-sm"
                style={{ borderColor: "#E0E4E7", color: "#38474F" }}
              >
                <option value="">-- No signature --</option>
                {signatures.map((signature) => (
                  <option key={signature._id} value={signature._id}>
                    {signature.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label
                  className="block font-semibold text-sm"
                  style={{ color: "#38474F" }}
                >
                  FIRST NAME
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border-2 px-4 py-3 rounded-lg text-sm"
                  placeholder="Enter first name"
                  style={{ borderColor: "#E0E4E7", color: "#38474F" }}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="block font-semibold text-sm"
                  style={{ color: "#38474F" }}
                >
                  LAST NAME
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border-2 px-4 py-3 rounded-lg text-sm"
                  placeholder="Enter last name"
                  style={{ borderColor: "#E0E4E7", color: "#38474F" }}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="block font-semibold text-sm"
                  style={{ color: "#38474F" }}
                >
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 px-4 py-3 rounded-lg text-sm"
                  placeholder="Enter email"
                  style={{ borderColor: "#E0E4E7", color: "#38474F" }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label
                className="block text-sm font-semibold"
                style={{ color: "#38474F" }}
              >
                IMAGES IN EMAIL
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
                className="w-full py-3 flex items-center justify-center gap-2 rounded-lg font-semibold text-sm border-2 border-dashed"
                style={{
                  borderColor: "#39A3DD",
                  color: "#39A3DD",
                  backgroundColor: "#F5FAFD",
                }}
              >
                <ImageIcon size={18} />
                ADD IMAGES TO EMAIL
              </button>

              {emailImages.length > 0 && (
                <div className="space-y-2">
                  {emailImages.map((image, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg space-y-2"
                      style={{
                        backgroundColor: "#F5F7F9",
                        border: "1px solid #E0E4E7",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "#38474F" }}>
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: "#8A9BA5" }}>
                          Width:
                        </span>
                        <input
                          type="range"
                          min="200"
                          max="600"
                          value={image.width}
                          onChange={(e) =>
                            updateImageWidth(index, Number(e.target.value))
                          }
                          className="flex-1"
                        />
                        <span className="text-xs" style={{ color: "#8A9BA5" }}>
                          {image.width}px
                        </span>
                      </div>
                      <img
                        src={image.dataUrl}
                        alt={image.name}
                        style={{ maxWidth: "100%", borderRadius: "4px" }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label
                className="block text-sm font-semibold"
                style={{ color: "#38474F" }}
              >
                FILE ATTACHMENTS
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
                className="w-full py-3 flex items-center justify-center gap-2 rounded-lg font-semibold text-sm border-2 border-dashed"
                style={{
                  borderColor: "#39A3DD",
                  color: "#39A3DD",
                  backgroundColor: "#F5FAFD",
                }}
              >
                <Paperclip size={18} />
                ADD FILE ATTACHMENTS
              </button>

              {attachments.length > 0 && (
                <div className="space-y-2">
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
                        <Paperclip size={16} style={{ color: "#39A3DD" }} />
                        <span className="text-sm" style={{ color: "#38474F" }}>
                          {attachment.name}
                        </span>
                        <span className="text-xs" style={{ color: "#8A9BA5" }}>
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

            <div className="space-y-3">
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
                  className="w-full py-3.5 flex items-center justify-center gap-3 text-white rounded-lg font-semibold text-sm"
                  style={{
                    backgroundColor: "#39A3DD",
                    boxShadow: "0 4px 12px rgba(57, 163, 221, 0.25)",
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
                        style={{ backgroundColor: "#39A3DD", color: "white" }}
                      >
                        {currentIndex + 1} / {excelData.length}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2.5 mb-3">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${
                            ((currentIndex + 1) / excelData.length) * 100
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
                    className="w-full py-3.5 flex items-center justify-center gap-3 text-white rounded-lg font-semibold text-sm"
                    style={{ backgroundColor: "#8A9BA5" }}
                  >
                    <X size={18} />
                    CANCEL
                  </button>
                </>
              )}
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-4 mt-6 pt-6"
            style={{ borderTop: "2px solid #E0E4E7" }}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-4 flex items-center justify-center gap-3 text-white rounded-lg font-semibold text-sm"
              style={{
                backgroundColor: "#39A3DD",
                boxShadow: "0 4px 12px rgba(57, 163, 221, 0.25)",
              }}
            >
              <Upload size={20} />
              UPLOAD CONTACTS
            </button>

            <button
              onClick={sendEmail}
              disabled={isProcessing}
              className="py-4 flex items-center justify-center gap-3 text-white rounded-lg font-semibold text-sm"
              style={{
                backgroundColor: isProcessing ? "#8A9BA5" : "#39A3DD",
                cursor: isProcessing ? "not-allowed" : "pointer",
              }}
            >
              <Send size={20} />
              SEND SINGLE
            </button>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-lg p-8 flex-1"
          style={{
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(56, 71, 79, 0.12)",
            border: "1px solid rgba(56, 71, 79, 0.08)",
            maxHeight: "90vh",
            overflowY: "auto",
            maxWidth: "50%",
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: "#38474F" }}>
            EMAIL PREVIEW
          </h2>
          <div
            style={{
              border: "1px solid #E0E4E7",
              borderRadius: "8px",
              padding: "20px",
              backgroundColor: "#FAFBFC",
            }}
            dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }}
          />
        </div>
      </div>

      {showFailedTable && failedEmails.length > 0 && (
        <div
          className="bg-white rounded-xl shadow-lg p-8 w-full"
          style={{
            boxShadow: "0 8px 32px rgba(232, 88, 116, 0.15)",
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
                <h3 className="text-2xl font-bold" style={{ color: "#38474F" }}>
                  FAILED EMAILS
                </h3>
                <p style={{ color: "#8A9BA5", fontSize: "14px" }}>
                  {failedEmails.length} email(s) failed
                </p>
              </div>
            </div>
            <button
              onClick={downloadFailedEmailsAsExcel}
              className="py-3 px-6 flex items-center gap-2 text-white rounded-lg font-semibold text-sm"
              style={{ backgroundColor: "#39A3DD" }}
            >
              <FileSpreadsheet size={18} />
              DOWNLOAD EXCEL
            </button>
          </div>

          <div
            className="overflow-x-auto"
            style={{ borderRadius: "8px", border: "1px solid #E0E4E7" }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                      backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
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
                    <td style={{ padding: "14px 16px", fontSize: "12px" }}>
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
  );
};

export default App;
