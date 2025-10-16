# Design Guidelines: Estabiliza Mental Health App

## Design Decision Framework Analysis

**Project Type**: Mobile Health & Wellness Application  
**Aesthetic Direction**: Calm, Professional, Trustworthy with Emotional Warmth

**Key Factors**:
- **Purpose**: Experience-Focused - Emotional engagement and trust are paramount for mental health
- **Content**: Visual-Rich - Mood tracking, achievements, progress visualization
- **Market**: Design-Differentiated - Mental health apps compete on emotional connection
- **Updates**: Trend-Sensitive - Modern, accessible design builds credibility
- **Complexity**: Custom UI Needed - Unique mood tracking, gamification elements

**Design Approach**: **Reference-Based with Custom Elements**  
Drawing inspiration from: Headspace (calming colors), Calm (gentle interactions), Notion (clean hierarchy), Apple Health (data visualization)

---

## Core Design System

### Color Palette

**Primary Colors**:
- Primary: `215 62% 56%` (Calm Blue #4A90E2) - Trust, stability
- Secondary: `251 60% 66%` (Soft Purple #7B68EE) - Creativity, healing
- Accent: `151 45% 55%` (Mint Green #50C878) - Growth, success

**Semantic Colors**:
- Success: `142 44% 55%` (Emerald #50C878)
- Error: `0 79% 70%` (Coral #FF6B6B)
- Warning: `48 100% 61%` (Gold #FFD93D)
- Info: `141 45% 60%` (Aqua #6BCB77)

**Neutral Palette** (Light Mode):
- Text Primary: `210 11% 22%` (#2D3436)
- Text Secondary: `210 9% 45%` (#636E72)
- Text Tertiary: `210 14% 71%` (#B2BEC3)
- Background: `0 0% 100%` (White)
- Card Background: `210 17% 98%` (#F8F9FA)
- Border: `210 18% 89%` (#DFE6E9)

**Dark Mode**:
- Background: `0 0% 12%` (#1E1E1E)
- Card: `0 0% 17%` (#2C2C2C)
- Text: `0 0% 88%` (#E0E0E0)
- Border: `0 0% 24%` (#3E3E3E)

**Gradients**:
- Primary: Linear from `215 62% 56%` to `251 60% 66%`
- Success: Linear from `151 45% 55%` to `141 45% 60%`
- Header: Linear from `215 62% 56%` to `220 56% 63%`

### Typography

**Font Family**: System fonts (SF Pro iOS, Roboto Android) for native feel

**Scale**:
- H1: 32px/40px, Bold (Page titles, onboarding)
- H2: 24px/32px, Semibold 600 (Section headers)
- H3: 20px/28px, Semibold 600 (Card titles)
- Body: 16px/24px, Regular (Main content)
- Caption: 14px/20px, Regular (Supporting text)
- Small: 12px/16px, Regular (Metadata, timestamps)

### Spacing & Layout

**Grid System**: 8px base unit
- XS: 4px (tight spacing)
- SM: 8px (compact elements)
- MD: 16px (standard spacing)
- LG: 24px (section padding)
- XL: 32px (major sections)
- XXL: 40px (hero spacing)

**Layout Primitives**: Use Tailwind-equivalent units: p-2, p-4, p-8, m-4, gap-4, gap-8

**Border Radius**:
- Small: 8px (inputs, small cards)
- Medium: 12px (cards, buttons)
- Large: 16px (modals, bottom sheets)
- Full: 999px (pills, avatars)

### Elevation & Shadows

**Subtle** (Cards, inputs):
- Shadow: 0 2px 4px rgba(0,0,0,0.1)
- Elevation: 2

**Medium** (Elevated cards, dropdowns):
- Shadow: 0 4px 8px rgba(0,0,0,0.15)
- Elevation: 4

**Strong** (Modals, floating actions):
- Shadow: 0 8px 16px rgba(0,0,0,0.2)
- Elevation: 8

---

## Component Design Specifications

### Navigation

**Bottom Tab Bar**:
- Height: 60px
- Icons: 24px (Ionicons)
- Labels: 12px, current tab uses primary color with scale 1.1
- Badge: Red circle with white number for notifications
- Tabs: Home (house icon), Reminders (bell), Mood (happy), Support (chat), Profile (person)

**Header**:
- Background: Primary gradient
- Height: 60px iOS / 56px Android
- Title: White, centered, 18px semibold
- Avatar: 32x32px circle, top right
- Back button: White chevron-left, top left

### Cards & Containers

**Professional Cards** (Psychologists, Psychiatrists, Lawyers):
- White/dark card background
- 64px emoji icon centered top
- Title: H3, primary color
- Description: Body, secondary text
- Primary button: "Agendar Consulta" / "Solicitar Atendimento"
- Padding: LG
- Border radius: Medium
- Shadow: Subtle

**Mood Tracking Card**:
- Emoji selector: 5 emotions (😢 😟 😐 🙂 😊)
- Active emoji: Scale 1.3, primary color ring
- Note input: Multiline, 4 rows max
- Save button: Primary, full width

**Habit/Reminder Card**:
- Checkbox: 24px circle, checkmark animation on complete
- Title: Body weight 600
- Time: Caption, secondary text
- Streak indicator: Flame icon + number
- Swipe actions: Edit (blue), Delete (red)

### Interactive Elements

**Buttons**:
- Primary: Primary gradient background, white text, medium shadow
- Secondary: Primary border 2px, primary text, no shadow
- Ghost: Transparent, primary text
- Danger: Error background, white text
- Height: 48px (medium), 40px (small), 56px (large)
- Border radius: Medium
- Pressed state: Scale 0.95, opacity 0.8, 100ms
- Loading: Spinner + "Carregando..." text
- Success: Green background + checkmark, 2s duration

**Input Fields**:
- Height: 48px
- Background: Card background
- Border: 1px border color
- Focus: Primary color border
- Floating label: Moves to top-left on focus
- Icon: 24px left side (optional)
- Error: Red border + error text below (12px, red)
- Character counter: Caption, right-aligned when maxLength set

**Floating Action Button** (Add Habit/Mood):
- Position: Bottom right, 16px margin
- Size: 56x56px circle
- Background: Primary gradient
- Icon: Plus 24px white
- Shadow: Strong
- Scale animation on press

### Modals & Overlays

**Bottom Sheet**:
- Backdrop: rgba(0,0,0,0.5) with blur on iOS
- Container: Card background, large border radius top
- Handle bar: 32px wide, 4px height, centered top
- Snap points: 25%, 50%, 90%
- Swipe down to dismiss
- Spring animation (tension 100, friction 7)

**Toast Notifications**:
- Position: Top on iOS, bottom on Android
- Width: 90% screen, max 400px
- Padding: MD
- Border radius: Medium
- Icon left (24px): ✓ success, ⚠️ error/warning, ℹ️ info
- Auto-dismiss: 3s (5s for errors)
- Swipe to dismiss
- Success: Green background, Error: Red, Info: Blue, Warning: Yellow

### Data Visualization

**Mood Chart** (Weekly/Monthly):
- Line graph with gradient fill
- X-axis: Days/weeks
- Y-axis: Mood scale 1-5
- Data points: 8px circles with emoji tooltip
- Colors: Primary gradient
- Grid: Subtle dashed lines

**Progress Rings** (Habits completion):
- Size: 120px diameter
- Stroke: 12px width
- Background: Border color
- Progress: Primary gradient
- Center: Percentage 24px bold + caption label

**Streak Indicator**:
- Flame icon (gradient: orange to yellow)
- Number: Large bold text
- Label: "dias consecutivos"
- Background: Subtle gradient card

---

## Screen-Specific Layouts

### Home Screen
- Header: Gradient with greeting "Olá, [Nome]!" + avatar
- Mood Quick Log: Emoji selector card, LG padding
- Today's Reminders: List of 3 upcoming, "Ver todos" link
- Stats Summary: 3-column grid (streak, mood avg, completed habits)
- CTA Card: "Fale com um Profissional" - gradient background

### Professionals Screen
- Hero section: 100px height, gradient, title + subtitle
- Cards grid: Single column, gap MD
- Each card: Icon emoji 48px, title H3, description body, CTA button
- Bottom CTA: "Como Agendar?" section with WhatsApp/Chat buttons

### Listening Space Screen
- Hero: 120px, emoji 💙 64px, title + subtitle
- Benefits cards: 2-column grid on tablet, single on mobile
- "60 minutos gratuitos" card: Highlighted border primary 2px
- Disclaimer: Warning icon + text, yellow background, SM padding
- Contact buttons: Stacked, primary and secondary variants

### Mood History Screen
- Filter tabs: Week/Month/Year (pill shape, primary when active)
- Chart: Full width, 300px height
- Entries list: Chronological, emoji + note preview + timestamp
- Empty state: Illustration (200x200px) + "Comece a registrar seu humor"

### Profile Screen
- Avatar: 80x80px circle, centered, tap to edit
- Name + email: Centered below avatar
- Settings list: Single column cards with chevron-right
- Sections: Account, Notifications, Appearance (Dark Mode toggle), Privacy, Help
- Logout button: Ghost danger variant, bottom

---

## Animations & Interactions

**Micro-interactions** (use sparingly):
- Button press: Scale 0.95, 100ms ease-out
- Checkbox complete: Scale 1.2 → 1.0 + rotate 360°, confetti particles (5 pieces)
- Tab switch: Fade 300ms + slight Y-translate
- Modal open: Fade in 300ms + scale 0.9→1.0
- Toast: Slide in from edge 250ms, fade out 200ms
- Pull to refresh: Rotate spinner, bounce on release

**Page Transitions**:
- Stack push: Slide from right 300ms
- Modal present: Slide from bottom 250ms
- Tab switch: Cross-fade 200ms

**Loading States**:
- Skeleton screens: Shimmer gradient animation (light gray moving left-to-right)
- Spinner: Primary color circular, 40px for full-screen, 20px for buttons
- Progressive image loading: Blur-up from low-res placeholder

---

## Images & Media

**Hero Images**: Use calming nature scenes (sunrise, calm water, soft clouds) in Listening Space and onboarding
**Professional Icons**: Large emoji representations (🧠 💊 ⚖️) at 64px
**Achievement Badges**: Custom illustrated icons (8 total) with gradient backgrounds
**Empty States**: Soft illustrations 200x200px, primary color scheme
**Avatar Placeholders**: User initials in colored circles (color based on name hash)

---

## Accessibility

- Minimum touch target: 44x44px
- Color contrast: WCAG AA (4.5:1 text, 3:1 UI)
- Focus indicators: 2px primary color outline
- Screen reader labels: All interactive elements
- Dark mode: Automatic based on system preference, manual toggle in settings
- Font scaling: Support iOS Dynamic Type / Android font scale
- Reduced motion: Respect accessibility settings, disable animations