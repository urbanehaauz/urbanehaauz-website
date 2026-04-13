# Telegram Marketing Bot — Setup Guide

## Step 1: Create the bot via BotFather (2 minutes)

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Name: `Urbane Haauz Marketing`
4. Username: `urbanehaauz_marketing_bot` (or any available variant)
5. BotFather replies with a **token** like `7123456789:AAF...` — **copy it and save it securely**

## Step 2: Configure the bot

Send these commands to @BotFather:

```
/setdescription
```
> Urbane Haauz Marketing Bot. Sends daily content previews for approval. Tap Approve or Reject on each post.

```
/setabouttext
```
> Marketing automation for Urbane Haauz Boutique Hotel, Upper Pelling.

```
/setuserpic
```
> Upload the Urbane Haauz logo (same as favicon.svg or a square crop of it)

## Step 3: Get your chat ID

1. Send any message to your new bot (just say "hi")
2. Open this URL in your browser (replace TOKEN with your bot token):
   ```
   https://api.telegram.org/botTOKEN/getUpdates
   ```
3. Find the `"chat":{"id":XXXXXXX}` value — that's your chat ID
4. Save this — the webhook needs it

## Step 4: Tell Claude Code

Paste the bot token here in the Claude Code terminal when prompted. I'll configure it in the Telegram MCP plugin or store it as a Vercel env var for the webhook.

**What you'll need to provide:**
- Bot token: `7XXXXXXXXX:AAXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Chat ID: `XXXXXXXXX` (your personal Telegram chat ID)

## Step 5: What happens next

Once configured, this bot will:
- Send you a daily content preview (Instagram caption + image prompt + Bengali translation)
- Each preview has **Approve** and **Reject** inline buttons
- Tapping **Approve** marks the content as ready to post
- Tapping **Reject** asks for a revision reason
- Weekly marketing reports arrive every Monday 9 AM

You never need to open a laptop. Everything happens on your phone via Telegram.
