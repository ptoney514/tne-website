# Director Workflow: Updating Team Data

This guide explains how to update team, coach, and schedule data on the TNE United Express website.

## Overview

Team data is stored in static JSON files that are generated from an Excel spreadsheet. When you need to make changes to teams, coaches, or the schedule:

1. Edit the Excel file (`/data/team-data.xlsx`)
2. Run the conversion script
3. Review and commit changes
4. Changes deploy automatically

## Step-by-Step Instructions

### 1. Edit the Excel File

Open `/data/team-data.xlsx` in Excel, Google Sheets, or another spreadsheet application.

The file should have these sheets:

#### Teams Sheet
| Column | Description | Required |
|--------|-------------|----------|
| name | Team name (e.g., "Express United 3rd") | Yes |
| grade_level | Grade (e.g., "3rd", "7th") | Yes |
| gender | "male" or "female" | Yes |
| tier | "tne", "express", or "development" | Yes |
| head_coach_email | Head coach's email | No |
| assistant_coach_email | Assistant coach's email | No |
| team_fee | Team registration fee | Yes |
| uniform_fee | Uniform fee | Yes |
| practice_location | Where practice is held | No |
| practice_days | Days of practice (e.g., "Mon/Wed") | No |
| practice_time | Time of practice (e.g., "6:00-7:30 PM") | No |
| player_count | Number of players on roster | No |

#### Coaches Sheet (optional)
| Column | Description | Required |
|--------|-------------|----------|
| first_name | Coach's first name | Yes |
| last_name | Coach's last name | Yes |
| email | Email address | No |
| phone | Phone number | No |
| role | "head" or "assistant" | Yes |
| bio | Short biography | No |

#### Schedule Sheet (optional)
| Column | Description | Required |
|--------|-------------|----------|
| name | Event name | Yes |
| game_type | "tournament", "game", "practice" | Yes |
| date | Start date (YYYY-MM-DD) | Yes |
| end_date | End date for multi-day events | No |
| location | Venue/city | No |
| notes | Additional information | No |
| is_featured | TRUE or FALSE | No |
| gender | "male", "female", or "both" | No |

### 2. Run the Conversion Script

Open a terminal and run:

```bash
npm run update-teams
```

This will:
- Read the Excel file
- Validate the data
- Generate updated JSON files in `/data/json/`

### 3. Verify the Changes

Run the validation script to ensure everything is correct:

```bash
npm run validate:data
```

If there are errors, fix them in the Excel file and re-run the conversion.

### 4. Review and Commit

Review the changes:

```bash
git diff data/json/
```

If everything looks good, commit and push:

```bash
git add data/json/
git commit -m "Update team data for [season/reason]"
git push
```

### 5. Automatic Deployment

Once pushed to the main branch, Vercel will automatically deploy the changes. The website will update within a few minutes.

## Updating Configuration

For non-team settings (registration status, tryout info, etc.), edit `/data/json/config.json` directly:

```json
{
  "season": {
    "id": "2024-25-winter",
    "name": "2024-25 Winter",
    "is_active": true
  },
  "registration": {
    "is_open": true,
    "label": "Winter 2024-25"
  },
  "tryouts": {
    "is_open": false,
    "label": "Winter '25-26 Tryouts"
  }
}
```

## Troubleshooting

### "File not found" error
Make sure the Excel file exists at `/data/team-data.xlsx`

### Validation errors
Check the error message and fix the corresponding data in the Excel file. Common issues:
- Missing required fields (name, grade_level, etc.)
- Invalid gender values (must be "male" or "female")
- Invalid coach references

### Changes not showing on website
1. Verify the changes were pushed to the main branch
2. Check the Vercel deployment status
3. Clear browser cache and refresh

## Need Help?

For technical assistance, contact the development team or check the project documentation.
