#!/bin/bash

# Vercel Deployment Setup Script
# This script helps you set up environment variables for Vercel deployment

set -e

echo "🚀 Vercel Deployment Setup"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create .env file with your environment variables first"
    exit 1
fi

echo -e "${YELLOW}This script will help you add environment variables to Vercel${NC}"
echo ""

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Not logged in to Vercel. Logging in...${NC}"
    vercel login
fi

echo -e "${GREEN}✓ Logged in to Vercel${NC}"
echo ""

# Ask for confirmation
read -p "Add environment variables to Vercel production? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 1
fi

echo ""
echo "Adding environment variables..."
echo ""

# Read .env file and add to Vercel
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue

    # Remove quotes from value
    value="${value%\"}"
    value="${value#\"}"

    # Add to Vercel (will prompt for value)
    echo -e "${YELLOW}Adding: $key${NC}"
    echo "$value" | vercel env add "$key" production

done < .env

echo ""
echo -e "${GREEN}✓ Environment variables added to Vercel${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run database migrations: npx prisma migrate deploy"
echo "2. Deploy to production: vercel --prod"
echo ""
