# Financial Tracker Dashboard

## Overview

The Financial Tracker is a comprehensive dashboard that tracks daily and monthly financial metrics for Urbane Haauz, including room occupancy, revenue, liabilities, and profitability calculations.

## Features

### Daily Entry Form
- Input fields for all financial variables (A-N)
- Real-time calculation display as values are entered
- Validation and error handling
- Edit existing entries
- Delete entries

### Key Metrics (KPI Cards)
- **Daily Inflow (G)**: Total revenue per day
- **Monthly Inflow**: Projected monthly revenue (G × days in month)
- **EBITDA (J)**: Gross profit before interest, taxes, depreciation, and apportionment
- **Net Profit**: Final profit after all deductions
- **Break-Even Status**: Visual indicator showing progress toward ₹3L monthly target

### Visualizations
- **Daily Inflow Trend**: Line chart showing daily inflow over time
- **Monthly Comparison**: Bar chart comparing current monthly inflow vs ₹3L target
- **Break-Even Progress**: Progress bar showing percentage of target achieved

### Historical Data Table
- View all past entries
- Edit or delete any entry
- Sortable by date
- Shows calculated metrics for each entry

## Financial Variables

### Input Variables

- **A - Total Rooms**: Fixed number of total rooms
- **B - Premium Room Occupancy**: Variable occupancy for Premium Suite + Deluxe Room
- **C - Driver Room Occupancy**: Variable occupancy for Dormitory + Standard Room
- **D - Per Day Room Tariff**: Variable tariff for premium rooms
- **E - Per Day Driver Tariff**: Variable tariff for driver rooms
- **F - Restaurant Inflow**: Variable restaurant revenue (placeholder for future POS integration)
- **H - Fixed Monthly Liability**: Fixed monthly expenses
- **I - Variable Monthly Liability**: Variable monthly expenses
- **K - Interest**: Interest expenses
- **L - Depreciation**: Depreciation expenses
- **M - Tax**: Tax expenses
- **N - Apportionment**: Apportionment expenses

### Calculated Values

- **G - Total Per Day Inflow** = (B × D) + (E × C) + F
- **Total Monthly Inflow** = G × 30 (or 31 based on month)
- **J - Gross Profit/EBITDA** = Monthly Inflow - (H + I)
- **Net Profit** = J - (K + L + M + N)

## Break-Even Analysis

- **Daily Obligation**: ₹10,000 per day
- **Monthly Target**: ₹300,000 (3 lakhs) for break-even
- **Status Indicators**:
  - Green: Above target (profitable)
  - Red: Below target (needs improvement)
  - Progress bar shows percentage of target achieved

## Database Schema

Table: `financial_tracker_daily`

All fields stored as DECIMAL(10,2) for monetary values and DECIMAL(5,2) for occupancy percentages.

## Usage

1. Navigate to Admin Dashboard → Financial Tracker
2. Click "Add Daily Entry" to create a new entry
3. Fill in all required fields (A-N)
4. View real-time calculations in the blue box above the form
5. Save entry to add it to the database
6. View historical entries in the table below
7. Edit or delete entries as needed

## Room Category Mapping

- **Premium Rooms**: Premium Suite + Deluxe Room categories
- **Driver Rooms**: Dormitory + Standard Room categories

## Notes

- Restaurant Inflow (F) is currently a placeholder - will integrate with restaurant POS system in the future
- Only one entry per date is allowed (unique constraint)
- All calculations update in real-time as you type
- Monthly inflow calculation uses actual days in the selected month (28-31 days)

