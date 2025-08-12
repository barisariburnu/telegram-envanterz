/**
 * Setup script for the Telegram Inventory Management Bot
 * This script helps users set up the project by guiding them through the configuration process
 */

const fs = require("fs");
const readline = require("readline");
const { execSync } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ANSI color codes for better readability
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

/**
 * Print a colored message to the console
 * @param {string} message - The message to print
 * @param {string} color - The color to use
 */
function colorLog(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Ask a question and get user input
 * @param {string} question - The question to ask
 * @returns {Promise<string>} - The user's answer
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${question}${colors.reset}`, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Main setup function
 */
async function setup() {
  colorLog("\n📦 TELEGRAM INVENTORY MANAGEMENT BOT SETUP 📦\n", "bright");
  colorLog(
    "This script will help you set up your bot configuration.\n",
    "yellow"
  );

  // Check if .env already exists
  const envExists = fs.existsSync(".env");

  if (envExists) {
    const overwrite = await askQuestion(
      "An .env file already exists. Do you want to overwrite it? (y/n): "
    );
    if (overwrite.toLowerCase() !== "y") {
      colorLog(
        "\nSetup cancelled. Your existing .env file was not modified.",
        "yellow"
      );
      rl.close();
      return;
    }
  }

  // Get configuration values from user
  colorLog("\n1. Telegram Bot Configuration:", "magenta");
  const botToken = await askQuestion(
    "Enter your Telegram Bot Token (from BotFather): "
  );

  colorLog("\n2. Supabase Configuration:", "magenta");
  const supabaseUrl = await askQuestion("Enter your Supabase URL: ");
  const supabaseKey = await askQuestion("Enter your Supabase Anon Key: ");

  colorLog("\n3. Security Configuration:", "magenta");
  colorLog(
    "Enter the Telegram User IDs that are authorized to use this bot.",
    "yellow"
  );
  colorLog("You can enter multiple IDs separated by commas.", "yellow");
  colorLog(
    "To get your Telegram User ID, send a message to @userinfobot on Telegram.",
    "yellow"
  );
  const authorizedUsers = await askQuestion("Authorized User IDs: ");

  // Create .env file
  const envContent = `# Telegram Bot Token from BotFather
TELEGRAM_BOT_TOKEN=${botToken}

# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_KEY=${supabaseKey}

# Authorized Telegram User IDs (comma-separated)
AUTHORIZED_USERS=${authorizedUsers}
`;

  fs.writeFileSync(".env", envContent);

  colorLog("\n✅ Configuration saved to .env file!", "green");

  // Ask if user wants to install dependencies
  const installDeps = await askQuestion(
    "\nDo you want to install dependencies now? (y/n): "
  );

  if (installDeps.toLowerCase() === "y") {
    colorLog(
      "\nInstalling dependencies... This may take a few minutes.",
      "yellow"
    );

    try {
      execSync("npm install", { stdio: "inherit" });
      colorLog("\n✅ Dependencies installed successfully!", "green");
    } catch (error) {
      colorLog(
        '\n❌ Error installing dependencies. Please run "npm install" manually.',
        "red"
      );
    }
  }

  // Final instructions
  colorLog("\n🚀 SETUP COMPLETE! 🚀", "bright");
  colorLog("\nNext steps:", "magenta");
  colorLog(
    '1. Make sure your Supabase database has the required "stock" table',
    "yellow"
  );
  colorLog('2. Start the bot with "npm start"', "yellow");
  colorLog(
    "\nThank you for using the Telegram Inventory Management Bot!\n",
    "green"
  );

  rl.close();
}

// Run the setup
setup();
