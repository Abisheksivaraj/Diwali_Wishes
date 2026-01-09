const mongoose = require("mongoose");

const MONGODB_URI =
  "mongodb+srv://Abishek:Abi2288@cluster0.ddlzsna.mongodb.net/Atpl_Mail?retryWrites=true&w=majority";

console.log("🔍 Testing MongoDB Connection...");
console.log("📍 Connecting to:", MONGODB_URI.replace(/:([^:@]+)@/, ":****@"));

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ SUCCESS! MongoDB Connected");
    console.log("📊 Database Name:", mongoose.connection.name);
    console.log("🌐 Host:", mongoose.connection.host);
    console.log("📡 Port:", mongoose.connection.port);
    console.log("🔌 Connection State:", mongoose.connection.readyState);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ FAILED! Connection Error:");
    console.error("Error Message:", err.message);
    console.error("Error Code:", err.code);
    console.error("Error Name:", err.name);

    if (err.message.includes("no primary server available")) {
      console.error("\n⚠️  This usually means:");
      console.error("   1. IP not whitelisted (wait 1-2 minutes after adding)");
      console.error("   2. Wrong username/password");
      console.error("   3. Cluster is paused or deleted");
      console.error("   4. Network/firewall blocking connection");
    }

    process.exit(1);
  });

setTimeout(() => {
  console.error("⏱️  Connection timeout after 15 seconds");
  process.exit(1);
}, 15000);
