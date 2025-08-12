# Telegram Inventory Management Bot

A Telegram bot for inventory management that integrates with Supabase database. This bot allows authorized users to check stock levels and update quantities through a user-friendly interface.

## Features

- **Stock Queries**: Check current stock levels for products
- **Inventory Updates**: Add or subtract stock quantities
- **User Authorization**: Restrict bot access to authorized users only
- **Intuitive Interface**: Easy-to-use inline keyboard buttons
- **Secure Database Integration**: Supabase integration for reliable data storage

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Telegram Bot Token (from [BotFather](https://t.me/botfather))
- Supabase account with a project set up

## Database Setup

1. Create a new Supabase project at [https://app.supabase.io/](https://app.supabase.io/)
2. Create a `stock` table with the following schema:

```sql
create table stock (
  id varchar(50) primary key,
  quantity integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

3. Add some sample data or set up appropriate row-level security policies as needed

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your Telegram Bot Token, Supabase URL, Supabase Key, and authorized user IDs

## Usage

1. Start the bot:

```bash
npm start
```

2. Open your Telegram app and start a conversation with your bot
3. Use the `/start` command to see the main menu

## Available Commands

- `/start` - Show the main menu
- `/help` - Display available commands
- `/stock <product_id>` - Check stock level for a specific product (e.g., `/stock PROD001`)
- `/update <product_id> <+/-amount>` - Update stock quantity (e.g., `/update PROD001 +10` or `/update PROD001 -5`)

## Security Considerations

- Only authorized Telegram users (configured in the `.env` file) can use the bot
- All user inputs are validated to prevent SQL injection and other attacks
- Supabase API keys are stored securely in the `.env` file (not committed to version control)

## Development

For development with auto-restart on code changes:

```bash
npm run dev
```

## License

MIT