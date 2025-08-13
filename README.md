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
- Docker and Docker Compose (for containerized deployment)

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

### Standard Installation

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

### Docker Installation

1. Clone this repository
2. Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

3. Edit the `.env` file with your Telegram Bot Token, Supabase URL, Supabase Key, and authorized user IDs
4. Build and start the Docker container:

```bash
docker-compose up -d
```

## Usage

### Running Locally

1. Start the bot:

```bash
npm start
```

2. Open your Telegram app and start a conversation with your bot
3. Use the `/start` command to see the main menu

### Running with Docker

1. Start the container (if not already running):

```bash
docker-compose up -d
```

2. Check container logs if needed:

```bash
docker-compose logs -f
```

3. To stop the container:

```bash
docker-compose down
```

## Available Commands

- `/start` - Show the main menu
- `/help` - Display available commands
- `/stock <product_id>` - Check stock level for a specific product (e.g., `/stock PROD001`)
- `/add <product_id> <amount>` - Add stock quantity (e.g., `/add PROD001 10`)
- `/sub <product_id> <amount>` - Subtract stock quantity (e.g., `/sub PROD001 5`)
- `/update <product_id> <+/-amount>` - Update stock quantity (legacy format, e.g., `/update PROD001 +10` or `/update PROD001 -5`)

## Security Considerations

- Only authorized Telegram users (configured in the `.env` file) can use the bot
- All user inputs are validated to prevent SQL injection and other attacks
- Supabase API keys are stored securely in the `.env` file (not committed to version control)

## Development

For development with auto-restart on code changes:

```bash
npm run dev
```

## Docker Deployment

The application includes Docker configuration for easy deployment:

- `Dockerfile` - Defines the container image
- `docker-compose.yml` - Configures the service with proper restart policies
- `.dockerignore` - Excludes unnecessary files from the Docker image

The container is configured to restart automatically in case of crashes or system reboots, ensuring continuous operation.

## License

MIT