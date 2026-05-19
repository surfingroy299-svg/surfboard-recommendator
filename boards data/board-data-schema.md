# Surfboard Data Schema

## Purpose

Define a clean, consistent structure for storing surfboard data.

This schema is used to generate a reliable dataset that can support:

- filtering
- comparison
- recommendation logic
- clear user explanations

This file is the single source of truth for how data must be structured.

---

## File Structure

- One JSON file per brand
- Each file contains all models of that brand

Structure:

Brand → Model → Variant → Stock Dimensions

---

## Core Principles

1. Use consistent structure across all brands
2. Do not invent data
3. Prefer official brand sources
4. Separate logic data from display data
5. Normalize values whenever possible
6. Keep raw text when meaning might be lost

---

## Objects Overview

### Brand

Represents a surfboard company.

Contains:
- brand_id
- brand_name
- models[]

---

### Model

Represents a surfboard model (the identity of the board).

Contains:
- model_id
- model_name
- category
- conditions
- surfer fit profile
- performance data
- variants[]

---

### Variant

Represents a version of a model (construction / build).

Examples:
- PU
- EPS Epoxy
- Standard

Rules:
- Every model MUST have at least one variant
- If no variation exists → create "Standard" variant

---

### Stock Dimension

Represents a real size from the brand’s stock list.

Rules:
- Must match official brand dimensions
- Must not be guessed or approximated

---

## Technical Measurements

All measurable values must be stored in two formats:

1. Numeric (for logic)
2. Display (for UI)

Example:

- length: 5.8  
- length_display: "5'8\""

Applies to:
- length
- width
- thickness
- volume
- any measurable attribute (rocker, concave, etc. if available)

---

## Conditions

Each model must include:

### Ideal Conditions
What the board is designed for

Examples:
- small waves
- weak waves
- clean surf

---

### Condition Range
Where the board still works

Examples:
- 1–4 ft
- weak to moderate power

---

### Condition Tags
Used for UI and filtering

Examples:
- small_wave
- weak_wave
- everyday_board

---

## Surfer Fit Profile

Do not store only a simple level.

Use a profile:

- level_range (min → max)
- helps_with (what the board improves)
- requires (what the surfer must already do)
- fit_notes (short explanation)

---

## Performance Data

Each model must include:

### 1. Performance Traits (for logic)

Scale: 1–5 + unknown

Examples:
- paddling_ease
- speed_generation
- maneuverability
- stability
- forgiveness

---

### 2. Performance Tags (for UI/search)

Examples:
- fast
- skatey
- forgiving
- drivey

---

### 3. Raw Performance Description

Original or near-original text from the brand.

Used for:
- interpretation
- AI processing

---

### 4. Display Description

2–3 short sentences shown to users.

Rules:
- short
- clear
- consistent
- based on real data (not invented)

---

## Variant Fields

Variants may include:

- construction_type (normalized)
- construction_details (optional)
- shape_profile
- fin setup
- stock_dimensions[]

---

## Shape Profile (Variant Level)

Stored at variant level.

Examples:
- tail_shape
- rocker
- rails
- outline
- bottom_contour

---

## Fin Setup

Keep separate:

- fin_setup_compatibility (what it supports)
- recommended_fin_setup (best setup)

Do not merge them.

---

## Price

Store only as tier (V1):

- low
- mid
- high
- premium

---

## Sources

Use official brand data whenever possible.

Sources can be stored at:
- model level
- variant level

Avoid:
- custom boards
- unreliable listings

---

## Rules

- Every model must have at least one variant
- Every variant must have stock dimensions
- Do not store dimensions as text only
- Do not rely only on raw text for logic
- Do not mix inconsistent formats
- Do not guess missing data
- Use "unknown" when needed

---

## Goal

Create a dataset that is:

- clean
- consistent
- scalable
- explainable
- usable by recommendation logic