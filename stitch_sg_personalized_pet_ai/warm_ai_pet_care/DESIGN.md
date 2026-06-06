---
name: Warm AI Pet Care
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#554244'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#887274'
  outline-variant: '#dac0c3'
  surface-tint: '#9c3f53'
  primary: '#9c3f53'
  on-primary: '#ffffff'
  primary-container: '#ff8da1'
  on-primary-container: '#782338'
  inverse-primary: '#ffb2bd'
  secondary: '#785a00'
  on-secondary: '#ffffff'
  secondary-container: '#ffd167'
  on-secondary-container: '#765900'
  tertiary: '#485f84'
  on-tertiary: '#ffffff'
  tertiary-container: '#99b0d9'
  on-tertiary-container: '#2c4366'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9dd'
  primary-fixed-dim: '#ffb2bd'
  on-primary-fixed: '#400013'
  on-primary-fixed-variant: '#7e273c'
  secondary-fixed: '#ffdf9b'
  secondary-fixed-dim: '#edc157'
  on-secondary-fixed: '#251a00'
  on-secondary-fixed-variant: '#5b4300'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#b0c7f1'
  on-tertiary-fixed: '#001b3c'
  on-tertiary-fixed-variant: '#30476a'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

The design system is built on the intersection of advanced AI reliability and the emotional warmth of pet ownership. It caters to the modern Singaporean pet owner who values efficiency but demands a high level of care and trust. 

The aesthetic is **Modern Warmth**: a hybrid of "Corporate Modern" and "Soft Minimalism." It utilizes soft glassmorphism to signal AI-native capabilities while maintaining a grounded, tactile feel through organic shapes and high-quality photography. The emotional response should be one of immediate relief and professional assurance—like walking into a premium, well-lit veterinary clinic in the heart of the city.

Key principles:
- **Efficiency over Clutter:** Clear pathways for pet management in a fast-paced urban environment.
- **Approachable Intelligence:** AI features are presented through soft gradients and helpful, non-threatening micro-interactions.
- **Localized Reliability:** A visual language that feels at home in a Singaporean context, prioritizing clarity and trust.

## Colors

The palette balances playful energy with professional depth. 

- **Primary (Petal Pink):** Used for primary actions, branding elements, and key highlights. It provides a soft, nurturing energy.
- **Secondary (Tail Wag Yellow):** Reserved for alerts, celebratory states, and "AI Suggestion" highlights. It acts as an optimistic accent.
- **Tertiary (Loyal Navy):** The foundation of trust. Used for headings, primary text, and navigation bars to ensure the platform feels stable and authoritative.
- **Background (Creamy White):** A warm neutral that prevents the UI from feeling sterile or clinical.
- **Glassmorphism:** Use `surface_glass` for overlaying cards or AI chat bubbles to create a sense of depth and modern technology.

## Typography

This design system uses a dual-font approach to balance personality with legibility.

- **Quicksand** is the voice of the brand. Its rounded terminals feel friendly and organic, mirroring the curves of a pet. It is used exclusively for headlines and large display text.
- **Inter** provides the functional backbone. It is highly legible at small sizes, making it perfect for pet health records, scheduling details, and AI chat transcripts. 

**Usage Notes:**
- Avoid using Quicksand for long-form body text to maintain readability.
- Headlines should use a tighter letter-spacing to appear more cohesive.
- Use `label-lg` for button text and navigation items to ensure clarity.

## Layout & Spacing

The layout philosophy follows a **fluid, container-based grid** that prioritizes white space to reduce cognitive load for busy pet owners.

- **Grid:** A 12-column grid for desktop and a 4-column grid for mobile.
- **Margins:** Generous 20px margins on mobile ensure content doesn't feel cramped, especially when navigating while walking a pet.
- **Rhythm:** An 8px base unit drives all spacing decisions. Use `md` (24px) for most vertical separation between sections to maintain a clean, airy feel.
- **Alignment:** Content should generally be center-aligned in containers for a balanced, premium look, shifting to left-aligned for data-heavy views.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** combined with **Ambient Shadows**.

- **Level 0 (Background):** `Creamy White` (#F8F9FA).
- **Level 1 (Cards/Containers):** Solid white surfaces with a very soft, diffused shadow (0px 4px 20px rgba(29, 53, 87, 0.05)).
- **Level 2 (Interactive/Floating):** Used for primary buttons and active AI chat bubbles. These use a slightly more pronounced shadow and subtle gradients.
- **Glassmorphism (Special AI State):** For AI processing overlays or floating action buttons, use a backdrop blur of 12px and 70% opacity white. This visually separates "automated" insights from "static" data.

## Shapes

The shape language is consistently **Rounded**, avoiding sharp corners to evoke a sense of safety and friendliness.

- **Standard Elements:** 0.5rem (8px) for small components like inputs.
- **Cards & Primary Sections:** 1rem (16px) to create a soft, approachable frame for content.
- **Buttons & Chips:** Full pill-shapes are preferred for primary calls-to-action to maximize the "friendly" aesthetic.
- **Imagery:** Photos should have a minimum of 1.5rem (24px) corner radius or use organic, circular masks to blend with the soft UI elements.

## Components

- **Buttons:** Primary buttons use a gradient from `Petal Pink` to a slightly deeper shade. They should be pill-shaped and include a subtle "bounce" interaction on press.
- **AI Chat Bubbles:** Incoming AI messages use a soft `surface_glass` background with a `Loyal Navy` text color. Outgoing user messages use a light version of `Petal Pink`.
- **Pet Profile Cards:** Large, rounded cards with high-quality pet photography. Include status chips (e.g., "Vaccinated," "Heartworm Due") in the top right.
- **Localized Chips:** Use chips for Singapore-specific tags like "HDB-Approved," "Tampines Area," or "Indoor-Only." These use a light `Tail Wag Yellow` background.
- **Input Fields:** Soft grey borders that turn `Petal Pink` on focus. Labels should always be visible (no placeholder-only labels) using `Inter` Medium.
- **Health Indicators:** Circular progress rings for activity tracking and health milestones, utilizing `Success Green` and `Tail Wag Yellow`.