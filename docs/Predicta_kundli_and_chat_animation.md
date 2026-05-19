# Predicta Kundli And Chat Animation Roadmap

Yes. The animation should enhance the Kundli, not fight the geometry.

## Core Rule

Do not animate by moving the Kundli structure itself. The North Indian chart lines, house polygons, sign positions, and planet placement must remain stable. Animation should happen in layers:

1. chart frame draw
2. inner lines draw
3. sign numbers fade in
4. planet labels settle in
5. status markers appear
6. selected/focus house glow appears
7. legend fades in

No rotation. No shifting house positions. No random movement.

## Recommended Animation System

Use one shared animation model for all Kundlis, with different intensity per surface.

## 1. Landing Kundli

Purpose: visual wow, not data accuracy.

Treatment:

- full North Indian chart appears first
- outer frame draws once
- inner diamond and X lines draw softly
- sign numbers fade in
- a few demo planet labels appear
- chart has subtle breathing glow
- no aggressive outline animation
- labels must stay inside houses

This should feel like “Predicta is alive,” not like a casino graphic.

## 2. Kundli Creation Animation

Purpose: user waits while their real chart is being prepared.

Treatment:

- show “Kundli created” panel first
- chart lines draw in order
- signs appear house-by-house
- planets fade/drop gently into their final house
- if multiple planets are in one house, they settle into a clean stacked/flex layout
- retrograde/exalted/combust markers appear last
- if time was rectified, show rectified time note during animation
- if no rectification happened, do not mention it

Important: once animation completes, chart must remain stable and fully clickable by house.

## 3. Predicta Chat Kundli

Purpose: compact but premium confirmation inside chat.

Treatment:

- do not replay a heavy creation animation
- use a softer “chart reveals itself” animation
- line fade/draw: short
- planet labels fade in
- legend appears after chart
- no large motion that causes scrolling or overflow
- chart must be confined inside message width

Chat Kundli should feel elegant, not huge and broken.

## 4. Chat Window Entrance

When user opens any Predicta chat room:

- chat shell fades/slides up very subtly
- message thread appears after header
- composer appears last
- first animation can repeat when user leaves and returns
- keep duration under 450ms
- respect reduced-motion setting

No bouncing. No flashy blur. No “app intro” feeling every time.

## 5. Predicta Loading Animation Fix

The current loading animation can stay, but it must be clipped properly.

Fix rules:

- loading animation container must have `overflow: hidden`
- animation must live inside a bounded card
- no absolute element should exceed parent bounds
- max width must match message bubble width
- on mobile, animation scales down
- no planet/orbit element should leak outside the bubble

## Recommended Phases

### 1. `EXECUTE_KUNDLI_ANIMATION_SYSTEM`

Create one shared animation contract for chart line draw, sign reveal, planet reveal, marker reveal, and legend reveal.

### 2. `EXECUTE_LANDING_KUNDLI_ANIMATION_POLISH`

Apply polished demo animation to landing hero without changing chart geometry.

### 3. `EXECUTE_KUNDLI_CREATION_ANIMATION_POLISH`

Improve manual Kundli creation animation using real chart data and rectification state.

### 4. `EXECUTE_CHAT_KUNDLI_ANIMATION_POLISH`

Create compact Predicta chat Kundli reveal animation with strict containment.

### 5. `EXECUTE_CHAT_ENTRANCE_MOTION`

Add subtle first-load chat shell animation for every Predicta room.

### 6. `EXECUTE_PREDICTA_LOADING_CONTAINMENT`

Confine the current loading animation inside the message card without losing its style.

### 7. `EXECUTE_ANIMATION_REGRESSION_GATE`

Test desktop/tablet/mobile, reduced motion, chart click areas, label containment, and no overflow.

## Recommendation

Do this after the ChatGPT-style chat shell. The shell defines the available space. If we polish animations before fixing chat layout, we may tune the animations for the wrong container size.
